import React, { useState } from 'react';
import { API, graphqlOperation, Auth, Storage } from 'aws-amplify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Flex, 
  Heading, 
  Text, 
  Button, 
  Card, 
  TextField,
  TextAreaField,
  SelectField,
  Divider,
  Collection,
  Alert
} from '@aws-amplify/ui-react';
import { createApplication, updateUser, listApplications } from '../graphql/operations';
import { sendNewItemNotification } from '../utils/emailNotifications';

const EnhancedApplicationForm = ({ project, user, onClose, onSuccess }) => {
  const cacheKey = `application_draft_${user.id || user.username}_${project.id}`;
  
  // Load cached data on component mount
  const loadCachedData = () => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        return {
          statement: data.statement || '',
          courses: data.courses || [{ courseName: '', courseNumber: '', grade: '', semester: '', year: '' }]
        };
      }
    } catch (e) {
      console.error('Error loading cached data:', e);
    }
    return {
      statement: '',
      courses: [{ courseName: '', courseNumber: '', grade: '', semester: '', year: '' }]
    };
  };
  
  const cachedData = loadCachedData();
  const [statement, setStatement] = useState(cachedData.statement);
  const [courses, setCourses] = useState(cachedData.courses);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const addCourse = () => {
    if (courses.length < 10) {
      const newCourses = [...courses, { courseName: '', courseNumber: '', grade: '', semester: '', year: '' }];
      setCourses(newCourses);
      saveToDraft(statement, newCourses);
    }
  };

  const removeCourse = (index) => {
    const newCourses = courses.filter((_, i) => i !== index);
    setCourses(newCourses);
    saveToDraft(statement, newCourses);
  };

  const updateCourse = (index, field, value) => {
    const updatedCourses = courses.map((course, i) => 
      i === index ? { ...course, [field]: value } : course
    );
    setCourses(updatedCourses);
    saveToDraft(statement, updatedCourses);
  };
  
  // Save form data to localStorage
  const saveToDraft = (currentStatement, currentCourses) => {
    try {
      const draftData = {
        statement: currentStatement,
        courses: currentCourses,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(cacheKey, JSON.stringify(draftData));
    } catch (e) {
      console.error('Error saving draft:', e);
    }
  };
  
  // Clear draft after successful submission
  const clearDraft = () => {
    try {
      localStorage.removeItem(cacheKey);
    } catch (e) {
      console.error('Error clearing draft:', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate required fields
    if (!statement || statement.trim() === '') {
      setError('Please fill out the required Statement of Interest field.');
      setIsSubmitting(false);
      return;
    }

    // Validate transcript upload if required
    if (project.requiresTranscript && !uploadedFile) {
      setError('This project requires transcript upload. Please upload your transcript.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Check application limit by counting current applications
      const currentApplications = await API.graphql(graphqlOperation(listApplications, { 
        limit: 100
      }));
      const userApplications = currentApplications.data.listApplications.items.filter(
        app => app.studentID === (user.id || user.username) && 
        !['Rejected', 'Cancelled', 'Expired', 'Withdrawn'].includes(app.status)
      );
      
      if (userApplications.length >= 3) {
        setError('You have reached the maximum of 3 applications.');
        return;
      }

      // Validate statement length (around 450 words)
      const wordCount = statement.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
      if (wordCount < 300) {
        setError('Your statement should be at least 300 words. Current count: ' + wordCount);
        return;
      }

      const currentUser = await Auth.currentAuthenticatedUser();
      const userId = currentUser.username;

      // Filter out empty courses
      const validCourses = courses.filter(course => course.courseName.trim());

      let documentKey = null;
      
      // Upload document if provided
      if (uploadedFile) {
        setUploading(true);
        try {
          const fileExtension = uploadedFile.name.split('.').pop();
          const fileName = `applications/${userId}/${project.id}/${Date.now()}.${fileExtension}`;
          
          const result = await Storage.put(fileName, uploadedFile, {
            contentType: uploadedFile.type,
            metadata: {
              studentId: userId,
              projectId: project.id,
              originalName: uploadedFile.name
            }
          });
          
          documentKey = result.key;
        } catch (uploadError) {
          console.error('Error uploading document:', uploadError);
          setError('Failed to upload document. Please try again.');
          return;
        } finally {
          setUploading(false);
        }
      }

      const applicationInput = {
        studentID: userId,
        projectID: project.id,
        statement,
        relevantCourses: validCourses,
        documentKey,
        status: 'Coordinator Review'
      };

      await API.graphql(graphqlOperation(createApplication, { input: applicationInput }));
      
      // Clear draft after successful submission
      clearDraft();
      
      // Send notification to coordinator about new application
      try {
        await sendNewItemNotification(
          'coordinator@gcu.edu', // Replace with actual coordinator email
          'Coordinator',
          'Application',
          project.title,
          user.name,
          user.email
        );
      } catch (emailError) {
        console.log('Email notification prepared (SES integration pending):', emailError);
      }

      onSuccess();
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <Flex direction="column" gap="1rem">
        <Heading level={3}>Apply to: {project.title}</Heading>
        
        <Alert variation="info">
          <Text>
            <strong>Application Guidelines:</strong><br/>
            • You can apply for up to 3 projects total<br/>
            • Your statement should be around 450 words<br/>
            • Address why you're interested and qualified<br/>
            • Include relevant coursework (up to 10 courses)<br/>
            • Your progress is automatically saved as you type
          </Text>
        </Alert>
        
        <Card variation="outlined" backgroundColor="#f8f9fa">
          <Flex direction="column" gap="0.5rem">
            <Text fontWeight="bold">Research Project Description:</Text>
            <div dangerouslySetInnerHTML={{ __html: project.description }} />
            {project.department && <Text><strong>College:</strong> {project.department}</Text>}
            {project.faculty?.name && <Text><strong>Faculty:</strong> {project.faculty.name}</Text>}
            {project.duration && <Text><strong>Duration:</strong> {project.duration}</Text>}
          </Flex>
        </Card>
        
        <Card variation="outlined">
          <Text fontWeight="bold">Student Profile Information:</Text>
          <Text>Student ID: {user.id || user.username}</Text>
          <Text>Program: {user.major || 'Not specified'}</Text>
          <Text>Degree: {user.academicYear || 'Not specified'}</Text>
          <Text>Expected Graduation: {user.expectedGraduation || 'Not specified'}</Text>
          <Text>Research Interests: {user.researchInterests?.join(', ') || 'Not specified'}</Text>
          <Text>Skills: {user.skills?.join(', ') || 'Not specified'}</Text>
          <Text>Availability: {user.availability || 'Not specified'}</Text>
        </Card>

        <Divider />

        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="1rem">
            <Text fontWeight="bold">Statement of Interest *</Text>
            <div style={{ marginBottom: '1rem' }}>
              <ReactQuill
                value={statement}
                onChange={(value) => {
                  setStatement(value);
                  saveToDraft(value, courses);
                }}
                placeholder="Why are you interested in this project? Why are you qualified? What skills can you bring? What classes have you taken that relate? What do you hope to get out of this experience?"
                modules={{
                  toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['clean']
                  ]
                }}
                style={{ minHeight: '380px', height: '380px' }}
              />
            </div>
            <div style={{ marginTop: '1rem', clear: 'both' }}>
              <Text fontSize="0.9rem" color="gray">
                Word count: {statement.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word).length} (aim for ~450 words)
              </Text>
            </div>

            <Divider />

            <Heading level={4}>Relevant Coursework (up to 10 courses)</Heading>
            <Text fontSize="0.9rem">
              Include college-level courses relevant to this project. Do NOT include AP or high school courses.
            </Text>

            <Collection
              items={courses}
              type="list"
              gap="1rem"
              direction="column"
            >
              {(course, index) => (
                <Card key={index} variation="outlined">
                  <Flex direction="column" gap="0.5rem">
                    <Flex justifyContent="space-between" alignItems="center">
                      <Text fontWeight="bold">Course {index + 1}</Text>
                      {courses.length > 1 && (
                        <Button size="small" onClick={() => removeCourse(index)}>
                          Remove
                        </Button>
                      )}
                    </Flex>
                    
                    <Flex direction={{ base: 'column', large: 'row' }} gap="0.5rem">
                      <TextField
                        label="Course Name"
                        value={course.courseName}
                        onChange={(e) => updateCourse(index, 'courseName', e.target.value)}
                        placeholder="e.g. Introduction to Psychology"
                        flex="2"
                      />
                      <TextField
                        label="Course Number"
                        value={course.courseNumber}
                        onChange={(e) => updateCourse(index, 'courseNumber', e.target.value)}
                        placeholder="e.g. PSYC 101"
                        flex="1"
                      />
                    </Flex>
                    
                    <Flex direction={{ base: 'column', large: 'row' }} gap="0.5rem">
                      <SelectField
                        label="Grade"
                        value={course.grade}
                        onChange={(e) => updateCourse(index, 'grade', e.target.value)}
                        flex="1"
                      >
                        <option value="">Select Grade</option>
                        <option value="A+">A+</option>
                        <option value="A">A</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B">B</option>
                        <option value="B-">B-</option>
                        <option value="C+">C+</option>
                        <option value="C">C</option>
                        <option value="C-">C-</option>
                        <option value="D">D</option>
                        <option value="P">P (Pass)</option>
                        <option value="IP">IP (In Progress)</option>
                      </SelectField>
                      
                      <SelectField
                        label="Semester"
                        value={course.semester}
                        onChange={(e) => updateCourse(index, 'semester', e.target.value)}
                        flex="1"
                      >
                        <option value="">Select Semester</option>
                        <option value="Fall">Fall</option>
                        <option value="Spring">Spring</option>
                        <option value="Summer">Summer</option>
                      </SelectField>
                      
                      <TextField
                        label="Year"
                        value={course.year}
                        onChange={(e) => updateCourse(index, 'year', e.target.value)}
                        placeholder="e.g. 2024"
                        flex="1"
                      />
                    </Flex>
                  </Flex>
                </Card>
              )}
            </Collection>

            {courses.length < 10 && (
              <Button onClick={addCourse} variation="link">
                + Add Another Course
              </Button>
            )}
            
            <Divider />
            
            <Flex direction="column" gap="0.5rem">
              <Text fontWeight="bold">
                Supporting Documents {project.requiresTranscript ? '(Required - Transcript)' : '(Optional)'}
              </Text>
              <Text fontSize="0.9rem" color="gray">
                {project.requiresTranscript 
                  ? 'This project requires transcript upload. Please upload your official or unofficial transcript.'
                  : 'Upload additional documents that support your application (resume, portfolio, etc.)'}
              </Text>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={(e) => setUploadedFile(e.target.files[0])}
                style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                required={project.requiresTranscript}
              />
              {uploadedFile && (
                <Text fontSize="0.9rem" color="green">
                  Selected: {uploadedFile.name}
                </Text>
              )}
            </Flex>

            {error && <Text color="red">{error}</Text>}

            <Divider />

            <Flex gap="1rem">
              <Button 
                onClick={onClose} 
                backgroundColor="white"
                color="black"
                border="1px solid black"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                backgroundColor="white"
                color="black"
                border="1px solid black"
                isLoading={isSubmitting || uploading}
              >
                {uploading ? 'Uploading Document...' : 'Submit Application'}
              </Button>
            </Flex>
          </Flex>
        </form>
      </Flex>
    </Card>
  );
};

export default EnhancedApplicationForm;
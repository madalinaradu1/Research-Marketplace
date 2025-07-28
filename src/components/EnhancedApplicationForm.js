import React, { useState } from 'react';
import { API, graphqlOperation, Auth } from 'aws-amplify';
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

const EnhancedApplicationForm = ({ project, user, onClose, onSuccess }) => {
  const [statement, setStatement] = useState('');
  const [courses, setCourses] = useState([{ courseName: '', courseNumber: '', grade: '', semester: '', year: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const addCourse = () => {
    if (courses.length < 10) {
      setCourses([...courses, { courseName: '', courseNumber: '', grade: '', semester: '', year: '' }]);
    }
  };

  const removeCourse = (index) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const updateCourse = (index, field, value) => {
    const updatedCourses = courses.map((course, i) => 
      i === index ? { ...course, [field]: value } : course
    );
    setCourses(updatedCourses);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

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
      const wordCount = statement.trim().split(/\s+/).length;
      if (wordCount < 300) {
        setError('Your statement should be at least 300 words. Current count: ' + wordCount);
        return;
      }

      const currentUser = await Auth.currentAuthenticatedUser();
      const userId = currentUser.username;

      // Filter out empty courses
      const validCourses = courses.filter(course => course.courseName.trim());

      const applicationInput = {
        studentID: userId,
        projectID: project.id,
        statement,
        relevantCourses: validCourses,
        status: 'Faculty Review'
      };

      await API.graphql(graphqlOperation(createApplication, { input: applicationInput }));

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
            • Include relevant coursework (up to 10 courses)
          </Text>
        </Alert>
        
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
            <TextAreaField
              label="Statement of Interest *"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Why are you interested in this project? Why are you qualified? What skills can you bring? What classes have you taken that relate? What do you hope to get out of this experience?"
              rows={10}
              required
            />
            <Text fontSize="0.9rem" color="gray">
              Word count: {statement.trim().split(/\s+/).filter(word => word).length} (aim for ~450 words)
            </Text>

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

            {error && <Text color="red">{error}</Text>}

            <Divider />

            <Flex gap="1rem">
              <Button onClick={onClose} variation="link">
                Cancel
              </Button>
              <Button 
                type="submit" 
                variation="primary"
                isLoading={isSubmitting}
              >
                Submit Application
              </Button>
            </Flex>
          </Flex>
        </form>
      </Flex>
    </Card>
  );
};

export default EnhancedApplicationForm;
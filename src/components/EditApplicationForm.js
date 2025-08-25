import React, { useState, useEffect } from 'react';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { 
  Flex, 
  Heading, 
  Text, 
  Button, 
  Card, 
  TextAreaField,
  TextField,
  SelectField,
  Collection,
  Divider,
  Alert,
  View
} from '@aws-amplify/ui-react';
import { updateApplication } from '../graphql/operations';

const EditApplicationForm = ({ application, onClose, onSuccess }) => {
  const cacheKey = `edit_application_${application.id}`;
  
  // Load cached data
  const loadCachedData = () => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        return {
          statement: data.statement || application.statement || '',
          courses: data.courses || application.relevantCourses || []
        };
      }
    } catch (e) {
      console.error('Error loading cached data:', e);
    }
    return {
      statement: application.statement || '',
      courses: application.relevantCourses || []
    };
  };
  
  const cachedData = loadCachedData();
  const [statement, setStatement] = useState(cachedData.statement);
  const [courses, setCourses] = useState(cachedData.courses);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(false);
  const [documentUrl, setDocumentUrl] = useState(null);
  
  // Auto-save function
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
  
  // Auto-save when data changes
  useEffect(() => {
    saveToDraft(statement, courses);
  }, [statement, courses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate statement length
      const wordCount = statement.trim().split(/\s+/).length;
      if (wordCount < 300) {
        setError('Your statement should be at least 300 words. Current count: ' + wordCount);
        return;
      }

      let documentKey = application.documentKey;
      
      // Upload new document if provided
      if (uploadedFile) {
        setUploading(true);
        try {
          const fileExtension = uploadedFile.name.split('.').pop();
          const fileName = `applications/${application.studentID}/${application.projectID}/${Date.now()}.${fileExtension}`;
          
          const result = await Storage.put(fileName, uploadedFile, {
            contentType: uploadedFile.type,
            metadata: {
              studentId: application.studentID,
              projectId: application.projectID,
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

      // Determine which reviewer to return to based on who has notes (who returned it)
      let newStatus = 'Faculty Review'; // Default to faculty
      
      // Check who provided feedback/notes - they are the ones who returned it
      if (application.coordinatorNotes) {
        // Coordinator has notes - coordinator returned it, send back to coordinator
        newStatus = 'Coordinator Review';
      } else if (application.facultyNotes) {
        // Faculty has notes - faculty returned it
        newStatus = 'Faculty Review';
      } else {
        // Default to coordinator review for new workflow
        newStatus = 'Coordinator Review';
      }
      
      console.log('Resubmitting application:', {
        applicationId: application.id,
        currentStatus: application.status,
        newStatus,
        hasAdminNotes: !!application.adminNotes,
        hasCoordinatorNotes: !!application.coordinatorNotes,
        hasFacultyNotes: !!application.facultyNotes
      });

      const updateInput = {
        id: application.id,
        statement,
        documentKey,
        relevantCourses: courses.filter(course => course.courseName.trim()),
        status: newStatus
      };

      await API.graphql(graphqlOperation(updateApplication, { input: updateInput }));
      clearDraft();
      onSuccess();
    } catch (err) {
      console.error('Error updating application:', err);
      setError('Failed to update application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <Flex direction="column" gap="1rem">
        <Heading level={3}>Edit Application: {application.project?.title}</Heading>
        
        <Alert variation="warning">
          <Text>
            Your application was returned for revision. Please update your statement and/or upload additional documents as requested, then resubmit.
          </Text>
        </Alert>

        {/* Show feedback from reviewers */}
        {(application.facultyNotes || application.coordinatorNotes || application.adminNotes) && (
          <Card variation="outlined">
            <Text fontWeight="bold">Coordinator Feedback:</Text>
            {application.facultyNotes && (
              <Text><strong>Faculty:</strong> {application.facultyNotes}</Text>
            )}
            {application.coordinatorNotes && (
              <Text style={{ whiteSpace: 'pre-wrap' }}>{application.coordinatorNotes}</Text>
            )}
            {application.adminNotes && (
              <Text><strong>Admin:</strong> {application.adminNotes}</Text>
            )}
          </Card>
        )}
        
        <Divider />
        
        {/* Student Information */}
        <Flex direction="column" gap="0.5rem">
          <Text fontWeight="bold">Student Information</Text>
          <Text>Student ID: {application.studentID}</Text>
          <Text>Name: {application.student?.name || 'Not specified'}</Text>
          <Text>Email: {application.student?.email || 'Not specified'}</Text>
          <Text>Program: {application.student?.major || 'Not specified'}</Text>
          <Text>Academic Year: {application.student?.academicYear || 'Not specified'}</Text>
          <Text>Expected Graduation: {application.student?.expectedGraduation || 'Not specified'}</Text>
          <Text>GPA: {application.student?.gpa || 'Not specified'}</Text>
        </Flex>
        
        {/* Relevant Coursework */}
        <Divider />
        <Flex direction="column" gap="0.5rem">
          <Text fontWeight="bold">Relevant Coursework</Text>
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
                      <Button size="small" onClick={() => {
                        const newCourses = courses.filter((_, i) => i !== index);
                        setCourses(newCourses);
                        saveToDraft(statement, newCourses);
                      }}>
                        Remove
                      </Button>
                    )}
                  </Flex>
                  
                  <Flex direction={{ base: 'column', large: 'row' }} gap="0.5rem">
                    <TextField
                      label="Course Name"
                      value={course.courseName}
                      onChange={(e) => {
                        const updatedCourses = courses.map((c, i) => 
                          i === index ? { ...c, courseName: e.target.value } : c
                        );
                        setCourses(updatedCourses);
                        saveToDraft(statement, updatedCourses);
                      }}
                      placeholder="e.g. Introduction to Psychology"
                      flex="2"
                    />
                    <TextField
                      label="Course Number"
                      value={course.courseNumber}
                      onChange={(e) => {
                        const updatedCourses = courses.map((c, i) => 
                          i === index ? { ...c, courseNumber: e.target.value } : c
                        );
                        setCourses(updatedCourses);
                        saveToDraft(statement, updatedCourses);
                      }}
                      placeholder="e.g. PSYC 101"
                      flex="1"
                    />
                  </Flex>
                  
                  <Flex direction={{ base: 'column', large: 'row' }} gap="0.5rem">
                    <SelectField
                      label="Grade"
                      value={course.grade}
                      onChange={(e) => {
                        const updatedCourses = courses.map((c, i) => 
                          i === index ? { ...c, grade: e.target.value } : c
                        );
                        setCourses(updatedCourses);
                        saveToDraft(statement, updatedCourses);
                      }}
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
                      onChange={(e) => {
                        const updatedCourses = courses.map((c, i) => 
                          i === index ? { ...c, semester: e.target.value } : c
                        );
                        setCourses(updatedCourses);
                        saveToDraft(statement, updatedCourses);
                      }}
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
                      onChange={(e) => {
                        const updatedCourses = courses.map((c, i) => 
                          i === index ? { ...c, year: e.target.value } : c
                        );
                        setCourses(updatedCourses);
                        saveToDraft(statement, updatedCourses);
                      }}
                      placeholder="e.g. 2024"
                      flex="1"
                    />
                  </Flex>
                </Flex>
              </Card>
            )}
          </Collection>
          
          {courses.length < 10 && (
            <Button 
              size="small" 
              onClick={() => {
                const newCourses = [...courses, { courseName: '', courseNumber: '', grade: '', semester: '', year: '' }];
                setCourses(newCourses);
                saveToDraft(statement, newCourses);
              }}
            >
              + Add Course
            </Button>
          )}
        </Flex>
        
        {/* Current Supporting Documents */}
        {application.documentKey && (
          <>
            <Divider />
            <Flex direction="column" gap="0.5rem">
              <Text fontWeight="bold">Supporting Documents</Text>
              <Flex gap="0.5rem">
                <Button size="small" onClick={async () => {
                  try {
                    const url = await Storage.get(application.documentKey, { 
                      expires: 300
                    });
                    setDocumentUrl(url);
                    setViewingDocument(true);
                  } catch (err) {
                    console.error('Error loading document:', err);
                    setError('Failed to load document. Please try again.');
                  }
                }}>View</Button>
                <Button size="small" backgroundColor="white" color="black" border="1px solid black" onClick={async () => {
                  try {
                    const url = await Storage.get(application.documentKey, { 
                      expires: 300
                    });
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'supporting-document';
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  } catch (err) {
                    console.error('Error downloading document:', err);
                    setError('Failed to download document. Please try again.');
                  }
                }}>Download</Button>
              </Flex>
            </Flex>
          </>
        )}

        <Divider />

        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="1rem">
            <TextAreaField
              label="Statement of Interest *"
              value={statement}
              onChange={(e) => {
                setStatement(e.target.value);
                saveToDraft(e.target.value, courses);
              }}
              placeholder="Update your statement based on the feedback provided..."
              rows={10}
              required
            />
            <Text fontSize="0.9rem" color="gray">
              Word count: {statement.trim().split(/\s+/).filter(word => word).length} (aim for ~450 words)
            </Text>

            <Divider />
            
            <Flex direction="column" gap="0.5rem">
              <Text fontWeight="bold">Supporting Documents (Optional)</Text>
              <Text fontSize="0.9rem" color="gray">
                Upload additional documents or replace existing document
              </Text>
              
              <input
                type="file"
accept="*"
                onChange={(e) => setUploadedFile(e.target.files[0])}
                style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              {uploadedFile && (
                <Text fontSize="0.9rem" color="green">
                  New file selected: {uploadedFile.name}
                </Text>
              )}
            </Flex>

            {error && <Text color="red">{error}</Text>}

            <Divider />

            <Flex gap="0.5rem">
              <Button 
                onClick={onClose} 
                backgroundColor="white"
                color="black"
                border="1px solid black"
                size="small"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="small"
                isLoading={isSubmitting || uploading}
              >
                {uploading ? 'Uploading Document...' : 'Resubmit Application'}
              </Button>
            </Flex>
          </Flex>
        </form>
        
        {/* Document Viewer Modal */}
        {viewingDocument && documentUrl && (
          <View
            position="fixed"
            top="0"
            left="0"
            width="100vw"
            height="100vh"
            backgroundColor="rgba(0, 0, 0, 0.8)"
            style={{ zIndex: 2000 }}
            onClick={() => {
              setViewingDocument(false);
              setDocumentUrl(null);
            }}
          >
            <Flex
              justifyContent="center"
              alignItems="center"
              height="100%"
              padding="2rem"
            >
              <Card
                maxWidth="90vw"
                width="100%"
                maxHeight="100vh"
                height="100%"
                onClick={(e) => e.stopPropagation()}
              >
                <Flex direction="column" height="100%">
                  <Flex justifyContent="space-between" alignItems="center" padding="1rem">
                    <Heading level={4}>Supporting Document</Heading>
                    <Button size="small" onClick={() => {
                      setViewingDocument(false);
                      setDocumentUrl(null);
                    }}>Close</Button>
                  </Flex>
                  <Divider />
                  <View flex="1" style={{ overflow: 'auto', padding: '1rem' }}>
                    {application.documentKey && application.documentKey.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                      <img
                        src={documentUrl}
                        alt="Supporting Document"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                          display: 'block',
                          margin: '0 auto'
                        }}
                      />
                    ) : application.documentKey && application.documentKey.toLowerCase().match(/\.(pdf|doc|docx|txt)$/i) ? (
                      <iframe
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(documentUrl)}&embedded=true`}
                        width="100%"
                        height="100%"
                        style={{ border: 'none', minHeight: '500px' }}
                        title="Supporting Document"
                      />
                    ) : (
                      <Flex direction="column" alignItems="center" justifyContent="center" height="100%" gap="1rem">
                        <Text>Document preview not available for this file type.</Text>
                        <Button onClick={() => {
                          const link = document.createElement('a');
                          link.href = documentUrl;
                          link.download = 'supporting-document';
                          link.target = '_blank';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}>Download Document</Button>
                      </Flex>
                    )}
                  </View>
                </Flex>
              </Card>
            </Flex>
          </View>
        )}

      </Flex>
    </Card>
  );
};

export default EditApplicationForm;
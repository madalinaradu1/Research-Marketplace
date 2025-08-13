import React, { useState } from 'react';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { 
  Flex, 
  Heading, 
  Text, 
  Button, 
  Card, 
  TextAreaField,
  Divider,
  Alert
} from '@aws-amplify/ui-react';
import { updateApplication } from '../graphql/operations';

const EditApplicationForm = ({ application, onClose, onSuccess }) => {
  const [statement, setStatement] = useState(application.statement || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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
      if (application.adminNotes && !application.coordinatorNotes && !application.facultyNotes) {
        // Only admin has notes - admin returned it
        newStatus = 'Admin Review';
      } else if (application.coordinatorNotes && !application.adminNotes) {
        // Coordinator has notes and no admin notes - coordinator returned it
        newStatus = 'Department Review';
      } else if (application.facultyNotes && !application.coordinatorNotes && !application.adminNotes) {
        // Only faculty has notes - faculty returned it
        newStatus = 'Faculty Review';
      } else {
        // Multiple notes or unclear - default to faculty
        newStatus = 'Faculty Review';
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
        status: newStatus
      };

      await API.graphql(graphqlOperation(updateApplication, { input: updateInput }));
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
        {application.relevantCourses && application.relevantCourses.length > 0 && (
          <>
            <Divider />
            <Flex direction="column" gap="0.5rem">
              <Text fontWeight="bold">Relevant Coursework</Text>
              {application.relevantCourses.map((course, index) => (
                <Card key={index} variation="outlined" padding="0.5rem">
                  <Flex justifyContent="space-between">
                    <Text>{course.courseName} ({course.courseNumber})</Text>
                    <Text>Grade: {course.grade} | {course.semester} {course.year}</Text>
                  </Flex>
                </Card>
              ))}
            </Flex>
          </>
        )}
        
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
                    window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`, '_blank');
                  } catch (err) {
                    console.error('Error loading document:', err);
                    setError('Failed to load document. Please try again.');
                  }
                }}>View Document</Button>
                <Button size="small" backgroundColor="white" color="black" border="1px solid black" onClick={async () => {
                  try {
                    const url = await Storage.get(application.documentKey, { 
                      expires: 300
                    });
                    const response = await fetch(url);
                    const blob = await response.blob();
                    const downloadUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = downloadUrl;
                    link.download = 'supporting-document';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(downloadUrl);
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
              onChange={(e) => setStatement(e.target.value)}
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
                accept=".pdf,.doc,.docx,.txt"
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
      </Flex>
    </Card>
  );
};

export default EditApplicationForm;
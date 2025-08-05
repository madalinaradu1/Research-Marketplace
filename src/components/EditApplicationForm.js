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
            <strong>Application Returned:</strong><br/>
            Your application was returned for revision. Please update your statement and/or upload additional documents as requested, then resubmit.
          </Text>
        </Alert>

        {/* Show feedback from reviewers */}
        {(application.facultyNotes || application.coordinatorNotes || application.adminNotes) && (
          <Card variation="outlined">
            <Text fontWeight="bold">Reviewer Feedback:</Text>
            {application.facultyNotes && (
              <Text><strong>Faculty:</strong> {application.facultyNotes}</Text>
            )}
            {application.coordinatorNotes && (
              <Text><strong>Coordinator:</strong> {application.coordinatorNotes}</Text>
            )}
            {application.adminNotes && (
              <Text><strong>Admin:</strong> {application.adminNotes}</Text>
            )}
          </Card>
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
              
              {application.documentKey && (
                <Text fontSize="0.9rem" color="blue">
                  Current document available for download in application review
                </Text>
              )}
              
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

            <Flex gap="1rem">
              <Button onClick={onClose} variation="link">
                Cancel
              </Button>
              <Button 
                type="submit" 
                variation="primary"
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
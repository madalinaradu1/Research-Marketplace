import React, { useState } from 'react';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { 
  Flex, 
  Heading, 
  Text, 
  Button, 
  Card, 
  Divider, 
  TextAreaField,
  SelectField,
  useTheme,
  View,
  Collection
} from '@aws-amplify/ui-react';
import { updateApplication, updateProject } from '../graphql/operations';
import { sendStatusChangeNotification } from '../utils/emailNotifications';

const ApplicationReview = ({ application, userRole, onUpdate, hideRelevantCourses = false, hideStatusUpdate = false }) => {
  const [notes, setNotes] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [acceptanceReason, setAcceptanceReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(false);
  const [documentUrl, setDocumentUrl] = useState(null);
  const { tokens } = useTheme();
  
  // Download resume file
  const downloadProposal = async () => {
    if (!application.resumeKey) return;
    
    try {
      const url = await Storage.get(application.resumeKey, { expires: 60 });
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error downloading resume:', err);
      setError('Failed to download resume. Please try again.');
    }
  };
  
  // Update application status
  const updateStatus = async () => {
    if (!statusUpdate) {
      setError('Please select a status update');
      return;
    }
    
    if (statusUpdate === 'Rejected' && !rejectionReason.trim()) {
      setError('Rejection reason is required when rejecting an application');
      return;
    }
    
    if ((statusUpdate === 'Approved' || statusUpdate === 'Selected') && !acceptanceReason.trim()) {
      setError('Acceptance reason is required when approving an application');
      return;
    }
    
    if (statusUpdate === 'Returned' && !notes.trim()) {
      setError('Return notes are required when returning an application');
      return;
    }
    
    if (statusUpdate === 'Coordinator Review' && !notes.trim()) {
      setError('Notes to coordinator are required when sending to coordinator');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const input = {
        id: application.id,
        status: statusUpdate
      };
      
      // Handle special case for faculty selecting a student
      if (statusUpdate === 'Selected' && userRole === 'Faculty') {
        input.status = 'Approved';
        input.isSelected = true;
        input.selectedAt = new Date().toISOString();
      } else if (statusUpdate === 'Approved' && userRole === 'Faculty' && application.status === 'Approved') {
        input.isSelected = true;
        input.selectedAt = new Date().toISOString();
      }
      
      // Add notes based on user role
      if (notes && notes.trim()) {
        if (userRole === 'Faculty') {
          input.facultyNotes = notes;
        } else if (userRole === 'Coordinator') {
          input.coordinatorNotes = notes;
        }
      }
      
      // Add rejection or acceptance reasons
      if (statusUpdate === 'Rejected' && rejectionReason && rejectionReason.trim()) {
        input.rejectionReason = rejectionReason;
      } else if ((statusUpdate === 'Approved' || statusUpdate === 'Selected') && acceptanceReason && acceptanceReason.trim()) {
        input.acceptanceReason = acceptanceReason;
      }
      
      console.log('Updating application with input:', input);
      
      const response = await API.graphql(graphqlOperation(updateApplication, { input }));
      
      // Send email notification for status change
      try {
        await sendStatusChangeNotification(
          application.student?.email,
          application.student?.name,
          'Application',
          application.project?.title,
          application.status,
          statusUpdate,
          userRole === 'Faculty' ? 'Faculty' : userRole === 'Coordinator' ? 'Coordinator' : 'Admin',
          notes
        );
      } catch (emailError) {
        console.log('Email notification prepared (SES integration pending):', emailError);
      }
      
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error updating application:', err);
      
      // Log detailed GraphQL error information
      if (err.errors && err.errors.length > 0) {
        console.error('GraphQL Error Details:');
        err.errors.forEach((error, index) => {
          console.error(`Error ${index + 1}:`);
          console.error('  Message:', error.message);
          console.error('  ErrorType:', error.errorType);
          console.error('  Path:', error.path);
          console.error('  Locations:', error.locations);
        });
        setError(`Failed to update application: ${err.errors[0].message}`);
      } else {
        console.error('Full error object:', JSON.stringify(err, null, 2));
        setError('Failed to update application. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get available status options based on current status and user role
  const getStatusOptions = () => {
    if (userRole === 'Faculty') {
      if (application.status === 'Faculty Review') {
        return [
          { value: 'Selected', label: 'Select Student for Project' },
          { value: 'Coordinator Review', label: 'Send to Coordinator' },
          { value: 'Returned', label: 'Return to Student' },
          { value: 'Rejected', label: 'Reject Application' }
        ];
      } else if (application.status === 'Approved' && !application.isSelected) {
        return [
          { value: 'Approved', label: 'Select Student' }
        ];
      }
    } else if (userRole === 'Coordinator') {
      if (application.status === 'Coordinator Review') {
        return [
          { value: 'Faculty Review', label: 'Send to Faculty' },
          { value: 'Approved', label: 'Approve Application' },
          { value: 'Returned', label: 'Return to Student' },
          { value: 'Rejected', label: 'Reject Application' }
        ];
      }
    }
    
    return [];
  };
  
  const statusOptions = getStatusOptions();
  
  return (
    <Card backgroundColor="white" borderRadius="8px" height="100%">
      <Flex direction="column" gap="1.5rem" height="100%" padding="2rem">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading level={3} color="#2d3748">Review Application</Heading>
        </Flex>
        
        <Card backgroundColor="#f8fafc" padding="1.5rem" border="1px solid #e2e8f0">
          <Heading level={5} color="#2d3748" marginBottom="1rem">Student Information</Heading>
          <Flex direction="column" gap="0.75rem">
            <Flex justifyContent="space-between">
              <Text fontWeight="600" color="#4a5568">Name:</Text>
              <Text color="#2d3748">{application.student?.name || 'Not provided'}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontWeight="600" color="#4a5568">Email:</Text>
              <Text color="#2d3748">{application.student?.email || 'Not provided'}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontWeight="600" color="#4a5568">Program:</Text>
              <Text color="#2d3748">{application.student?.major || 'Not provided'}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontWeight="600" color="#4a5568">Academic Year:</Text>
              <Text color="#2d3748">{application.student?.academicYear || 'Not provided'}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontWeight="600" color="#4a5568">Expected Graduation:</Text>
              <Text color="#2d3748">{application.student?.expectedGraduation || 'Not provided'}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontWeight="600" color="#4a5568">GPA:</Text>
              <Text color="#2d3748">{application.student?.gpa || 'Not provided'}</Text>
            </Flex>
          </Flex>
        </Card>
        
        <Card backgroundColor="#f8fafc" padding="1.5rem" border="1px solid #e2e8f0">
          <Heading level={5} color="#2d3748" marginBottom="1rem">Application Details</Heading>
          <Flex direction="column" gap="0.75rem">
            <Flex justifyContent="space-between">
              <Text fontWeight="600" color="#4a5568">Status:</Text>
              <Text color="#2d3748">{application.status}</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text fontWeight="600" color="#4a5568">Submitted:</Text>
              <Text color="#2d3748">{new Date(application.createdAt).toLocaleDateString()}</Text>
            </Flex>
          </Flex>
        </Card>
        
        {application.statement && (
          <Card backgroundColor="#f8fafc" padding="1.5rem" border="1px solid #e2e8f0">
            <Heading level={5} color="#2d3748" marginBottom="1rem">Statement of Interest</Heading>
            <Card backgroundColor="white" padding="1rem" border="1px solid #e2e8f0">
              <div dangerouslySetInnerHTML={{ __html: application.statement }} />
            </Card>
          </Card>
        )}
        
        <Card backgroundColor="#f8fafc" padding="1.5rem" border="1px solid #e2e8f0">
          <Heading level={5} color="#2d3748" marginBottom="1rem">Relevant Coursework</Heading>
          {application.relevantCourses && application.relevantCourses.length > 0 ? (
            <Flex direction="column" gap="0.75rem">
              {application.relevantCourses.map((course, index) => (
                <Card key={index} backgroundColor="white" padding="1rem" border="1px solid #e2e8f0">
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontWeight="600" color="#2d3748">{course.courseName} ({course.courseNumber})</Text>
                    <Text fontSize="0.9rem" color="#4a5568">Grade: {course.grade} | {course.semester} {course.year}</Text>
                  </Flex>
                </Card>
              ))}
            </Flex>
          ) : (
            <Text fontStyle="italic" color="#718096">Coursework data not available</Text>
          )}
        </Card>
        

        
        
        {(application.resumeKey || application.documentKey || application.transcriptLink) && (
          <Card backgroundColor="#f8fafc" padding="1.5rem" border="1px solid #e2e8f0">
            <Heading level={5} color="#2d3748" marginBottom="1rem">Documents</Heading>
            <Flex direction="column" gap="0.75rem">
              {application.resumeKey && (
                <Button 
                  size="small" 
                  backgroundColor="#4299e1" 
                  color="white"
                  onClick={downloadProposal}
                >
                  Download Resume
                </Button>
              )}
              {application.documentKey && (
                <Button 
                  size="small" 
                  backgroundColor="#4299e1" 
                  color="white"
                  onClick={async () => {
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
                  }}
                >
                  View Supporting Document
                </Button>
              )}
              {application.transcriptLink && (
                <Button 
                  size="small" 
                  backgroundColor="#4299e1" 
                  color="white"
                  onClick={() => window.open(application.transcriptLink, '_blank')}
                >
                  View Transcript
                </Button>
              )}
            </Flex>
          </Card>
        )}
        

        
        {(application.facultyNotes || application.coordinatorNotes || application.adminNotes || application.rejectionReason || application.acceptanceReason) && (
          <Card backgroundColor="#f8fafc" padding="1.5rem" border="1px solid #e2e8f0">
            <Heading level={5} color="#2d3748" marginBottom="1rem">Review Notes</Heading>
            <Flex direction="column" gap="0.75rem">
              {application.facultyNotes && (
                <Card backgroundColor="#fff3cd" padding="1rem" border="1px solid #ffeaa7">
                  <Text fontWeight="600" color="#856404">Faculty:</Text>
                  <Text color="#856404" marginTop="0.5rem">{application.facultyNotes}</Text>
                </Card>
              )}
              {application.coordinatorNotes && (
                <Card backgroundColor="#e7f3ff" padding="1rem" border="1px solid #bee3f8">
                  <Text fontWeight="600" color="#2b6cb0">Coordinator:</Text>
                  <Text color="#2b6cb0" marginTop="0.5rem">{application.coordinatorNotes}</Text>
                </Card>
              )}
              {application.adminNotes && (
                <Card backgroundColor="#f0f8f0" padding="1rem" border="1px solid #c6f6d5">
                  <Text fontWeight="600" color="#276749">Admin:</Text>
                  <Text color="#276749" marginTop="0.5rem">{application.adminNotes}</Text>
                </Card>
              )}
              {application.rejectionReason && (
                <Card backgroundColor="#fed7d7" padding="1rem" border="1px solid #feb2b2">
                  <Text fontWeight="600" color="#c53030">Rejection Reason:</Text>
                  <Text color="#c53030" marginTop="0.5rem">{application.rejectionReason}</Text>
                </Card>
              )}
              {application.acceptanceReason && (
                <Card backgroundColor="#c6f6d5" padding="1rem" border="1px solid #9ae6b4">
                  <Text fontWeight="600" color="#276749">Acceptance Reason:</Text>
                  <Text color="#276749" marginTop="0.5rem">{application.acceptanceReason}</Text>
                </Card>
              )}
            </Flex>
          </Card>
        )}
        
        {statusOptions.length > 0 && !hideStatusUpdate && (
          <Card backgroundColor="#f8fafc" padding="1.5rem" border="1px solid #e2e8f0">
            <Flex direction="column" gap="1rem">
              <Heading level={5} color="#2d3748">Update Application Status</Heading>
              
              <SelectField
                label="Action"
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value)}
              >
                <option value="">Select an action</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
              

              
              {statusUpdate === 'Rejected' && (
                <TextAreaField
                  label="Rejection Reason (Required)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this application is being rejected..."
                  required
                />
              )}
              
              {(statusUpdate === 'Approved' || statusUpdate === 'Selected') && (
                <TextAreaField
                  label="Acceptance Reason (Required)"
                  value={acceptanceReason}
                  onChange={(e) => setAcceptanceReason(e.target.value)}
                  placeholder="Explain why this application is being accepted..."
                  required
                />
              )}
              
              {statusUpdate === 'Returned' && (
                <TextAreaField
                  label="Return Notes (Required)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain what needs to be changed or added..."
                  required
                />
              )}
              
              {statusUpdate === 'Coordinator Review' && (
                <TextAreaField
                  label="Notes to Coordinator (Required)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes for the coordinator..."
                  required
                />
              )}
              
              {error && <Text color="red">{error}</Text>}
              
              <Flex justifyContent="flex-end">
                <Button 
                  onClick={updateStatus}
                  backgroundColor="#4299e1"
                  color="white"
                  size="small"
                  isLoading={isSubmitting}
                >
                  Submit Decision
                </Button>
              </Flex>
            </Flex>
          </Card>
        )}
        

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
                    <Flex gap="0.5rem">
                      <Button size="small" onClick={() => {
                        const link = document.createElement('a');
                        link.href = documentUrl;
                        link.download = 'supporting-document';
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}>Download</Button>
                      <Button size="small" onClick={() => {
                        setViewingDocument(false);
                        setDocumentUrl(null);
                      }}>Close</Button>
                    </Flex>
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

export default ApplicationReview;
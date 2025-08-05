import React, { useState } from 'react';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { 
  Flex, 
  Heading, 
  Text, 
  Button, 
  Badge, 
  Card, 
  Divider, 
  TextAreaField,
  TextField,
  useTheme,
  View,
  Collection
} from '@aws-amplify/ui-react';
import { updateApplication } from '../graphql/operations';
import EnhancedApplicationForm from './EnhancedApplicationForm';
import EditApplicationForm from './EditApplicationForm';

const ApplicationStatus = ({ application, isStudent = true, onUpdate, showReturnedSection = true }) => {
  const [withdrawReason, setWithdrawReason] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(false);
  const [documentUrl, setDocumentUrl] = useState(null);
  const { tokens } = useTheme();
  
  // Get status color
  const getStatusColor = (status) => {
    if (!status) return tokens.colors.neutral[60];
    
    switch (status) {
      case 'Draft':
        return tokens.colors.neutral[60];
      case 'Faculty Review':
        return tokens.colors.blue[60];
      case 'Department Review':
        return tokens.colors.purple[60];
      case 'Admin Review':
        return tokens.colors.orange[60];
      case 'Approved':
        return tokens.colors.green[60];
      case 'Returned':
      case 'Rejected':
        return tokens.colors.red[60];
      case 'Cancelled':
        return tokens.colors.neutral[80];
      case 'Expired':
        return tokens.colors.neutral[40];
      default:
        return tokens.colors.neutral[60];
    }
  };
  
  // Handle submit to faculty
  const handleSubmitToFaculty = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const input = {
        id: application.id,
        status: 'Faculty Review',
        submittedToFacultyAt: new Date().toISOString()
      };
      
      await API.graphql(graphqlOperation(updateApplication, { input }));
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle withdraw application
  const handleWithdraw = async () => {
    if (!withdrawReason) {
      setError('Please provide a reason for withdrawing your application');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const input = {
        id: application.id,
        status: 'Cancelled',
        statusDetail: `Cancelled (${application.status})`,
        withdrawReason,
        cancelledAt: new Date().toISOString()
      };
      
      await API.graphql(graphqlOperation(updateApplication, { input }));
      setIsWithdrawing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error withdrawing application:', err);
      setError('Failed to withdraw application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Download proposal file
  const downloadProposal = async () => {
    if (!application.proposalFileKey) return;
    
    try {
      const url = await Storage.get(application.proposalFileKey, { expires: 60 });
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error downloading proposal:', err);
      setError('Failed to download proposal. Please try again.');
    }
  };
  
  return (
    <Card>
      <Flex direction="column" gap="1rem">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading level={4}>{application.project?.title || 'Research Application'}</Heading>
          <Badge
            backgroundColor={getStatusColor(application.status)}
            color="white"
          >
            {application.status}
          </Badge>
        </Flex>
        
        {application.statusDetail && (
          <Text fontStyle="italic">{application.statusDetail}</Text>
        )}
        
        <Divider />
        
        <Flex direction="column" gap="0.5rem">
          <Text fontWeight="bold">Application Details</Text>
          <Text>Project: {application.project?.title || 'Unknown Project'}</Text>
          <Text>Department: {application.project?.department || 'Unknown Department'}</Text>
          <Text>Status: {application.status}</Text>
          {application.statusDetail && (
            <Text>Status Detail: {application.statusDetail}</Text>
          )}
          <Text>Submitted: {new Date(application.createdAt).toLocaleDateString()}</Text>
          <Button size="small" onClick={() => setShowDetails(true)} marginTop="0.5rem">
            View Details
          </Button>
        </Flex>
        
        <Divider />
        
        <Flex direction="column" gap="0.5rem">
          <Text fontWeight="bold">Status Timeline</Text>
          <Text>Created: {new Date(application.createdAt).toLocaleString()}</Text>
          {application.updatedAt !== application.createdAt && (
            <Text>Last Updated: {new Date(application.updatedAt).toLocaleString()}</Text>
          )}
          {application.submittedToFacultyAt && (
            <Text>Submitted to Faculty: {new Date(application.submittedToFacultyAt).toLocaleString()}</Text>
          )}
          {application.approvedAt && (
            <Text>Approved: {new Date(application.approvedAt).toLocaleString()}</Text>
          )}
          {application.returnedAt && (
            <Text>Returned: {new Date(application.returnedAt).toLocaleString()}</Text>
          )}
          {application.cancelledAt && (
            <Text>Cancelled: {new Date(application.cancelledAt).toLocaleString()}</Text>
          )}
        </Flex>
        
        {application.proposalFileKey && (
          <Button onClick={downloadProposal}>Download Proposal</Button>
        )}
        
        {isStudent && application.status === 'Draft' && (
          <Button 
            onClick={handleSubmitToFaculty}
            variation="primary"
            isLoading={isSubmitting}
            width="auto"
          >
            Submit to Faculty
          </Button>
        )}
        
        {isStudent && (application.status === 'Returned' || application.status === 'Rejected') && showReturnedSection && (
          <Card variation="outlined" backgroundColor="#fff3cd" padding="1rem">
            <Flex direction="column" gap="1rem">
              <Heading level={5} color="#856404">⚠️ Application Returned for Revision</Heading>
              
              <Text fontSize="0.9rem" color="#856404" fontStyle="italic">
                📝 Please review the feedback in the Review Notes section and make the necessary changes to your application before resubmitting.
              </Text>
              
              <Button 
                variation="primary"
                onClick={() => setIsEditing(true)}
                size="large"
              >
                Edit & Resubmit Application
              </Button>
            </Flex>
          </Card>
        )}
        
        {isStudent && application.status !== 'Cancelled' && application.status !== 'Expired' && application.status !== 'Draft' && (
          <View>
            {isWithdrawing ? (
              <Card variation="outlined">
                <Flex direction="column" gap="1rem">
                  <Text fontWeight="bold">Withdraw Application</Text>
                  <TextAreaField
                    label="Reason for withdrawing"
                    value={withdrawReason}
                    onChange={(e) => setWithdrawReason(e.target.value)}
                    placeholder="Please provide a reason for withdrawing your application"
                    required
                  />
                  
                  {error && <Text color="red">{error}</Text>}
                  
                  <Flex gap="1rem">
                    <Button 
                      onClick={() => setIsWithdrawing(false)}
                      variation="link"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleWithdraw}
                      variation="destructive"
                      isLoading={isSubmitting}
                    >
                      Confirm Withdrawal
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            ) : (
              <Button 
                onClick={() => setIsWithdrawing(true)}
                variation="destructive"
              >
                Withdraw Application
              </Button>
            )}
          </View>
        )}
        
        {/* View Details Modal */}
        {showDetails && (
          <View
            position="fixed"
            top="0"
            left="0"
            width="100vw"
            height="100vh"
            backgroundColor="rgba(0, 0, 0, 0.5)"
            style={{ zIndex: 1000 }}
            onClick={() => setShowDetails(false)}
          >
            <Flex
              justifyContent="center"
              alignItems="center"
              height="100%"
              padding="2rem"
            >
              <Card
                maxWidth="600px"
                width="100%"
                maxHeight="80vh"
                padding="2rem"
                style={{ overflow: 'auto' }}
                onClick={(e) => e.stopPropagation()}
              >
                <Flex direction="column" gap="1rem">
                  <Flex justifyContent="space-between" alignItems="center">
                    <Heading level={4}>Application Details</Heading>
                    <Button size="small" onClick={() => setShowDetails(false)}>Close</Button>
                  </Flex>
                  
                  <Divider />
                  
                  <Flex direction="column" gap="0.5rem">
                    <Text fontWeight="bold">Project Information</Text>
                    <Text>Project: {application.project?.title || 'Unknown Project'}</Text>
                    <Text>Department: {application.project?.department || 'Unknown Department'}</Text>
                    <Text>Status: {application.status}</Text>
                    <Text>Submitted: {new Date(application.createdAt).toLocaleDateString()}</Text>
                  </Flex>
                  
                  {application.statement && (
                    <>
                      <Divider />
                      <Flex direction="column" gap="0.5rem">
                        <Text fontWeight="bold">Statement of Interest</Text>
                        <Card variation="outlined" padding="0.5rem">
                          <Text>{application.statement}</Text>
                        </Card>
                      </Flex>
                    </>
                  )}
                  
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
                  
                  {application.documentKey && (
                    <>
                      <Divider />
                      <Flex direction="column" gap="0.5rem">
                        <Text fontWeight="bold">Supporting Document</Text>
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
                          }}>View Document</Button>
                          <Button size="small" variation="primary" onClick={async () => {
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
                  
                  {(application.facultyNotes || application.coordinatorNotes || application.adminNotes) && (
                    <>
                      <Divider />
                      <Flex direction="column" gap="0.5rem">
                        <Text fontWeight="bold">Review Notes</Text>
                        {application.facultyNotes && (
                          <Card backgroundColor="#fff3cd" padding="0.5rem">
                            <Text><strong>Faculty:</strong> {application.facultyNotes}</Text>
                          </Card>
                        )}
                        {application.coordinatorNotes && (
                          <Card backgroundColor="#e7f3ff" padding="0.5rem">
                            <Text><strong>Coordinator:</strong> {application.coordinatorNotes}</Text>
                          </Card>
                        )}
                        {application.adminNotes && (
                          <Card backgroundColor="#f0f8f0" padding="0.5rem">
                            <Text><strong>Admin:</strong> {application.adminNotes}</Text>
                          </Card>
                        )}
                      </Flex>
                    </>
                  )}
                </Flex>
              </Card>
            </Flex>
          </View>
        )}
        
        {/* Edit Application Overlay */}
        {isEditing && (
          <View
            position="fixed"
            top="0"
            left="0"
            width="100vw"
            height="100vh"
            backgroundColor="rgba(0, 0, 0, 0.5)"
            style={{ zIndex: 1000 }}
            onClick={() => setIsEditing(false)}
          >
            <Flex
              justifyContent="center"
              alignItems="center"
              height="100%"
              padding="2rem"
            >
              <Card
                maxWidth="800px"
                width="100%"
                maxHeight="90vh"
                style={{ overflow: 'auto' }}
                onClick={(e) => e.stopPropagation()}
              >
                <EditApplicationForm 
                  application={application}
                  onClose={() => setIsEditing(false)}
                  onSuccess={() => {
                    setIsEditing(false);
                    if (onUpdate) onUpdate();
                  }}
                />
              </Card>
            </Flex>
          </View>
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
                maxHeight="90vh"
                height="100%"
                onClick={(e) => e.stopPropagation()}
              >
                <Flex direction="column" height="100%">
                  <Flex justifyContent="space-between" alignItems="center" padding="1rem">
                    <Heading level={4}>Supporting Document</Heading>
                    <Flex gap="0.5rem">
                      <Button size="small" onClick={async () => {
                        try {
                          const response = await fetch(documentUrl);
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = 'supporting-document';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);
                        } catch (err) {
                          console.error('Error downloading document:', err);
                        }
                      }}>Download</Button>
                      <Button size="small" onClick={() => {
                        setViewingDocument(false);
                        setDocumentUrl(null);
                      }}>Close</Button>
                    </Flex>
                  </Flex>
                  <Divider />
                  <View flex="1" style={{ overflow: 'hidden' }}>
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(documentUrl)}&embedded=true`}
                      width="100%"
                      height="100%"
                      style={{ border: 'none' }}
                      title="Supporting Document"
                    />
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



export default ApplicationStatus;
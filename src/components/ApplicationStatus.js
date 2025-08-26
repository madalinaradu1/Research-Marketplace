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
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const { tokens } = useTheme();
  
  // Get status color
  const getStatusColor = (status) => {
    if (!status) return tokens.colors.neutral[60];
    
    switch (status) {
      case 'Coordinator Review':
        return tokens.colors.orange[60];
      case 'Faculty Review':
        return tokens.colors.blue[60];
      case 'Approved':
        return '#4caf50';
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
        

        

        
        {isStudent && application.status !== 'Cancelled' && application.status !== 'Expired' && application.status !== 'Draft' && (
          <Flex gap="0.5rem">
            <Button 
              size="small"
              onClick={() => setShowDetails(true)}
            >
              View Details
            </Button>
            {(application.status === 'Returned' || application.status === 'Rejected') && showReturnedSection && (
              <Button 
                size="small"
                onClick={() => setIsEditing(true)}
              >
                Edit & Resubmit
              </Button>
            )}
            <Button 
              size="small"
              onClick={() => setShowWithdrawModal(true)}
            >
              Withdraw Application
            </Button>
          </Flex>
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
                maxWidth="900px"
                width="100%"
                maxHeight="100vh"
                padding="2rem"
                style={{ overflow: 'auto', border: '1px solid black' }}
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
                          <div dangerouslySetInnerHTML={{ __html: application.statement }} />
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
                            <Text><strong>Coordinator:</strong></Text>
                            <Text style={{ whiteSpace: 'pre-wrap' }}>{application.coordinatorNotes}</Text>
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
                maxHeight="100vh"
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
        
        {/* Withdraw Application Modal */}
        {showWithdrawModal && (
          <View
            position="fixed"
            top="0"
            left="0"
            width="100vw"
            height="100vh"
            backgroundColor="rgba(0, 0, 0, 0.5)"
            style={{ zIndex: 1000 }}
            onClick={() => setShowWithdrawModal(false)}
          >
            <Flex
              justifyContent="center"
              alignItems="center"
              height="100%"
              padding="2rem"
            >
              <Card
                maxWidth="700px"
                width="100%"
                minHeight="400px"
                onClick={(e) => e.stopPropagation()}
              >
                <Flex direction="column" gap="2rem">
                  <Heading level={4}>Withdraw Application</Heading>
                  <TextAreaField
                    label="Reason for withdrawing"
                    value={withdrawReason}
                    onChange={(e) => setWithdrawReason(e.target.value)}
                    placeholder="Please provide a reason for withdrawing your application"
                    required
                    rows={8}
                  />
                  
                  {error && <Text color="red">{error}</Text>}
                  
                  <Flex gap="1rem" justifyContent="flex-end">
                    <Button 
                      onClick={() => {
                        setShowWithdrawModal(false);
                        setWithdrawReason('');
                        setError(null);
                      }}
                      backgroundColor="white"
                      color="black"
                      border="1px solid black"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={async () => {
                        await handleWithdraw();
                        if (!error) {
                          setShowWithdrawModal(false);
                        }
                      }}
                      backgroundColor="white"
                      color="black"
                      border="1px solid black"
                      isLoading={isSubmitting}
                    >
                      Confirm Withdrawal
                    </Button>
                  </Flex>
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
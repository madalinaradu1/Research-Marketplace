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
import { getStatusColorValue } from '../utils/statusColors';

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
  
  // Get status color using utility function
  const getStatusColor = (status) => getStatusColorValue(status, tokens);
  
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
    <Card style={{ cursor: 'pointer' }} onClick={() => setShowDetails(true)}>
      <Flex direction="column" gap="0.75rem">
        <Flex justifyContent="space-between" alignItems="flex-start">
          <Flex direction="column" gap="0.25rem" flex="1">
            <Heading level={4} fontSize="1.1rem">{application.project?.title || 'Research Application'}</Heading>
            {application.statusDetail && (
              <Text fontSize="0.85rem" fontStyle="italic" color="#666">{application.statusDetail}</Text>
            )}
          </Flex>
          <Badge
            backgroundColor={getStatusColor(application.status)}
            color="white"
            fontSize="0.8rem"
          >
            {application.status}
          </Badge>
        </Flex>
        
        <Flex direction="column" gap="0.5rem">
          <Text fontSize="0.9rem" color="#666">{application.project?.department || 'Unknown College'}</Text>
          <Text fontSize="0.9rem" color="#666">Submitted: {new Date(application.createdAt).toLocaleDateString()}</Text>
          {application.updatedAt !== application.createdAt && (
            <Text fontSize="0.9rem" color="#666">Updated: {new Date(application.updatedAt).toLocaleDateString()}</Text>
          )}
        </Flex>
        
        {isStudent && application.status !== 'Cancelled' && application.status !== 'Expired' && application.status !== 'Draft' && (
          <Flex justifyContent="space-between" alignItems="center">
            <Flex gap="0.5rem">
              {application.status === 'Returned' && showReturnedSection && (
                <Button 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                >
                  Edit & Resubmit
                </Button>
              )}
            </Flex>
            <Button 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setShowWithdrawModal(true);
              }}
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDetails(false);
            }}
          >
            <Flex
              justifyContent="center"
              alignItems="center"
              height="100%"
              padding="2rem"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDetails(false);
              }}
            >
              <Card
                maxWidth="900px"
                width="100%"
                maxHeight="100vh"
                backgroundColor="white"
                style={{ overflow: 'auto' }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <Flex direction="column" gap="1.5rem" padding="2rem">
                  <Flex justifyContent="space-between" alignItems="center">
                    <Heading level={3} color="#2d3748">Application Details</Heading>
                    <Button size="small" onClick={() => setShowDetails(false)} backgroundColor="#f7fafc" color="#4a5568">✕</Button>
                  </Flex>
                  
                  <Card backgroundColor="#f8fafc" padding="1.5rem" border="1px solid #e2e8f0">
                    <Heading level={5} color="#2d3748" marginBottom="1rem">Project Information</Heading>
                    <Flex direction="column" gap="0.75rem">
                      <Flex justifyContent="space-between">
                        <Text fontWeight="600" color="#4a5568">Project:</Text>
                        <Text color="#2d3748">{application.project?.title || 'Unknown Project'}</Text>
                      </Flex>
                      <Flex justifyContent="space-between">
                        <Text fontWeight="600" color="#4a5568">College:</Text>
                        <Text color="#2d3748">{application.project?.department || 'Unknown College'}</Text>
                      </Flex>
                      <Flex justifyContent="space-between">
                        <Text fontWeight="600" color="#4a5568">Status:</Text>
                        <Badge backgroundColor={getStatusColor(application.status)} color="white">
                          {application.status}
                        </Badge>
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
                  
                  {application.relevantCourses && application.relevantCourses.length > 0 && (
                    <Card backgroundColor="#f8fafc" padding="1.5rem" border="1px solid #e2e8f0">
                      <Heading level={5} color="#2d3748" marginBottom="1rem">Relevant Coursework</Heading>
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
                    </Card>
                  )}
                  
                  {application.documentKey && (
                    <Card backgroundColor="#f8fafc" padding="1.5rem" border="1px solid #e2e8f0">
                      <Heading level={5} color="#2d3748" marginBottom="1rem">Supporting Documents</Heading>
                      <Flex gap="0.75rem">
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
                          View Document
                        </Button>
                        <Button 
                          size="small" 
                          backgroundColor="white" 
                          color="#4a5568" 
                          border="1px solid #e2e8f0"
                          onClick={async () => {
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
                          }}
                        >
                          Download
                        </Button>
                      </Flex>
                    </Card>
                  )}
                  
                  {(application.facultyNotes || application.coordinatorNotes || application.adminNotes) && (
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
                      </Flex>
                    </Card>
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
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
      const now = new Date().toISOString();
      const input = {
        id: application.id,
        status: statusUpdate
      };
      
      // Add appropriate timestamp based on status
      if (statusUpdate === 'Department Review') {
        input.submittedToDepartmentAt = now;
      } else if (statusUpdate === 'Admin Review') {
        input.submittedToAdminAt = now;
      } else if (statusUpdate === 'Faculty Review') {
        input.submittedToFacultyAt = now;
      } else if (statusUpdate === 'Approved') {
        input.approvedAt = now;
      } else if (statusUpdate === 'Selected' && userRole === 'Faculty') {
        input.status = 'Approved';
        input.approvedAt = now;
        input.selectedAt = now;
        input.isSelected = true;
      } else if (statusUpdate === 'Approved' && userRole === 'Faculty' && application.status === 'Approved') {
        input.selectedAt = now;
        input.isSelected = true;
      } else if (statusUpdate === 'Returned') {
        input.returnedAt = now;
      } else if (statusUpdate === 'Rejected') {
        input.rejectedAt = now;
      }
      
      // Add notes based on user role
      if (userRole === 'Faculty') {
        input.facultyNotes = notes;
      } else if (userRole === 'Coordinator') {
        input.coordinatorNotes = notes;
      } else if (userRole === 'Admin') {
        input.adminNotes = notes;
      }
      
      // Add rejection or acceptance reasons
      if (statusUpdate === 'Rejected' && rejectionReason) {
        input.rejectionReason = rejectionReason;
      } else if ((statusUpdate === 'Approved' || statusUpdate === 'Selected') && acceptanceReason) {
        input.acceptanceReason = acceptanceReason;
      }
      
      await API.graphql(graphqlOperation(updateApplication, { input }));
      
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
      setError('Failed to update application. Please try again.');
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
    <Card variation="outlined" borderRadius="8px" borderWidth="2px" height="100%">
      <Flex direction="column" gap="1rem" height="100%">
        <Heading level={4}>Review Application</Heading>
        
        <Divider />
        
        <Flex direction="column" gap="0.5rem">
          <Text fontWeight="bold">Student Information</Text>
          <Text>Student ID: {application.student?.id || application.studentID}</Text>
          <Text>Name: {application.student?.name || 'Not provided'}</Text>
          <Text>Email: {application.student?.email || 'Not provided'}</Text>
          <Text>Program: {application.student?.major || 'Not provided'}</Text>
          <Text>Academic Year: {application.student?.academicYear || 'Not provided'}</Text>
          <Text>Expected Graduation: {application.student?.expectedGraduation || 'Not provided'}</Text>
          <Text>GPA: {application.student?.gpa || 'Not provided'}</Text>
          <Text>Research Interests: {application.student?.researchInterests?.join(', ') || 'Not provided'}</Text>
          <Text>Skills: {application.student?.skills?.join(', ') || 'Not provided'}</Text>
          <Text>Availability: {application.student?.availability || 'Not provided'}</Text>
        </Flex>
        
        <Divider />
        
        <Flex direction="column" gap="0.5rem">
          <Text fontWeight="bold">Application Details</Text>
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
        
        <Divider />
        <Flex direction="column" gap="0.5rem">
          <Text fontWeight="bold">Relevant Coursework</Text>
          {application.relevantCourses && application.relevantCourses.length > 0 ? (
            <Collection
              items={application.relevantCourses}
              type="list"
              gap="0.5rem"
              direction="column"
            >
              {(course) => (
                <Card key={course.courseName} variation="outlined" padding="0.5rem">
                  <Flex justifyContent="space-between">
                    <Text>{course.courseName} ({course.courseNumber})</Text>
                    <Text>Grade: {course.grade} | {course.semester} {course.year}</Text>
                  </Flex>
                </Card>
              )}
            </Collection>
          ) : (
            <Text fontStyle="italic" color="gray">Coursework data not available</Text>
          )}
        </Flex>
        

        
        
        {application.resumeKey && (
          <>
            <Divider />
            <Flex direction="column" gap="0.5rem">
              <Text fontWeight="bold">Resume</Text>
              <Button onClick={downloadProposal}>Download Resume</Button>
            </Flex>
          </>
        )}
        
        {application.documentKey && (
          <>
            <Divider />
            <Flex direction="column" gap="0.5rem">
              <Text fontWeight="bold">Supporting Document</Text>
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
            </Flex>
          </>
        )}
        
        {application.transcriptLink && (
          <>
            <Divider />
            <Flex direction="column" gap="0.5rem">
              <Text fontWeight="bold">Transcript</Text>
              <Button onClick={() => window.open(application.transcriptLink, '_blank')}>
                View Transcript
              </Button>
            </Flex>
          </>
        )}
        

        
        <Divider />
        
        {application.facultyNotes && (
          <Flex direction="column" gap="0.5rem">
            <Text fontWeight="bold">Faculty Notes</Text>
            <Text>{application.facultyNotes}</Text>
          </Flex>
        )}
        
        {application.coordinatorNotes && (
          <Flex direction="column" gap="0.5rem">
            <Text fontWeight="bold">Coordinator Notes</Text>
            <Text>{application.coordinatorNotes}</Text>
          </Flex>
        )}
        
        {application.adminNotes && (
          <Flex direction="column" gap="0.5rem">
            <Text fontWeight="bold">Admin Notes</Text>
            <Text>{application.adminNotes}</Text>
          </Flex>
        )}
        
        {application.rejectionReason && (
          <Flex direction="column" gap="0.5rem">
            <Text fontWeight="bold" color="red">Rejection Reason</Text>
            <Card variation="outlined" padding="0.5rem" backgroundColor="#ffebee">
              <Text>{application.rejectionReason}</Text>
            </Card>
          </Flex>
        )}
        
        {application.acceptanceReason && (
          <Flex direction="column" gap="0.5rem">
            <Text fontWeight="bold" color="green">Acceptance Reason</Text>
            <Card variation="outlined" padding="0.5rem" backgroundColor="#e8f5e8">
              <Text>{application.acceptanceReason}</Text>
            </Card>
          </Flex>
        )}
        
        {statusOptions.length > 0 && !hideStatusUpdate && (
          <Card variation="outlined">
            <Flex direction="column" gap="1rem">
              <Text fontWeight="bold">Update Application Status</Text>
              
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
                  backgroundColor="white"
                  color="black"
                  border="1px solid black"
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
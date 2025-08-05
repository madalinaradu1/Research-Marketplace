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
import { updateApplication } from '../graphql/operations';

const ApplicationReview = ({ application, userRole, onUpdate, hideRelevantCourses = false }) => {
  const [notes, setNotes] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
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
      } else if (statusUpdate === 'Approved') {
        input.approvedAt = now;
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
      
      await API.graphql(graphqlOperation(updateApplication, { input }));
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
          { value: 'Department Review', label: 'Approve & Send to Department' },
          { value: 'Returned', label: 'Return to Student' },
          { value: 'Rejected', label: 'Reject Application' }
        ];
      }
    } else if (userRole === 'Coordinator') {
      if (application.status === 'Department Review') {
        return [
          { value: 'Admin Review', label: 'Approve & Send to Admin' },
          { value: 'Returned', label: 'Return to Student' },
          { value: 'Rejected', label: 'Reject Application' }
        ];
      }
    } else if (userRole === 'Admin') {
      if (application.status === 'Admin Review') {
        return [
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
        </Flex>
        
        <Divider />
        
        <Flex direction="column" gap="0.5rem">
          <Text fontWeight="bold">Application Details</Text>
          <Text>Status: {application.status}</Text>
          <Text>Submitted: {new Date(application.createdAt).toLocaleDateString()}</Text>
          <Button size="small" onClick={() => setShowDetails(true)}>
            View Entire Application
          </Button>
        </Flex>
        
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
                    <Text fontWeight="bold">Student Profile Information</Text>
                    <Text>Student ID: {application.student?.id || application.studentID}</Text>
                    <Text>Program: {application.student?.major || 'Not provided'}</Text>
                    <Text>Degree: {application.student?.academicYear || 'Not provided'}</Text>
                    <Text>Expected Graduation: {application.student?.expectedGraduation || 'Not provided'}</Text>
                    <Text>Research Interests: {application.student?.researchInterests?.join(', ') || 'Not provided'}</Text>
                    <Text>Skills: {application.student?.skills?.join(', ') || 'Not provided'}</Text>
                    <Text>Availability: {application.student?.availability || 'Not provided'}</Text>
                    {console.log('Student data:', application.student)}
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
                      </Flex>
                    </>
                  )}
                </Flex>
              </Card>
            </Flex>
          </View>
        )}
        
        
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
              <Button onClick={async () => {
                try {
                  const url = await Storage.get(application.documentKey, { expires: 60 });
                  window.open(url, '_blank');
                } catch (err) {
                  console.error('Error downloading document:', err);
                  setError('Failed to download document. Please try again.');
                }
              }}>Download Document</Button>
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
        
        {!hideRelevantCourses && application.relevantCourses && application.relevantCourses.length > 0 && (
          <>
            <Divider />
            <Flex direction="column" gap="0.5rem">
              <Text fontWeight="bold">Relevant Coursework</Text>
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
        
        {statusOptions.length > 0 && (
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
              
              <TextAreaField
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about your decision"
              />
              
              {error && <Text color="red">{error}</Text>}
              
              <Button 
                onClick={updateStatus}
                variation="primary"
                isLoading={isSubmitting}
              >
                Submit Decision
              </Button>
            </Flex>
          </Card>
        )}
      </Flex>
    </Card>
  );
};

export default ApplicationReview;
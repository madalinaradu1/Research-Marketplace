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
  useTheme,
  View,
  Collection
} from '@aws-amplify/ui-react';
import { updateApplication } from '../graphql/operations';

const ApplicationStatus = ({ application, isStudent = true, onUpdate }) => {
  const [withdrawReason, setWithdrawReason] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
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
        </Flex>
        
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
        
        {(application.facultyNotes || application.coordinatorNotes || application.adminNotes) && (
          <>
            <Divider />
            <Flex direction="column" gap="0.5rem">
              <Text fontWeight="bold">Review Notes</Text>
              {application.facultyNotes && (
                <Text><strong>Faculty:</strong> {application.facultyNotes}</Text>
              )}
              {application.coordinatorNotes && (
                <Text><strong>Coordinator:</strong> {application.coordinatorNotes}</Text>
              )}
              {application.adminNotes && (
                <Text><strong>Admin:</strong> {application.adminNotes}</Text>
              )}
            </Flex>
          </>
        )}
        
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
      </Flex>
    </Card>
  );
};

export default ApplicationStatus;
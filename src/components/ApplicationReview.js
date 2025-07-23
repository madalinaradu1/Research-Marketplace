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
  View
} from '@aws-amplify/ui-react';
import { updateApplication } from '../graphql/operations';

const ApplicationReview = ({ application, userRole, onUpdate }) => {
  const [notes, setNotes] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { tokens } = useTheme();
  
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
    <Card>
      <Flex direction="column" gap="1rem">
        <Heading level={4}>Review Application: {application.projectTitle}</Heading>
        
        <Divider />
        
        <Flex direction="column" gap="0.5rem">
          <Text fontWeight="bold">Student Information</Text>
          <Text>Name: {application.student?.name}</Text>
          <Text>Email: {application.student?.email}</Text>
          {application.student?.major && (
            <Text>Major: {application.student.major}</Text>
          )}
          {application.student?.gpa && (
            <Text>GPA: {application.student.gpa}</Text>
          )}
        </Flex>
        
        <Divider />
        
        <Flex direction="column" gap="0.5rem">
          <Text fontWeight="bold">Application Details</Text>
          <Text>Term: {application.term}</Text>
          <Text>Department: {application.department}</Text>
          <Text>Payment Type: {application.paymentType}</Text>
          {application.paymentType === 'Pay' && application.paymentAmount && (
            <Text>Payment Amount: ${application.paymentAmount}</Text>
          )}
          {application.paymentType === 'Credit' && application.creditHours && (
            <Text>Credit Hours: {application.creditHours}</Text>
          )}
          {application.requiresTravel && (
            <Text>Requires Travel: Yes - {application.travelDetails}</Text>
          )}
        </Flex>
        
        <Divider />
        
        <Flex direction="column" gap="0.5rem">
          <Text fontWeight="bold">Proposal</Text>
          {application.proposalFileKey ? (
            <Button onClick={downloadProposal}>Download Proposal</Button>
          ) : (
            <Card variation="outlined">
              <Text>{application.proposalText}</Text>
            </Card>
          )}
        </Flex>
        
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
import React from 'react';
import { 
  Flex, 
  Heading, 
  Text, 
  Button, 
  Badge, 
  Card, 
  Divider
} from '@aws-amplify/ui-react';

/**
 * A simplified version of the ApplicationStatus component
 * that doesn't rely on all fields being present
 */
const ApplicationStatusSimple = ({ application, isStudent = true }) => {
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft':
        return 'gray';
      case 'Faculty Review':
        return 'blue';
      case 'Department Review':
        return 'purple';
      case 'Admin Review':
        return 'orange';
      case 'Approved':
        return 'green';
      case 'Returned':
      case 'Rejected':
        return 'red';
      case 'Cancelled':
        return 'black';
      case 'Expired':
        return 'gray';
      default:
        return 'gray';
    }
  };
  
  return (
    <Card>
      <Flex direction="column" gap="1rem">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading level={4}>{application.projectTitle || 'Research Application'}</Heading>
          <Badge
            backgroundColor={getStatusColor(application.status)}
            color="white"
          >
            {application.status || 'Pending'}
          </Badge>
        </Flex>
        
        {application.statusDetail && (
          <Text fontStyle="italic">{application.statusDetail}</Text>
        )}
        
        <Divider />
        
        <Text>
          Submitted: {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'Recently'}
        </Text>
        
        {isStudent && (
          <Button 
            variation="primary"
            onClick={() => console.log('View details clicked')}
          >
            View Details
          </Button>
        )}
      </Flex>
    </Card>
  );
};

export default ApplicationStatusSimple;
import React from 'react';
import { 
  Flex, 
  Heading, 
  Text, 
  Card, 
  Divider,
  useTheme
} from '@aws-amplify/ui-react';

const ApplicationStatusGuide = () => {
  const { tokens } = useTheme();
  
  const statusCodes = [
    {
      status: 'Coordinator Review',
      description: 'Your application has been submitted and is currently being reviewed by the UROP Coordinator for approval.',
      color: tokens.colors.orange[60]
    },
    {
      status: 'Faculty Review',
      description: 'Your application has been approved by the Coordinator and is now available for the faculty member to review and select students for their research project.',
      color: tokens.colors.blue[60]
    },
    {
      status: 'Approved',
      description: 'Congratulations! You have been selected by the faculty member for this research opportunity. The faculty member will contact you to begin the project.',
      color: tokens.colors.green[60]
    },
    {
      status: 'Returned',
      description: 'Your application has been returned and requires additional information or corrections before it can be approved.',
      color: tokens.colors.yellow[60],
      subStatuses: [
        {
          status: 'Missing Information',
          description: 'Your application is missing required information. Please review the coordinator\'s notes and provide the requested details.'
        },
        {
          status: 'Incomplete Documentation',
          description: 'Additional documents or clarifications are needed to complete your application.'
        }
      ]
    },
    {
      status: 'Rejected',
      description: 'Your application was not approved for this research opportunity.',
      color: tokens.colors.red[60],
      subStatuses: [
        {
          status: 'Does not meet requirements',
          description: 'Your application does not meet the minimum requirements for this research project.'
        },
        {
          status: 'Project capacity reached',
          description: 'The research project has reached its maximum number of participants.'
        },
        {
          status: 'Application received late',
          description: 'Your application was received after the deadline.'
        }
      ]
    },
    {
      status: 'Cancelled',
      description: 'Your application has been cancelled.',
      color: tokens.colors.neutral[80],
      subStatuses: [
        {
          status: 'Cancelled by Student',
          description: 'You cancelled your application.'
        },
        {
          status: 'Project Cancelled',
          description: 'The research project was cancelled by the faculty member.'
        }
      ]
    },
    {
      status: 'Expired',
      description: 'Your application expired because it did not reach a final status by the deadline.',
      color: tokens.colors.neutral[40]
    }
  ];
  
  return (
    <Card>
      <Flex direction="column" gap="1rem">
        <Heading level={3}>Understanding Application Status Codes</Heading>
        <Text>Below you will find a list of the status codes you may encounter during the application process and what each one means.</Text>
        
        <Divider />
        
        {statusCodes.map((statusCode, index) => (
          <Flex key={index} direction="column" gap="0.5rem">
            <Flex alignItems="center" gap="0.5rem">
              <div 
                style={{ 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: statusCode.color 
                }} 
              />
              <Text fontWeight="bold">{statusCode.status}</Text>
            </Flex>
            <Text>{statusCode.description}</Text>
            
            {statusCode.subStatuses && (
              <Flex direction="column" gap="0.5rem" paddingLeft="1.5rem">
                {statusCode.subStatuses.map((subStatus, subIndex) => (
                  <Flex key={subIndex} direction="column" gap="0.25rem">
                    <Text fontWeight="bold" fontSize="0.9rem">{subStatus.status}</Text>
                    <Text fontSize="0.9rem">{subStatus.description}</Text>
                  </Flex>
                ))}
              </Flex>
            )}
            
            {index < statusCodes.length - 1 && <Divider />}
          </Flex>
        ))}
      </Flex>
    </Card>
  );
};

export default ApplicationStatusGuide;
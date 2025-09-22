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
      color: '#4caf50'
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
    <Card backgroundColor="white" padding="1.5rem">
      <Flex direction="column" gap="1.5rem">
        <Flex direction="column" gap="0.5rem">
          <Heading level={3} color="#2d3748">Understanding Application Status Codes</Heading>
          <Text color="#4a5568">Below you will find a list of the status codes you may encounter during the application process and what each one means.</Text>
        </Flex>
        
        <Flex direction="column" gap="1rem">
          {statusCodes.map((statusCode, index) => (
            <Card key={index} backgroundColor="#f8fafc" padding="1.5rem" border="1px solid #e2e8f0">
              <Flex direction="column" gap="0.75rem">
                <Flex alignItems="center" gap="0.75rem">
                  <div 
                    style={{ 
                      width: '16px', 
                      height: '16px', 
                      borderRadius: '50%', 
                      backgroundColor: statusCode.color 
                    }} 
                  />
                  <Heading level={5} color="#2d3748">{statusCode.status}</Heading>
                </Flex>
                <Text color="#4a5568">{statusCode.description}</Text>
                
                {statusCode.subStatuses && (
                  <Card backgroundColor="white" padding="1rem" border="1px solid #e2e8f0">
                    <Flex direction="column" gap="0.75rem">
                      {statusCode.subStatuses.map((subStatus, subIndex) => (
                        <Flex key={subIndex} direction="column" gap="0.25rem">
                          <Text fontWeight="600" fontSize="0.9rem" color="#2d3748">{subStatus.status}</Text>
                          <Text fontSize="0.9rem" color="#4a5568">{subStatus.description}</Text>
                        </Flex>
                      ))}
                    </Flex>
                  </Card>
                )}
              </Flex>
            </Card>
          ))}
        </Flex>
      </Flex>
    </Card>
  );
};

export default ApplicationStatusGuide;
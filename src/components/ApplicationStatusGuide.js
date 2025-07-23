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
      status: 'Draft',
      description: 'You have created an online application, however, only you can see this application. In order to submit your application you must click Submit to Faculty.',
      color: tokens.colors.neutral[60]
    },
    {
      status: 'Faculty Review',
      description: 'You have submitted an online application for your faculty supervisor to review, but they still need to approve and submit it to the UROP Department Coordinator for review.',
      color: tokens.colors.blue[60]
    },
    {
      status: 'Department Review',
      description: 'Your faculty supervisor has approved your application, but the UROP Department Coordinator still needs to approve and submit it to UROP staff for final review/approval.',
      color: tokens.colors.purple[60]
    },
    {
      status: 'Admin Review',
      description: 'Your application is under review in the UROP office.',
      color: tokens.colors.orange[60],
      subStatuses: [
        {
          status: 'Review: info missing',
          description: 'Your application is missing required information (e.g. proposal detail, pay/credit information, etc.). Your application cannot be approved until this information is supplied. A member of the UROP staff will reach out to you for required application information.'
        },
        {
          status: 'Review: travel forms missing',
          description: 'You indicated that you are traveling within the US or abroad for this UROP project and the required travel forms are not yet on file. A member of the UROP staff will reach out to you for required travel information.'
        },
        {
          status: 'Review: evaluation missing',
          description: 'You have yet to submit a prior term UROP evaluation. Your application cannot be approved your evaluation has been submitted.'
        },
        {
          status: 'Review: holding',
          description: 'Reasons for your proposal being in \'holding\' can vary (e.g. UROP staff read your Direct Funding proposal, but are making funding decisions and are not yet ready to issue a decision, etc.).'
        }
      ]
    },
    {
      status: 'Approved',
      description: 'Your application has been approved for the term by your faculty supervisor, Department UROP Coordinator, and UROP staff.',
      color: tokens.colors.green[60]
    },
    {
      status: 'Returned/Rejected',
      description: 'Reasons for returning or rejecting projects can vary.',
      color: tokens.colors.red[60],
      subStatuses: [
        {
          status: 'Returned: denied funding',
          description: 'Your request for UROP Direct Funding was not approved (an explanation is also provided to clarify on your application).'
        },
        {
          status: 'Returned: info missing',
          description: 'You failed to respond to email requests to provide missing required information, thus the application was returned.'
        },
        {
          status: 'Returned: evaluation missing',
          description: 'You failed to respond to requests to submit a required end of term UROP evaluation, thus the application was returned.'
        },
        {
          status: 'Rejected: received late',
          description: 'Your application was rejected because it was received after the deadline.'
        },
        {
          status: 'Rejected: inappropriate',
          description: 'Your application was rejected because the proposed research was deemed inappropriate for a UROP.'
        }
      ]
    },
    {
      status: 'Cancelled',
      description: 'You submitted a UROP application for the term, but it has been cancelled for some reason.',
      color: tokens.colors.neutral[80],
      subStatuses: [
        {
          status: 'Cancelled (Approved)',
          description: 'Application was cancelled after UROP staff had already approved it.'
        },
        {
          status: 'Cancelled (Admin Review)',
          description: 'Application was cancelled while still under review by UROP staff.'
        },
        {
          status: 'Cancelled (Draft)',
          description: 'You cancelled your application before submission for faculty and department review.'
        }
      ]
    },
    {
      status: 'Expired',
      description: 'You created an application that never reached a final status (e.g. approved or cancelled) by the end of the term.',
      color: tokens.colors.neutral[40]
    }
  ];
  
  return (
    <Card>
      <Flex direction="column" gap="1rem">
        <Heading level={3}>Understanding Application Status Codes</Heading>
        <Text>Below you will find a list of the common status codes that you will encounter in the system along with their equivalent meaning.</Text>
        
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
import React from 'react';
import { useParams } from 'react-router-dom';
import { Flex, Heading, Text, Card, Button } from '@aws-amplify/ui-react';

const OpportunityDetails = ({ user }) => {
  const { id } = useParams();
  
  return (
    <Flex direction="column" padding="2rem" gap="2rem">
      <Heading level={2}>Research Opportunity</Heading>
      
      <Card>
        <Flex direction="column" gap="1rem">
          <Heading level={3}>Sample Opportunity Title</Heading>
          <Text>Faculty: Sample Faculty Name</Text>
          <Text>College: Sample College</Text>
          <Text>Deadline: January 1, 2024</Text>
          
          <Heading level={4}>Description</Heading>
          <Text>This is a sample research opportunity description. The actual content would be loaded from the API based on the opportunity ID: {id}</Text>
          
          <Heading level={4}>Requirements</Heading>
          <Text>Sample requirements for the research opportunity.</Text>
          
          <Button variation="primary">
            Apply Now
          </Button>
        </Flex>
      </Card>
    </Flex>
  );
};

export default OpportunityDetails;
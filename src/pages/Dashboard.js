import React from 'react';
import { Flex, Heading, Text, Card } from '@aws-amplify/ui-react';

const Dashboard = ({ user }) => {
  return (
    <Flex direction="column" padding="2rem" gap="2rem">
      <Heading level={2}>Welcome, {user?.name || user?.username}!</Heading>
      <Text>Your research journey starts here. Explore opportunities, track your applications, and manage your research projects.</Text>
      
      <Card>
        <Heading level={3}>My Applications</Heading>
        <Text>No applications submitted yet.</Text>
      </Card>
      
      <Card>
        <Heading level={3}>My Projects</Heading>
        <Text>No active projects.</Text>
      </Card>
      
      <Card>
        <Heading level={3}>Recommended Opportunities</Heading>
        <Text>Update your profile to get personalized recommendations.</Text>
      </Card>
    </Flex>
  );
};

export default Dashboard;
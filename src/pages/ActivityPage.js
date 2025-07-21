import React from 'react';
import { Flex, Heading, Tabs, TabItem, Card, Text } from '@aws-amplify/ui-react';

const ActivityPage = ({ user }) => {
  return (
    <Flex direction="column" padding="2rem" gap="2rem">
      <Heading level={2}>My Activity</Heading>
      
      <Tabs>
        <TabItem title="Applications">
          <Card>
            <Text>No applications submitted yet.</Text>
          </Card>
        </TabItem>
        
        <TabItem title="Projects">
          <Card>
            <Text>No active projects.</Text>
          </Card>
        </TabItem>
      </Tabs>
    </Flex>
  );
};

export default ActivityPage;
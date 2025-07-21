import React from 'react';
import { Flex, Heading, Card, TextField, Button } from '@aws-amplify/ui-react';

const ProfilePage = ({ user }) => {
  return (
    <Flex direction="column" padding="2rem" gap="2rem">
      <Heading level={2}>My Profile</Heading>
      
      <Card>
        <Flex direction="column" gap="1rem">
          <TextField
            label="Name"
            placeholder="Your full name"
            defaultValue={user?.name || ''}
          />
          
          <TextField
            label="Email"
            placeholder="Your email address"
            defaultValue={user?.email || ''}
          />
          
          <TextField
            label="Major"
            placeholder="Your major"
            defaultValue={user?.major || ''}
          />
          
          <TextField
            label="Year"
            placeholder="Your academic year"
            defaultValue={user?.year || ''}
          />
          
          <Button variation="primary">
            Save Changes
          </Button>
        </Flex>
      </Card>
    </Flex>
  );
};

export default ProfilePage;
import React from 'react';
import { Flex, Heading, SearchField, Button, Text } from '@aws-amplify/ui-react';

const SearchPage = ({ user }) => {
  return (
    <Flex direction="column" padding="2rem" gap="2rem">
      <Heading level={2}>Search Research Opportunities</Heading>
      
      <Flex direction="row" gap="1rem" alignItems="flex-end">
        <SearchField
          label="Search"
          placeholder="Search by keyword"
          width="60%"
        />
        
        <Button variation="primary">
          Search
        </Button>
      </Flex>
      
      <Text>Enter a search term to find research opportunities.</Text>
    </Flex>
  );
};

export default SearchPage;
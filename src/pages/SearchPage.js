import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { 
  Flex, 
  Heading, 
  SearchField, 
  SelectField, 
  Button, 
  Collection 
} from '@aws-amplify/ui-react';

// Import Amplify Studio components
import { ResearchOpportunityCard } from '../ui-components';

// Import GraphQL operations
import { listResearchOpportunities } from '../graphql/queries';
import { searchOpportunities } from '../graphql/custom-queries';

const SearchPage = ({ user }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Load initial opportunities and categories
    fetchOpportunities();
    fetchCategories();
  }, []);

  async function fetchOpportunities() {
    setLoading(true);
    try {
      const opportunityData = await API.graphql(
        graphqlOperation(listResearchOpportunities, {
          filter: {
            status: { eq: 'PUBLISHED' }
          },
          limit: 20
        })
      );
      
      setOpportunities(opportunityData.data.listResearchOpportunities.items);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    }
    setLoading(false);
  }

  async function fetchCategories() {
    try {
      // This would typically be a separate query to get all categories
      // For now, we'll use a hardcoded list
      setCategories([
        'Biology',
        'Chemistry',
        'Computer Science',
        'Engineering',
        'Mathematics',
        'Physics',
        'Psychology',
        'Social Sciences'
      ]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async function handleSearch() {
    setLoading(true);
    try {
      // Use the custom searchOpportunities query
      const searchParams = {
        query: searchQuery,
        category: category !== 'all' ? category : null,
        limit: 20
      };
      
      const searchResults = await API.graphql(
        graphqlOperation(searchOpportunities, searchParams)
      );
      
      setOpportunities(searchResults.data.searchOpportunities);
    } catch (error) {
      console.error('Error searching opportunities:', error);
    }
    setLoading(false);
  }

  return (
    <Flex direction="column" padding="2rem" gap="2rem">
      <Heading level={2}>Search Research Opportunities</Heading>
      
      <Flex direction="row" gap="1rem" alignItems="flex-end">
        <SearchField
          label="Search"
          placeholder="Search by keyword"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          width="60%"
        />
        
        <SelectField
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          width="30%"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </SelectField>
        
        <Button variation="primary" onClick={handleSearch}>
          Search
        </Button>
      </Flex>
      
      {loading ? (
        <Flex justifyContent="center" padding="2rem">
          <p>Loading...</p>
        </Flex>
      ) : (
        <Collection
          type="grid"
          items={opportunities}
          gap="2rem"
          templateColumns={{
            base: "1fr",
            small: "1fr 1fr",
            medium: "1fr 1fr 1fr"
          }}
        >
          {(opportunity) => (
            <ResearchOpportunityCard
              key={opportunity.id}
              researchOpportunity={opportunity}
            />
          )}
        </Collection>
      )}
      
      {!loading && opportunities.length === 0 && (
        <Flex justifyContent="center" padding="2rem">
          <p>No research opportunities found. Try a different search.</p>
        </Flex>
      )}
    </Flex>
  );
};

export default SearchPage;
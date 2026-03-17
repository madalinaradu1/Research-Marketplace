import React from 'react';
import { Flex, TextField, SelectField, Button, Badge, View } from '@aws-amplify/ui-react';

const SearchFilterBar = ({ filters, onFilterChange, onClearFilters, activeFiltersCount }) => {
  const researchAreas = ['Machine Learning', 'Data Science', 'Bioinformatics', 'Web Development', 'AI', 'Robotics', 'Chemistry', 'Physics'];
  const timeCommitments = ['Flexible', '5-10 hours/week', '10-15 hours/week', '15+ hours/week', 'Summer only', 'Academic year'];

  return (
    <View backgroundColor="white" padding="1.5rem" borderRadius="12px" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <Flex direction="column" gap="1rem">
        {/* Search Bar */}
        <TextField
          placeholder="🔍 Search by title, description, or skills..."
          value={filters.keyword}
          onChange={(e) => onFilterChange('keyword', e.target.value)}
          size="large"
          style={{
            fontSize: '1rem',
            borderRadius: '8px',
            border: '2px solid #E5E7EB'
          }}
        />

        {/* Filters Row */}
        <Flex gap="1rem" wrap="wrap" alignItems="center">
          <SelectField
            label=""
            placeholder="Post Type"
            value={filters.type}
            onChange={(e) => onFilterChange('type', e.target.value)}
            style={{ minWidth: '180px' }}
          >
            <option value="">All Types</option>
            <option value="RESEARCH_INTEREST">Research Interest</option>
            <option value="MENTOR_WANTED">Mentor Wanted</option>
            <option value="RESEARCH_IDEA">Research Idea</option>
          </SelectField>

          <SelectField
            label=""
            placeholder="Research Area"
            value={filters.researchArea}
            onChange={(e) => onFilterChange('researchArea', e.target.value)}
            style={{ minWidth: '180px' }}
          >
            <option value="">All Areas</option>
            {researchAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </SelectField>

          <SelectField
            label=""
            placeholder="Time Commitment"
            value={filters.timeCommitment}
            onChange={(e) => onFilterChange('timeCommitment', e.target.value)}
            style={{ minWidth: '180px' }}
          >
            <option value="">Any Time</option>
            {timeCommitments.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </SelectField>

          {activeFiltersCount > 0 && (
            <Flex alignItems="center" gap="0.5rem">
              <Badge backgroundColor="#3B82F6" color="white" fontSize="0.85rem" padding="0.5rem 0.75rem" borderRadius="12px">
                {activeFiltersCount} active
              </Badge>
              <Button
                size="small"
                backgroundColor="transparent"
                color="#EF4444"
                border="1px solid #EF4444"
                onClick={onClearFilters}
                style={{ borderRadius: '8px' }}
              >
                Clear All
              </Button>
            </Flex>
          )}
        </Flex>
      </Flex>
    </View>
  );
};

export default SearchFilterBar;

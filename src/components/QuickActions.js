import React from 'react';
import { Card, Flex, Button, Heading } from '@aws-amplify/ui-react';

const QuickActions = ({ onAction }) => {
  const actions = [
    { id: 'users', label: 'Manage Users', icon: '👥', color: '#3B82F6' },
    { id: 'export', label: 'Export Data', icon: '📊', color: '#10B981' },
    { id: 'audit', label: 'View Audit Logs', icon: '📋', color: '#F59E0B' },
    { id: 'announce', label: 'Send Announcement', icon: '📢', color: '#8B5CF6' }
  ];

  return (
    <Card
      style={{
        background: '#1a1f2e',
        border: '1px solid #2a3142',
        borderRadius: '8px',
        padding: '1.5rem'
      }}
    >
      <Heading level={4} color="white" marginBottom="1rem" style={{ fontSize: '1.25rem', fontWeight: '600' }}>
        Quick Actions
      </Heading>
      <Flex direction="column" gap="0.75rem">
        {actions.map(action => (
          <Button
            key={action.id}
            onClick={() => onAction(action.id)}
            style={{
              background: '#2a3142',
              border: '1px solid #3a4152',
              borderRadius: '8px',
              padding: '1rem',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              justifyContent: 'flex-start',
              transition: 'background 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#3a4152';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2a3142';
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>{action.icon}</span>
            {action.label}
          </Button>
        ))}
      </Flex>
    </Card>
  );
};

export default QuickActions;

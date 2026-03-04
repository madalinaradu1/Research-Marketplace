import React from 'react';
import { Card, Flex, Text, Heading, View } from '@aws-amplify/ui-react';

const ActivityFeed = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    const icons = {
      user: '👤',
      application: '📝',
      project: '🔬',
      message: '💬',
      approval: '✅',
      rejection: '❌'
    };
    return icons[type] || '📌';
  };

  return (
    <Card
      style={{
        background: '#1a1f2e',
        border: '1px solid #2a3142',
        borderRadius: '8px',
        padding: '1.5rem',
        height: '100%'
      }}
    >
      <Heading level={4} color="white" marginBottom="1.5rem" style={{ fontSize: '1.25rem', fontWeight: '600' }}>
        Recent Activity
      </Heading>
      <Flex direction="column" gap="1rem" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {activities.length === 0 ? (
          <Text color="#64748B" fontSize="0.875rem" textAlign="center" padding="2rem">
            No recent activity
          </Text>
        ) : (
          activities.map((activity, idx) => (
            <Flex
              key={idx}
              gap="1rem"
              alignItems="flex-start"
              padding="0.75rem"
              style={{
                background: '#0f1419',
                borderRadius: '8px',
                border: '1px solid #2a3142'
              }}
            >
              <View
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: '#2a3142',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.125rem',
                  flexShrink: 0
                }}
              >
                {getActivityIcon(activity.type)}
              </View>
              <Flex direction="column" gap="0.25rem" flex="1">
                <Text color="white" fontSize="0.875rem" fontWeight="500">
                  {activity.title}
                </Text>
                <Text color="#94A3B8" fontSize="0.75rem">
                  {activity.description}
                </Text>
                <Text color="#64748B" fontSize="0.75rem">
                  {activity.time}
                </Text>
              </Flex>
            </Flex>
          ))
        )}
      </Flex>
    </Card>
  );
};

export default ActivityFeed;

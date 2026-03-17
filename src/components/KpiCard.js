import React from 'react';
import { Card, Flex, Text, Heading, View } from '@aws-amplify/ui-react';

const KpiCard = ({ title, value, subtitle, icon, trend, color = '#3B82F6' }) => {
  return (
    <Card
      style={{
        background: '#1a1f2e',
        border: '1px solid #2a3142',
        borderRadius: '8px',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '100px',
          height: '100px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '50%'
        }}
      />
      <Flex direction="column" gap="0.75rem">
        <Flex justifyContent="space-between" alignItems="center">
          <Text color="#94A3B8" fontSize="0.875rem" fontWeight="500" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </Text>
          <View
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: '#2a3142',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem'
            }}
          >
            {icon}
          </View>
        </Flex>
        <Heading level={2} color="white" style={{ fontSize: '2.5rem', fontWeight: '700', margin: 0 }}>
          {value}
        </Heading>
        {subtitle && (
          <Text color="#64748B" fontSize="0.875rem">
            {subtitle}
          </Text>
        )}
        {trend && (
          <Flex alignItems="center" gap="0.5rem">
            <Text color={trend > 0 ? '#10B981' : '#EF4444'} fontSize="0.875rem" fontWeight="600">
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </Text>
            <Text color="#64748B" fontSize="0.875rem">vs last month</Text>
          </Flex>
        )}
      </Flex>
    </Card>
  );
};

export default KpiCard;

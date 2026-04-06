import React from 'react';
import { Card } from '@aws-amplify/ui-react';

const DarkCard = ({ children, ...props }) => {
  return (
    <Card
      {...props}
      style={{
        background: '#1a1f2e',
        border: '1px solid #2a3142',
        borderRadius: '8px',
        ...props.style
      }}
    >
      {children}
    </Card>
  );
};

export default DarkCard;

import React from 'react';
import { Flex, Heading, Card, Text, Loader } from '@aws-amplify/ui-react';
import StudentDashboard from './StudentDashboard';
import FacultyDashboard from './FacultyDashboard';
// Import other dashboards as needed

const Dashboard = ({ user }) => {
  if (!user) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }

  // Render dashboard based on user role
  switch (user.role) {
    case 'Student':
      return <StudentDashboard user={user} />;
    case 'Faculty':
      return <FacultyDashboard user={user} />;
    case 'Coordinator':
      // TODO: Implement CoordinatorDashboard
      return (
        <Card padding="2rem">
          <Heading level={2}>Coordinator Dashboard</Heading>
          <Text>Coordinator dashboard is under development.</Text>
        </Card>
      );
    case 'Admin':
      // TODO: Implement AdminDashboard
      return (
        <Card padding="2rem">
          <Heading level={2}>Admin Dashboard</Heading>
          <Text>Admin dashboard is under development.</Text>
        </Card>
      );
    default:
      return (
        <Card padding="2rem">
          <Heading level={2}>Welcome to Research Marketplace</Heading>
          <Text>Your role is not recognized. Please contact an administrator.</Text>
        </Card>
      );
  }
};

export default Dashboard;
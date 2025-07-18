import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { 
  Flex, 
  Heading, 
  Card, 
  Collection, 
  Text, 
  Button, 
  Badge,
  Divider,
  View
} from '@aws-amplify/ui-react';
import { Link } from 'react-router-dom';

// Import Amplify Studio components
import { ResearchOpportunityCard } from '../ui-components';

// Import GraphQL operations
import { getUser, listResearchOpportunities } from '../graphql/queries';
import { getRecommendedOpportunities } from '../graphql/custom-queries';

const Dashboard = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load dashboard data
    fetchDashboardData();
  }, [user]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // Get user data with applications and projects
      const userData = await API.graphql(
        graphqlOperation(getUser, { 
          id: user.id,
          limit: 3
        })
      );
      
      // Get recent applications
      setApplications(userData.data.getUser.applications.items.slice(0, 3));
      
      // Get active projects
      setProjects(userData.data.getUser.projects.items
        .filter(project => project.status === 'ACTIVE')
        .slice(0, 3)
      );
      
      // Get recommended opportunities
      const recommendedData = await API.graphql(
        graphqlOperation(getRecommendedOpportunities, {
          userId: user.id,
          limit: 3
        })
      );
      
      setRecommendations(recommendedData.data.getRecommendedOpportunities);
      
      // Get upcoming deadlines
      const opportunityData = await API.graphql(
        graphqlOperation(listResearchOpportunities, {
          filter: {
            status: { eq: 'PUBLISHED' },
            deadline: { ge: new Date().toISOString() }
          },
          limit: 5,
          sort: { field: 'deadline', direction: 'ASC' }
        })
      );
      
      setDeadlines(opportunityData.data.listResearchOpportunities.items);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  }

  // Format date for display
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  // Get status badge color
  function getStatusColor(status) {
    switch (status) {
      case 'ACCEPTED':
      case 'ACTIVE':
      case 'COMPLETED':
        return 'success';
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
        return 'info';
      case 'REJECTED':
      case 'CANCELLED':
        return 'error';
      default:
        return 'warning';
    }
  }

  if (loading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <p>Loading dashboard...</p>
      </Flex>
    );
  }

  return (
    <Flex direction="column" padding="2rem" gap="2rem">
      <Heading level={2}>Welcome, {user.name}!</Heading>
      <Text>Your research journey starts here. Explore opportunities, track your applications, and manage your research projects.</Text>
      
      <Flex
        direction={{ base: 'column', large: 'row' }}
        gap="2rem"
      >
        {/* Left Column */}
        <Flex direction="column" gap="2rem" flex="2">
          {/* Recent Applications */}
          <Card>
            <Flex direction="column" gap="1rem">
              <Flex justifyContent="space-between" alignItems="center">
                <Heading level={4}>My Applications</Heading>
                <Link to="/activity">
                  <Button size="small">View All</Button>
                </Link>
              </Flex>
              
              <Divider />
              
              {applications.length === 0 ? (
                <Text>No applications submitted yet.</Text>
              ) : (
                applications.map((app) => (
                  <Flex
                    key={app.id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    padding="0.75rem"
                    backgroundColor="var(--amplify-colors-background-secondary)"
                    borderRadius="var(--amplify-radii-medium)"
                  >
                    <Flex direction="column" gap="0.25rem">
                      <Text fontWeight="bold">{app.opportunity.title}</Text>
                      <Text fontSize="small">Submitted: {formatDate(app.submissionDate)}</Text>
                    </Flex>
                    <Badge variation={getStatusColor(app.status)}>
                      {app.status}
                    </Badge>
                  </Flex>
                ))
              )}
            </Flex>
          </Card>
          
          {/* Active Projects */}
          <Card>
            <Flex direction="column" gap="1rem">
              <Flex justifyContent="space-between" alignItems="center">
                <Heading level={4}>My Projects</Heading>
                <Link to="/activity">
                  <Button size="small">View All</Button>
                </Link>
              </Flex>
              
              <Divider />
              
              {projects.length === 0 ? (
                <Text>No active projects.</Text>
              ) : (
                projects.map((project) => (
                  <Flex
                    key={project.id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    padding="0.75rem"
                    backgroundColor="var(--amplify-colors-background-secondary)"
                    borderRadius="var(--amplify-radii-medium)"
                  >
                    <Flex direction="column" gap="0.25rem">
                      <Text fontWeight="bold">{project.title}</Text>
                      <Text fontSize="small">Faculty: {project.faculty.name}</Text>
                    </Flex>
                    <Badge variation="success">
                      {project.status}
                    </Badge>
                  </Flex>
                ))
              )}
            </Flex>
          </Card>
        </Flex>
        
        {/* Right Column */}
        <Flex direction="column" gap="2rem" flex="1">
          {/* Upcoming Deadlines */}
          <Card>
            <Flex direction="column" gap="1rem">
              <Heading level={4}>Upcoming Deadlines</Heading>
              
              <Divider />
              
              {deadlines.length === 0 ? (
                <Text>No upcoming deadlines.</Text>
              ) : (
                deadlines.map((opp) => (
                  <Flex
                    key={opp.id}
                    direction="column"
                    gap="0.25rem"
                    padding="0.75rem"
                    backgroundColor="var(--amplify-colors-background-secondary)"
                    borderRadius="var(--amplify-radii-medium)"
                  >
                    <Text fontWeight="bold">{opp.title}</Text>
                    <Text fontSize="small">Deadline: {formatDate(opp.deadline)}</Text>
                  </Flex>
                ))
              )}
            </Flex>
          </Card>
          
          {/* Quick Actions */}
          <Card>
            <Flex direction="column" gap="1rem">
              <Heading level={4}>Quick Actions</Heading>
              
              <Divider />
              
              <Flex direction="column" gap="0.5rem">
                <Link to="/search">
                  <Button variation="primary" width="100%">
                    Find Opportunities
                  </Button>
                </Link>
                
                <Link to="/profile">
                  <Button width="100%">
                    Update Profile
                  </Button>
                </Link>
                
                <Link to="/profile?tab=documents">
                  <Button width="100%">
                    Upload Documents
                  </Button>
                </Link>
              </Flex>
            </Flex>
          </Card>
        </Flex>
      </Flex>
      
      {/* Recommended Opportunities */}
      <View>
        <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem">
          <Heading level={3}>Recommended Opportunities</Heading>
          <Link to="/search">
            <Button size="small">View All</Button>
          </Link>
        </Flex>
        
        {recommendations.length === 0 ? (
          <Card>
            <Text>No recommendations available. Update your profile interests to get personalized recommendations.</Text>
          </Card>
        ) : (
          <Collection
            type="grid"
            items={recommendations}
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
      </View>
    </Flex>
  );
};

export default Dashboard;
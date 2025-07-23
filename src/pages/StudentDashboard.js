import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { 
  Flex, 
  Heading, 
  Text, 
  Button, 
  Card, 
  Divider,
  Collection,
  Loader,
  View,
  Tabs,
  TabItem
} from '@aws-amplify/ui-react';
import { listApplications, listProjects } from '../graphql/queries';
import ApplicationStatus from '../components/ApplicationStatus';
import ApplicationStatusGuide from '../components/ApplicationStatusGuide';

const StudentDashboard = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('applications');
  
  useEffect(() => {
    fetchData();
  }, [user]);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch student's applications
      const applicationFilter = {
        studentID: { eq: user.username }
      };
      
      const applicationResult = await API.graphql(graphqlOperation(listApplications, { 
        filter: applicationFilter,
        limit: 100
      }));
      
      setApplications(applicationResult.data.listApplications.items);
      
      // Fetch active projects
      const projectFilter = {
        isActive: { eq: true }
      };
      
      const projectResult = await API.graphql(graphqlOperation(listProjects, { 
        filter: projectFilter,
        limit: 10
      }));
      
      setProjects(projectResult.data.listProjects.items);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApplicationUpdate = () => {
    fetchData();
  };
  
  // Count applications by status
  const getStatusCounts = () => {
    const counts = {
      draft: 0,
      pending: 0,
      approved: 0,
      returned: 0
    };
    
    applications.forEach(app => {
      if (app.status === 'Draft') {
        counts.draft++;
      } else if (['Faculty Review', 'Department Review', 'Admin Review'].includes(app.status)) {
        counts.pending++;
      } else if (app.status === 'Approved') {
        counts.approved++;
      } else if (['Returned', 'Rejected'].includes(app.status)) {
        counts.returned++;
      }
    });
    
    return counts;
  };
  
  const statusCounts = getStatusCounts();
  
  if (loading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }
  
  return (
    <Flex direction="column" padding="2rem" gap="2rem">
      <Heading level={2}>Student Dashboard</Heading>
      <Text>Welcome, {user.name}!</Text>
      
      {error && <Text color="red">{error}</Text>}
      
      <Flex direction={{ base: 'column', large: 'row' }} gap="1rem">
        <Card variation="elevated" flex="1">
          <Heading level={4}>My Applications</Heading>
          <Flex wrap="wrap" gap="1rem" marginTop="1rem">
            <Card variation="outlined" padding="1rem" flex="1">
              <Heading level={5} color="blue">{statusCounts.draft}</Heading>
              <Text>Drafts</Text>
            </Card>
            <Card variation="outlined" padding="1rem" flex="1">
              <Heading level={5} color="orange">{statusCounts.pending}</Heading>
              <Text>Pending</Text>
            </Card>
            <Card variation="outlined" padding="1rem" flex="1">
              <Heading level={5} color="green">{statusCounts.approved}</Heading>
              <Text>Approved</Text>
            </Card>
            <Card variation="outlined" padding="1rem" flex="1">
              <Heading level={5} color="red">{statusCounts.returned}</Heading>
              <Text>Returned</Text>
            </Card>
          </Flex>
        </Card>
        
        <Card variation="elevated" flex="1">
          <Heading level={4}>Quick Links</Heading>
          <Flex direction="column" gap="0.5rem" marginTop="1rem">
            <Button variation="primary" onClick={() => setActiveTab('opportunities')}>
              Browse Research Opportunities
            </Button>
            <Button onClick={() => setActiveTab('applications')}>
              View My Applications
            </Button>
            <Button onClick={() => setActiveTab('guide')}>
              Application Status Guide
            </Button>
          </Flex>
        </Card>
      </Flex>
      
      <Tabs
        currentIndex={activeTab === 'applications' ? 0 : activeTab === 'opportunities' ? 1 : 2}
        onChange={(index) => setActiveTab(index === 0 ? 'applications' : index === 1 ? 'opportunities' : 'guide')}
      >
        <TabItem title="My Applications">
          {applications.length === 0 ? (
            <Card>
              <Text>You haven't submitted any applications yet.</Text>
              <Button 
                variation="primary" 
                onClick={() => setActiveTab('opportunities')}
                marginTop="1rem"
              >
                Browse Opportunities
              </Button>
            </Card>
          ) : (
            <Collection
              items={applications}
              type="list"
              gap="1rem"
              wrap="nowrap"
              direction="column"
            >
              {(application) => (
                <ApplicationStatus 
                  key={application.id}
                  application={application}
                  isStudent={true}
                  onUpdate={handleApplicationUpdate}
                />
              )}
            </Collection>
          )}
        </TabItem>
        
        <TabItem title="Research Opportunities">
          {projects.length === 0 ? (
            <Card>
              <Text>No active research opportunities available at this time.</Text>
            </Card>
          ) : (
            <Collection
              items={projects}
              type="grid"
              templateColumns={{ base: '1fr', medium: '1fr 1fr' }}
              gap="1rem"
            >
              {(project) => (
                <Card key={project.id}>
                  <Flex direction="column" gap="0.5rem">
                    <Heading level={5}>{project.title}</Heading>
                    <Text fontWeight="bold">Department: {project.department}</Text>
                    <Text noOfLines={3}>{project.description}</Text>
                    <Divider />
                    <Flex wrap="wrap" gap="0.5rem">
                      {project.skillsRequired?.map((skill, index) => (
                        <Card 
                          key={index}
                          backgroundColor="rgba(0, 0, 0, 0.05)"
                          padding="0.25rem 0.5rem"
                          borderRadius="1rem"
                        >
                          <Text fontSize="0.8rem">{skill}</Text>
                        </Card>
                      ))}
                    </Flex>
                    <Divider />
                    <Flex justifyContent="space-between" alignItems="center">
                      <Text fontSize="0.9rem">
                        Deadline: {new Date(project.applicationDeadline).toLocaleDateString()}
                      </Text>
                      <Button variation="primary" size="small">
                        View Details
                      </Button>
                    </Flex>
                  </Flex>
                </Card>
              )}
            </Collection>
          )}
        </TabItem>
        
        <TabItem title="Status Guide">
          <ApplicationStatusGuide />
        </TabItem>
      </Tabs>
    </Flex>
  );
};

export default StudentDashboard;
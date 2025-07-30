import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { Flex, Heading, Tabs, TabItem, Card, Text, Collection, Loader, Badge } from '@aws-amplify/ui-react';
import { listApplications, listProjects } from '../graphql/simplified-operations';
import ApplicationStatus from '../components/ApplicationStatus';

const ActivityPage = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, [user]);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = user.id || user.username;
      
      // Fetch student's applications
      const applicationResult = await API.graphql(graphqlOperation(listApplications, { 
        limit: 100
      }));
      
      const userApplications = applicationResult.data?.listApplications?.items?.filter(
        app => app.studentID === userId
      ) || [];
      
      // Fetch all projects to enrich applications
      const projectResult = await API.graphql(graphqlOperation(listProjects, { 
        limit: 100
      }));
      
      const allProjects = projectResult.data?.listProjects?.items || [];
      
      // Enrich applications with project data and sort by most recent
      const enrichedApplications = userApplications.map(app => {
        const project = allProjects.find(p => p.id === app.projectID);
        return {
          ...app,
          project: project || null
        };
      }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      
      setApplications(enrichedApplications);
      
      // For projects, show approved applications as active projects
      const approvedProjects = enrichedApplications
        .filter(app => app.status === 'Approved' && app.project)
        .map(app => app.project);
      
      setProjects(approvedProjects);
    } catch (err) {
      console.error('Error fetching activity data:', err);
      setError('Failed to load activity data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }
  
  return (
    <Flex direction="column" padding="2rem" gap="2rem">
      <Heading level={2}>My Activity</Heading>
      
      {error && <Text color="red">{error}</Text>}
      
      <Tabs>
        <TabItem title="Applications">
          {applications.length === 0 ? (
            <Card>
              <Text>No applications submitted yet.</Text>
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
                  onUpdate={fetchData}
                />
              )}
            </Collection>
          )}
        </TabItem>
        
        <TabItem title="Projects">
          {projects.length === 0 ? (
            <Card>
              <Text>No active projects.</Text>
            </Card>
          ) : (
            <Collection
              items={projects}
              type="list"
              gap="1rem"
              wrap="nowrap"
              direction="column"
            >
              {(project) => (
                <Card key={project.id}>
                  <Flex direction="column" gap="0.5rem">
                    <Flex justifyContent="space-between" alignItems="center">
                      <Heading level={5}>{project.title}</Heading>
                      <Badge backgroundColor="green" color="white">
                        Active
                      </Badge>
                    </Flex>
                    <Text fontWeight="bold">Department: {project.department}</Text>
                    <Text>{project.description}</Text>
                  </Flex>
                </Card>
              )}
            </Collection>
          )}
        </TabItem>
      </Tabs>
    </Flex>
  );
};

export default ActivityPage;
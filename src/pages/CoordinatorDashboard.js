import React, { useState, useEffect } from 'react';
import { API, graphqlOperation, Auth } from 'aws-amplify';
import { 
  Flex, 
  Heading, 
  Text, 
  Card, 
  Divider,
  Collection,
  Loader,
  Tabs,
  TabItem,
  Badge
} from '@aws-amplify/ui-react';
import { listApplications, listProjects, listUsers } from '../graphql/operations';
import ApplicationReview from '../components/ApplicationReview';

const CoordinatorDashboard = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  
  useEffect(() => {
    fetchData();
  }, [user]);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all applications
      const applicationResult = await API.graphql(graphqlOperation(listApplications, { 
        limit: 100
      }));
      
      // Fetch all projects to get department info
      const projectResult = await API.graphql(graphqlOperation(listProjects, { 
        limit: 100
      }));
      
      // Fetch all users to get student info
      const usersResult = await API.graphql(graphqlOperation(listUsers, { 
        limit: 100
      }));
      
      const allApplications = applicationResult.data.listApplications.items;
      const allProjects = projectResult.data.listProjects.items;
      const allUsers = usersResult.data.listUsers.items;
      
      // Filter applications for coordinator's department and enrich with data
      const departmentApplications = allApplications
        .map(app => {
          const project = allProjects.find(p => p.id === app.projectID);
          const student = allUsers.find(u => u.id === app.studentID);
          const faculty = allUsers.find(u => u.id === project?.facultyID);
          
          return {
            ...app,
            project,
            student,
            faculty
          };
        })
        .filter(app => 
          app.project && 
          app.student && 
          app.project.department === user.department &&
          app.status === 'Department Review'
        );
      
      setApplications(departmentApplications);
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
  const getApplicationCounts = () => {
    const counts = {
      pending: applications.filter(app => app.status === 'Department Review').length,
      approved: applications.filter(app => app.status === 'Admin Review').length,
      returned: applications.filter(app => ['Returned', 'Rejected'].includes(app.status)).length,
      total: applications.length
    };
    
    return counts;
  };
  
  const applicationCounts = getApplicationCounts();
  
  if (loading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }
  
  return (
    <Flex direction="column" padding="2rem" gap="2rem">
      <Heading level={2}>Coordinator Dashboard</Heading>
      <Text>Welcome, {user.name}! Review applications for {user.department} department.</Text>
      
      {error && <Text color="red">{error}</Text>}
      
      <Flex direction={{ base: 'column', large: 'row' }} gap="1rem">
        <Card variation="elevated" flex="1">
          <Heading level={4}>Department Applications</Heading>
          <Flex wrap="wrap" gap="1rem" marginTop="1rem">
            <Card variation="outlined" padding="1rem" flex="1">
              <Heading level={5} color="orange">{applicationCounts.pending}</Heading>
              <Text>Pending Review</Text>
            </Card>
            <Card variation="outlined" padding="1rem" flex="1">
              <Heading level={5} color="green">{applicationCounts.approved}</Heading>
              <Text>Forwarded to Admin</Text>
            </Card>
          </Flex>
        </Card>
        
        <Card variation="elevated" flex="2">
          <Heading level={4}>Review Guidelines</Heading>
          <Text fontSize="0.9rem" marginTop="1rem">
            Review proposals from your department before forwarding to admin. Ensure proposals include:
          </Text>
          <Text fontSize="0.8rem" marginTop="0.5rem">
            • Term and faculty supervisor names<br/>
            • Research location details<br/>
            • Descriptive project overview<br/>
            • Communication plan with mentor<br/>
            • Specific research role and work plan<br/>
            • Personal goals and deliverables<br/>
            • Personal statement
          </Text>
        </Card>
      </Flex>
      
      <Tabs
        currentIndex={activeTabIndex}
        onChange={(index) => setActiveTabIndex(index)}
      >
        <TabItem title="Pending Review">
          {applications.filter(app => app.status === 'Department Review').length === 0 ? (
            <Card>
              <Text>No applications pending review from your department.</Text>
            </Card>
          ) : (
            <Collection
              items={applications.filter(app => app.status === 'Department Review')}
              type="grid"
              templateColumns="repeat(auto-fit, minmax(350px, 1fr))"
              gap="1rem"
            >
              {(application) => (
                <ApplicationReview 
                  key={application.id}
                  application={application}
                  userRole="Coordinator"
                  onUpdate={handleApplicationUpdate}
                />
              )}
            </Collection>
          )}
        </TabItem>
        
        <TabItem title="All Applications">
          {applications.length === 0 ? (
            <Card>
              <Text>No applications found for your department.</Text>
            </Card>
          ) : (
            <Flex direction="column" gap="1rem">
              <Collection
                items={applications}
                type="grid"
                templateColumns="repeat(auto-fit, minmax(350px, 1fr))"
                gap="1rem"
              >
                {(application) => (
                  <Card key={application.id}>
                    <Flex direction="column" gap="0.5rem">
                      <Flex justifyContent="space-between" alignItems="center">
                        <Heading level={5}>{application.project?.title}</Heading>
                        <Badge 
                          backgroundColor={
                            application.status === 'Department Review' ? 'orange' :
                            application.status === 'Admin Review' ? 'blue' :
                            application.status === 'Approved' ? 'green' : 'red'
                          }
                          color="white"
                        >
                          {application.status}
                        </Badge>
                      </Flex>
                      
                      <Text><strong>Student:</strong> {application.student?.name}</Text>
                      <Text><strong>Faculty:</strong> {application.faculty?.name}</Text>
                      <Text fontSize="0.9rem">
                        <strong>Submitted:</strong> {new Date(application.createdAt).toLocaleDateString()}
                      </Text>
                      
                      {application.status === 'Department Review' && (
                        <ApplicationReview 
                          application={application}
                          userRole="Coordinator"
                          onUpdate={handleApplicationUpdate}
                          compact={true}
                        />
                      )}
                    </Flex>
                  </Card>
                )}
              </Collection>
            </Flex>
          )}
        </TabItem>
      </Tabs>
    </Flex>
  );
};

export default CoordinatorDashboard;
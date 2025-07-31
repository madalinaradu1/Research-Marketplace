import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
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

const AdminDashboard = ({ user }) => {
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
      // Fetch all applications with relevant courses
      const listApplicationsWithCourses = /* GraphQL */ `
        query ListApplications(
          $filter: ModelApplicationFilterInput
          $limit: Int
          $nextToken: String
        ) {
          listApplications(filter: $filter, limit: $limit, nextToken: $nextToken) {
            items {
              id
              studentID
              projectID
              statement
              resumeKey
              transcriptLink
              relevantCourses {
                courseName
                courseNumber
                grade
                semester
                year
              }
              status
              statusDetail
              facultyNotes
              coordinatorNotes
              adminNotes
              createdAt
              updatedAt
            }
            nextToken
          }
        }
      `;
      
      const applicationResult = await API.graphql(graphqlOperation(listApplicationsWithCourses, { 
        limit: 100
      }));
      
      // Fetch all projects to get project info
      const projectResult = await API.graphql(graphqlOperation(listProjects, { 
        limit: 100
      }));
      
      // Fetch all users to get student and faculty info
      const usersResult = await API.graphql(graphqlOperation(listUsers, { 
        limit: 100
      }));
      
      const allApplications = applicationResult.data.listApplications.items;
      const allProjects = projectResult.data.listProjects.items;
      const allUsers = usersResult.data.listUsers.items;
      
      // Filter applications for admin level (Admin Review and Approved) and enrich with data
      const adminApplications = allApplications
        .filter(app => ['Admin Review', 'Approved'].includes(app.status))
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
        .filter(app => app.project && app.student);
      
      setApplications(adminApplications);
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
      pending: applications.filter(app => app.status === 'Admin Review').length,
      approved: applications.filter(app => app.status === 'Approved').length,
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
      <Heading level={2}>Admin Dashboard</Heading>
      <Text>Welcome, {user.name}! Review applications for final approval.</Text>
      
      {error && <Text color="red">{error}</Text>}
      
      <Flex direction={{ base: 'column', large: 'row' }} gap="1rem">
        <Card variation="elevated" flex="1">
          <Heading level={4}>Application Reviews</Heading>
          <Flex wrap="wrap" gap="1rem" marginTop="1rem">
            <Card variation="outlined" padding="1rem" flex="1">
              <Heading level={5} color="orange">{applicationCounts.pending}</Heading>
              <Text>Pending Final Review</Text>
            </Card>
            <Card variation="outlined" padding="1rem" flex="1">
              <Heading level={5} color="green">{applicationCounts.approved}</Heading>
              <Text>Approved</Text>
            </Card>
          </Flex>
        </Card>
        
        <Card variation="elevated" flex="2">
          <Heading level={4}>Review Guidelines</Heading>
          <Text fontSize="0.9rem" marginTop="1rem">
            Final review of applications that have been approved by faculty and coordinators:
          </Text>
          <Text fontSize="0.8rem" marginTop="0.5rem">
            • Verify all requirements are met<br/>
            • Ensure proper documentation is complete<br/>
            • Confirm alignment with university policies<br/>
            • Review faculty and coordinator feedback<br/>
            • Make final approval decision
          </Text>
        </Card>
      </Flex>
      
      <Tabs
        currentIndex={activeTabIndex}
        onChange={(index) => setActiveTabIndex(index)}
      >
        <TabItem title="Pending Review">
          {applications.filter(app => app.status === 'Admin Review').length === 0 ? (
            <Card>
              <Text>No applications pending final review.</Text>
            </Card>
          ) : (
            <Collection
              items={applications.filter(app => app.status === 'Admin Review')}
              type="grid"
              templateColumns="repeat(auto-fit, minmax(350px, 1fr))"
              gap="1rem"
            >
              {(application) => (
                <ApplicationReview 
                  key={application.id}
                  application={application}
                  userRole="Admin"
                  onUpdate={handleApplicationUpdate}
                />
              )}
            </Collection>
          )}
        </TabItem>
        
        <TabItem title="All Applications">
          {applications.length === 0 ? (
            <Card>
              <Text>No applications found for admin review.</Text>
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
                            application.status === 'Admin Review' ? 'orange' :
                            application.status === 'Approved' ? 'green' : 'red'
                          }
                          color="white"
                        >
                          {application.status}
                        </Badge>
                      </Flex>
                      
                      <Text><strong>Student:</strong> {application.student?.name}</Text>
                      <Text><strong>Faculty:</strong> {application.faculty?.name}</Text>
                      <Text><strong>Department:</strong> {application.project?.department}</Text>
                      <Text fontSize="0.9rem">
                        <strong>Submitted:</strong> {new Date(application.createdAt).toLocaleDateString()}
                      </Text>
                      
                      {application.status === 'Admin Review' && (
                        <ApplicationReview 
                          application={application}
                          userRole="Admin"
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

export default AdminDashboard;
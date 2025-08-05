import React, { useState, useEffect } from 'react';
import { API, graphqlOperation, Auth } from 'aws-amplify';
import { 
  Flex, 
  Heading, 
  Text, 
  Button,
  Card, 
  Divider,
  Collection,
  Loader,
  Tabs,
  TabItem,
  Badge,
  View
} from '@aws-amplify/ui-react';
import { listApplications, listProjects, listUsers } from '../graphql/operations';
import ApplicationReview from '../components/ApplicationReview';

const CoordinatorDashboard = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [viewingApplication, setViewingApplication] = useState(null);
  
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
              documentKey
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
      const enrichedApplications = allApplications.map(app => {
        const project = allProjects.find(p => p.id === app.projectID);
        const student = allUsers.find(u => u.id === app.studentID);
        const faculty = allUsers.find(u => u.id === project?.facultyID);
        
        return {
          ...app,
          project,
          student,
          faculty
        };
      });
      
      const departmentApplications = enrichedApplications.filter(app => 
        app.project && 
        app.student && 
        app.project.department === user.department &&
        ['Department Review', 'Admin Review', 'Approved', 'Returned', 'Rejected'].includes(app.status)
      );
      
      console.log('CoordinatorDashboard - All applications:', allApplications.length);
      console.log('CoordinatorDashboard - Department applications:', departmentApplications.length);
      console.log('CoordinatorDashboard - Department Review applications:', 
        departmentApplications.filter(app => app.status === 'Department Review').length
      );
      console.log('CoordinatorDashboard - User department:', user.department);
      console.log('CoordinatorDashboard - Department application statuses:', 
        departmentApplications.map(app => ({ id: app.id, status: app.status, hasCoordinatorNotes: !!app.coordinatorNotes }))
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
        onChange={(index) => {
          setActiveTabIndex(index);
          if (index === 1) { // Pending Review tab
            fetchData(); // Refresh data when switching to pending review
          }
        }}
      >
        <TabItem title="All Applications">
          {applications.length === 0 ? (
            <Card>
              <Text>No applications found for your department.</Text>
            </Card>
          ) : (
            <Collection
              items={applications}
              type="grid"
              templateColumns={{ base: '1fr', medium: '1fr 1fr' }}
              gap="1rem"
            >
              {(application) => (
                <Card key={application.id}>
                  <Flex direction="column" gap="0.5rem">
                    <Flex justifyContent="space-between" alignItems="flex-start">
                      <Heading level={5}>{application.project?.title}</Heading>
                      <Badge 
                        backgroundColor={
                          application.status === 'Department Review' ? 'purple' :
                          application.status === 'Admin Review' ? 'orange' :
                          application.status === 'Approved' ? 'green' : 'red'
                        }
                        color="white"
                      >
                        {application.status}
                      </Badge>
                    </Flex>
                    <Text fontWeight="bold">Student: {application.student?.name}</Text>
                    <Text fontWeight="bold">Faculty: {application.faculty?.name}</Text>
                    <Text>{application.project?.description?.length > 150 ? application.project.description.substring(0, 150) + '...' : application.project?.description}</Text>
                    <Divider />
                    <Flex wrap="wrap" gap="0.5rem">
                      {application.project?.skillsRequired?.map((skill, index) => (
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
                      <Flex direction="column" gap="0.25rem">
                        <Text fontSize="0.9rem">
                          Submitted: {new Date(application.createdAt).toLocaleDateString()}
                        </Text>
                        {application.updatedAt !== application.createdAt && (
                          <Text fontSize="0.8rem">
                            Last modified: {new Date(application.updatedAt).toLocaleString()}
                          </Text>
                        )}
                      </Flex>
                      <Flex gap="0.5rem">
                        <Button 
                          size="small" 
                          onClick={() => setViewingApplication(application)}
                        >
                          View Details
                        </Button>
                        {application.status === 'Department Review' && (
                          <Button 
                            variation="primary" 
                            size="small" 
                            onClick={() => setViewingApplication(application)}
                          >
                            Review
                          </Button>
                        )}
                      </Flex>
                    </Flex>
                  </Flex>
                </Card>
              )}
            </Collection>
          )}
        </TabItem>
        
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
                  hideRelevantCourses={true}
                />
              )}
            </Collection>
          )}
        </TabItem>
      </Tabs>
      
      {/* View Application Details Modal */}
      {viewingApplication && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1000 }}
          onClick={() => setViewingApplication(null)}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            height="100%"
            padding="2rem"
          >
            <Card
              maxWidth="800px"
              width="100%"
              maxHeight="90vh"
              style={{ overflow: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <ApplicationReview 
                application={viewingApplication}
                userRole="Coordinator"
                onUpdate={() => {
                  handleApplicationUpdate();
                  setViewingApplication(null);
                }}
              />
              <Button 
                onClick={() => setViewingApplication(null)}
                marginTop="1rem"
              >
                Close
              </Button>
            </Card>
          </Flex>
        </View>
      )}
    </Flex>
  );
};

export default CoordinatorDashboard;
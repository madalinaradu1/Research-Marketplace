import React, { useState, useEffect } from 'react';
import { API, graphqlOperation, Auth } from 'aws-amplify';
import { Flex, Heading, Tabs, TabItem, Card, Text, Collection, Loader, Badge, Button } from '@aws-amplify/ui-react';
import { listApplications, listProjects, listUsers } from '../graphql/operations';
import ApplicationStatus from '../components/ApplicationStatus';

const ActivityPage = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [projectsPage, setProjectsPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    fetchData();
  }, [user]);
  
  // Pagination helper function
  const renderPagination = (items, currentPage, setPage) => {
    const totalPages = Math.ceil(items.length / itemsPerPage);
    if (totalPages <= 1) return null;
    
    return (
      <Flex justifyContent="flex-end" alignItems="center" gap="0.5rem" marginTop="1rem">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <Button
            key={page}
            size="small"
            backgroundColor={page === currentPage ? "#552b9a" : "white"}
            color={page === currentPage ? "white" : "black"}
            border="1px solid #552b9a"
            onClick={() => setPage(page)}
          >
            {page}
          </Button>
        ))}
      </Flex>
    );
  };
  
  // Get paginated items
  const getPaginatedItems = (items, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  };
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      const userId = currentUser.username;
      
      if (user.role === 'Faculty') {
        // Fetch faculty's projects
        const projectFilter = {
          facultyID: { eq: userId }
        };
        
        const projectResult = await API.graphql(graphqlOperation(listProjects, { 
          filter: projectFilter,
          limit: 100
        }));
        
        const facultyProjects = projectResult.data.listProjects.items;
        setProjects(facultyProjects);
        
        // Fetch applications for faculty's projects
        if (facultyProjects.length > 0) {
          const projectIds = facultyProjects.map(p => p.id);
          
          const applicationResult = await API.graphql(graphqlOperation(listApplications, { 
            limit: 100
          }));
          
          const facultyApplications = applicationResult.data.listApplications.items.filter(
            app => projectIds.includes(app.projectID)
          );
          
          // Fetch all users to match with applications
          const usersResult = await API.graphql(graphqlOperation(listUsers, { limit: 100 }));
          const allUsers = usersResult.data.listUsers.items || [];
          
          // Enrich applications with project and student data
          const enrichedApplications = facultyApplications
            .map(app => {
              const project = facultyProjects.find(p => p.id === app.projectID);
              const student = allUsers.find(u => u.id === app.studentID);
              
              return {
                ...app,
                project,
                student
              };
            })
            .filter(app => app.student)
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          
          setApplications(enrichedApplications);
        }
      } else {
        // Student logic (existing)
        const applicationResult = await API.graphql(graphqlOperation(listApplications, { 
          limit: 100
        }));
        
        const userApplications = applicationResult.data?.listApplications?.items?.filter(
          app => app.studentID === userId
        ) || [];
        
        const projectResult = await API.graphql(graphqlOperation(listProjects, { 
          limit: 100
        }));
        
        const allProjects = projectResult.data?.listProjects?.items || [];
        
        const enrichedApplications = userApplications.map(app => {
          const project = allProjects.find(p => p.id === app.projectID);
          return {
            ...app,
            project: project || null
          };
        }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        setApplications(enrichedApplications);
        
        const approvedProjects = enrichedApplications
          .filter(app => app.status === 'Approved' && app.project)
          .map(app => app.project);
        
        setProjects(approvedProjects);
      }
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
      {/* Header */}
      <Card
        backgroundColor="white"
        padding="1.5rem"
        style={{
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <Heading 
          level={2} 
          color="#2d3748"
          fontWeight="600"
          margin="0"
        >
          My Activity
        </Heading>
      </Card>
      
      {error && <Text color="red">{error}</Text>}
      
      <Tabs
        onChange={(index) => {
          // Reset pagination when switching tabs
          setApplicationsPage(1);
          setProjectsPage(1);
        }}
      >
        <TabItem title="Applications">
          {applications.length === 0 ? (
            <Card
              backgroundColor="#f8fafc"
              padding="2rem"
              textAlign="center"
              style={{
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <Text color="#4a5568" fontSize="1.1rem">
                {user.role === 'Faculty' ? 'No applications received yet.' : 'No applications submitted yet.'}
              </Text>
            </Card>
          ) : (
            <>
              <Collection
                items={getPaginatedItems(applications, applicationsPage)}
                type="list"
                gap="1rem"
                wrap="nowrap"
                direction="column"
              >
                {(application) => (
                  user.role === 'Faculty' ? (
                    <Card 
                      key={application.id}
                      backgroundColor="white"
                      padding="1.5rem"
                      style={{
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Flex direction="column" gap="0.5rem">
                        <Flex justifyContent="space-between" alignItems="center">
                          <Heading level={5} color="#2d3748">{application.project?.title}</Heading>
                          <Badge 
                            backgroundColor={
                              application.status === 'Faculty Review' ? 'orange' :
                              application.status === 'Approved' ? '#4caf50' :
                              application.status === 'Rejected' ? 'red' : 'gray'
                            }
                            color="white"
                          >
                            {application.status}
                          </Badge>
                        </Flex>
                        <Text color="#4a5568"><strong>Student:</strong> {application.student?.name}</Text>
                        <Text color="#4a5568"><strong>Email:</strong> {application.student?.email}</Text>
                        <Text color="#4a5568"><strong>Submitted:</strong> {new Date(application.createdAt).toLocaleDateString()}</Text>
                      </Flex>
                    </Card>
                  ) : (
                    <ApplicationStatus 
                      key={application.id}
                      application={application}
                      isStudent={true}
                      onUpdate={fetchData}
                    />
                  )
                )}
              </Collection>
              {renderPagination(applications, applicationsPage, setApplicationsPage)}
            </>
          )}
        </TabItem>
        
        <TabItem title="Projects">
          {projects.length === 0 ? (
            <Card
              backgroundColor="#f8fafc"
              padding="2rem"
              textAlign="center"
              style={{
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <Text color="#4a5568" fontSize="1.1rem">
                {user.role === 'Faculty' ? 'No projects created yet.' : 'No active projects.'}
              </Text>
            </Card>
          ) : (
            <>
              <Collection
                items={getPaginatedItems(projects, projectsPage)}
                type="list"
                gap="1rem"
                wrap="nowrap"
                direction="column"
              >
                {(project) => (
                  <Card 
                    key={project.id}
                    backgroundColor="white"
                    padding="1.5rem"
                    style={{
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Flex direction="column" gap="0.5rem">
                      <Flex justifyContent="space-between" alignItems="center">
                        <Heading level={5} color="#2d3748">{project.title}</Heading>
                        <Badge 
                          backgroundColor={project.isActive ? 'green' : 'gray'}
                          color="white"
                        >
                          {project.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </Flex>
                      <Text fontWeight="bold" color="#2d3748">Department: {project.department}</Text>
                      <div dangerouslySetInnerHTML={{ __html: project.description }} />
                      {user.role === 'Faculty' && (
                        <Text fontSize="0.9rem" color="#4a5568">
                          <strong>Deadline:</strong> {project.applicationDeadline ? new Date(project.applicationDeadline).toLocaleDateString() : 'Not specified'}
                        </Text>
                      )}
                    </Flex>
                  </Card>
                )}
              </Collection>
              {renderPagination(projects, projectsPage, setProjectsPage)}
            </>
          )}
        </TabItem>
      </Tabs>
    </Flex>
  );
};

export default ActivityPage;
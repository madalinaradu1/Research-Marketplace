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
  TabItem,
  TextField,
  TextAreaField
} from '@aws-amplify/ui-react';
import { listApplications, listProjects, createApplication } from '../graphql/simplified-operations';
import EnhancedApplicationForm from '../components/EnhancedApplicationForm';
import ApplicationStatus from '../components/ApplicationStatus';
import ApplicationStatusGuide from '../components/ApplicationStatusGuide';

const StudentDashboard = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    hoursPerWeek: '',
    statement: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, [user]);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch student's applications
      try {
        const userId = user.id || user.username;
        console.log('Fetching applications for user ID:', userId);
        
        const applicationResult = await API.graphql(graphqlOperation(listApplications, { 
          limit: 100
        }));
        
        // Filter applications client-side for now
        const userApplications = applicationResult.data?.listApplications?.items?.filter(
          app => app.studentID === userId
        ) || [];
        
        setApplications(userApplications);
      } catch (appErr) {
        console.error('Error fetching applications:', appErr);
        if (appErr.errors && appErr.errors.length > 0) {
          console.error('GraphQL errors:', appErr.errors);
        }
        // Continue with other operations even if this fails
        setApplications([]);
      }
      
      // Fetch active projects
      try {
        const projectFilter = {
          isActive: { eq: true }
        };
        
        const projectResult = await API.graphql(graphqlOperation(listProjects, { 
          filter: projectFilter,
          limit: 10
        }));
        
        if (projectResult.data && projectResult.data.listProjects) {
          setProjects(projectResult.data.listProjects.items || []);
        } else {
          console.warn('No project data returned');
          setProjects([]);
        }
      } catch (projErr) {
        console.error('Error fetching projects:', projErr);
        // Continue even if this fails
        setProjects([]);
      }
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApplicationUpdate = () => {
    fetchData();
  };
  
  const handleViewDetails = (project) => {
    setSelectedProject(project);
  };
  
  const handleApply = (project) => {
    setSelectedProject(project);
    setApplicationForm({
      hoursPerWeek: '',
      statement: ''
    });
    setShowApplicationForm(true);
  };
  
  const handleApplicationFormChange = (e) => {
    const { name, value } = e.target;
    setApplicationForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const userId = user.id || user.username;
      
      const input = {
        studentID: userId,
        projectID: selectedProject.id,
        statement: `Hours per week: ${applicationForm.hoursPerWeek}\n\n${applicationForm.statement}`,
        status: 'Draft'
      };
      
      await API.graphql(graphqlOperation(createApplication, { input }));
      
      setShowApplicationForm(false);
      setSelectedProject(null);
      fetchData();
    } catch (err) {
      console.error('Error submitting application:', err);
    } finally {
      setIsSubmitting(false);
    }
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
              <Heading level={5}>{user.applicationCount || 0}/3</Heading>
              <Text>Applications Used</Text>
            </Card>
            <Card variation="outlined" padding="1rem" flex="1">
              <Heading level={5} color="green">{statusCounts.approved}</Heading>
              <Text>Approved</Text>
            </Card>
          </Flex>
        </Card>
        
        <Card variation="elevated" flex="1">
          <Heading level={4}>Quick Links</Heading>
          <Flex direction="column" gap="0.5rem" marginTop="1rem">
            <Button variation="primary" onClick={() => setActiveTabIndex(0)}>
              Browse Research Opportunities
            </Button>
            <Button onClick={() => setActiveTabIndex(1)}>
              View My Applications
            </Button>
            <Button onClick={() => setActiveTabIndex(2)}>
              Application Status Guide
            </Button>
          </Flex>
        </Card>
      </Flex>
      
      <Tabs
        currentIndex={activeTabIndex}
        onChange={(index) => setActiveTabIndex(index)}
      >
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
                    <Text>{project.description.length > 150 ? project.description.substring(0, 150) + '...' : project.description}</Text>
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
                        Deadline: {project.applicationDeadline ? new Date(project.applicationDeadline).toLocaleDateString() : 'Not specified'}
                      </Text>
                      <Flex gap="0.5rem">
                        <Button size="small" onClick={() => handleViewDetails(project)}>
                          View Details
                        </Button>
                        <Button 
                          variation="primary" 
                          size="small" 
                          onClick={() => handleApply(project)}
                          isDisabled={(user.applicationCount || 0) >= 3}
                        >
                          {(user.applicationCount || 0) >= 3 ? 'Limit Reached' : 'Apply'}
                        </Button>
                      </Flex>
                    </Flex>
                  </Flex>
                </Card>
              )}
            </Collection>
          )}
        </TabItem>
        
        <TabItem title="My Applications">
          {applications.length === 0 ? (
            <Card>
              <Text>You haven't submitted any applications yet.</Text>
              <Button 
                variation="primary" 
                onClick={() => setActiveTabIndex(0)}
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
        
        <TabItem title="Status Guide">
          <ApplicationStatusGuide />
        </TabItem>
      </Tabs>
      
      {/* Project Details Overlay */}
      {selectedProject && !showApplicationForm && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1000 }}
          onClick={() => setSelectedProject(null)}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            height="100%"
            padding="2rem"
          >
            <Card
              maxWidth="600px"
              width="100%"
              maxHeight="80vh"
              style={{ overflow: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Heading level={3}>{selectedProject.title}</Heading>
              <Divider margin="1rem 0" />
              
              <Flex direction="column" gap="1rem">
                <Text><strong>Department:</strong> {selectedProject.department}</Text>
                <Text><strong>Description:</strong> {selectedProject.description}</Text>
                
                {selectedProject.skillsRequired && selectedProject.skillsRequired.length > 0 && (
                  <>
                    <Text><strong>Skills Required:</strong></Text>
                    <Flex wrap="wrap" gap="0.5rem">
                      {selectedProject.skillsRequired.map((skill, index) => (
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
                  </>
                )}
                
                {selectedProject.duration && (
                  <Text><strong>Duration:</strong> {selectedProject.duration}</Text>
                )}
                
                <Text><strong>Application Deadline:</strong> {selectedProject.applicationDeadline ? new Date(selectedProject.applicationDeadline).toLocaleDateString() : 'Not specified'}</Text>
                
                <Flex gap="1rem" marginTop="1rem">
                  <Button onClick={() => setSelectedProject(null)}>Close</Button>
                  <Button 
                    variation="primary" 
                    onClick={() => handleApply(selectedProject)}
                    isDisabled={(user.applicationCount || 0) >= 3}
                  >
                    {(user.applicationCount || 0) >= 3 ? 'Application Limit Reached' : 'Apply Now'}
                  </Button>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </View>
      )}
      
      {/* Enhanced Application Form Overlay */}
      {showApplicationForm && selectedProject && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1000 }}
          onClick={() => setShowApplicationForm(false)}
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
              <EnhancedApplicationForm 
                project={selectedProject}
                user={user}
                onClose={() => setShowApplicationForm(false)}
                onSuccess={() => {
                  setShowApplicationForm(false);
                  setSelectedProject(null);
                  fetchData();
                }}
              />
            </Card>
          </Flex>
        </View>
      )}
      
      {/* Legacy Application Form Overlay */}
      {false && showApplicationForm && selectedProject && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1000 }}
          onClick={() => setShowApplicationForm(false)}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            height="100%"
            padding="2rem"
          >
            <Card
              maxWidth="600px"
              width="100%"
              maxHeight="80vh"
              style={{ overflow: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Heading level={3}>Apply to {selectedProject.title}</Heading>
              <Divider margin="1rem 0" />
              
              <form onSubmit={handleSubmitApplication}>
                <Flex direction="column" gap="1rem">
                  <Text><strong>Your Information:</strong></Text>
                  <Text>Name: {user.name}</Text>
                  <Text>Email: {user.email}</Text>
                  {user.major && <Text>Major: {user.major}</Text>}
                  {user.academicYear && <Text>Academic Year: {user.academicYear}</Text>}
                  {user.gpa && <Text>GPA: {user.gpa}</Text>}
                  
                  <Divider />
                  
                  <TextField
                    name="hoursPerWeek"
                    label="How many hours per week can you dedicate to this project? *"
                    value={applicationForm.hoursPerWeek}
                    onChange={handleApplicationFormChange}
                    type="number"
                    min="1"
                    max="40"
                    required
                  />
                  
                  <TextAreaField
                    name="statement"
                    label="Why are you interested in this project? *"
                    value={applicationForm.statement}
                    onChange={handleApplicationFormChange}
                    rows={5}
                    required
                    placeholder="Please explain your interest in this research project and how it aligns with your academic and career goals..."
                  />
                  
                  <Flex gap="1rem" marginTop="1rem">
                    <Button onClick={() => setShowApplicationForm(false)}>Cancel</Button>
                    <Button type="submit" variation="primary" isLoading={isSubmitting}>
                      Submit Application
                    </Button>
                  </Flex>
                </Flex>
              </form>
            </Card>
          </Flex>
        </View>
      )}
    </Flex>
  );
};

export default StudentDashboard;
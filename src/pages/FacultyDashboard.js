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
  TextField,
  TextAreaField,
  SelectField,
  Badge
} from '@aws-amplify/ui-react';
import { listProjects, listApplications, createProject, updateProject, getUser } from '../graphql/operations';
import ApplicationReview from '../components/ApplicationReview';

const FacultyDashboard = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    department: user.department || '',
    skillsRequired: '',
    duration: '',
    applicationDeadline: '',
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    fetchData();
  }, [user]);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Get current authenticated user to ensure we have the correct ID
      const currentUser = await Auth.currentAuthenticatedUser();
      const userId = currentUser.username;
      console.log('Fetching projects for faculty ID:', userId);
      
      // Fetch faculty's projects
      const projectFilter = {
        facultyID: { eq: userId }
      };
      
      const projectResult = await API.graphql(graphqlOperation(listProjects, { 
        filter: projectFilter,
        limit: 100
      }));
      
      setProjects(projectResult.data.listProjects.items);
      
      // Fetch applications for faculty's projects
      if (projectResult.data.listProjects.items.length > 0) {
        const projectIds = projectResult.data.listProjects.items.map(p => p.id);
        
        const applicationFilter = {
          or: projectIds.map(id => ({ projectID: { eq: id } }))
        };
        
        const applicationResult = await API.graphql(graphqlOperation(listApplications, { 
          filter: applicationFilter,
          limit: 100
        }));
        
        // Enrich applications with project and student data
        const enrichedApplications = await Promise.all(
          applicationResult.data.listApplications.items.map(async (app) => {
            const project = projectResult.data.listProjects.items.find(p => p.id === app.projectID);
            
            // Fetch student data
            let student = null;
            try {
              const studentResult = await API.graphql(graphqlOperation(getUser, { id: app.studentID }));
              student = studentResult.data.getUser;
            } catch (err) {
              console.error('Error fetching student:', err);
            }
            
            return {
              ...app,
              project,
              student
            };
          })
        );
        
        setApplications(enrichedApplications);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.errors && err.errors.length > 0) {
        console.error('GraphQL errors:', err.errors);
        setError(`Failed to load dashboard data: ${err.errors[0].message}`);
      } else {
        setError('Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleApplicationUpdate = () => {
    fetchData();
  };
  
  const handleProjectFormChange = (e) => {
    const { name, value } = e.target;
    setProjectForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSkillsChange = (e) => {
    setProjectForm(prev => ({ 
      ...prev, 
      skillsRequired: e.target.value 
    }));
  };
  
  const handleSubmitProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Get current authenticated user to ensure we have the correct ID
      const currentUser = await Auth.currentAuthenticatedUser();
      const userId = currentUser.username;
      console.log('Current authenticated user ID:', userId);
      
      // Convert skills string to array
      const skillsArray = projectForm.skillsRequired
        ? projectForm.skillsRequired
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill)
        : [];
      
      // Format the date properly for GraphQL
      // Use UTC date to avoid timezone issues
      const deadline = projectForm.applicationDeadline 
        ? new Date(projectForm.applicationDeadline + 'T00:00:00Z').toISOString() 
        : null;
      
      console.log('Original date input:', projectForm.applicationDeadline);
      console.log('Formatted deadline for API:', deadline);
      
      // Prepare input with proper types
      const input = {
        title: projectForm.title,
        description: projectForm.description,
        department: projectForm.department,
        skillsRequired: skillsArray,
        duration: projectForm.duration || null,
        applicationDeadline: deadline,
        facultyID: userId,
        isActive: projectForm.isActive === true || projectForm.isActive === 'true'
      };
      
      console.log('Project input:', input);
      
      let result;
      if (selectedProject) {
        // Update existing project
        input.id = selectedProject.id;
        console.log('Updating project with ID:', selectedProject.id);
        console.log('Update input:', JSON.stringify(input, null, 2));
        
        result = await API.graphql(graphqlOperation(updateProject, { input }));
        console.log('Project updated:', result);
        setSuccessMessage('Project updated successfully!');
      } else {
        // Create new project
        console.log('Creating new project with input:', JSON.stringify(input, null, 2));
        result = await API.graphql(graphqlOperation(createProject, { input }));
        console.log('Project created:', result);
        setSuccessMessage('Project created successfully!');
      }
      
      setIsCreatingProject(false);
      setSelectedProject(null);
      setProjectForm({
        title: '',
        description: '',
        department: user.department || '',
        skillsRequired: '',
        duration: '',
        applicationDeadline: '',
        isActive: true
      });
      
      fetchData();
    } catch (err) {
      console.error('Error saving project:', err);
      if (err.errors && err.errors.length > 0) {
        console.error('GraphQL error details:', err.errors);
        setError(`Failed to save project: ${err.errors[0].message}`);
      } else {
        setError('Failed to save project. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const editProject = (project) => {
    setSelectedProject(project);
    setProjectForm({
      title: project.title,
      description: project.description,
      department: project.department || '',
      skillsRequired: project.skillsRequired?.join(', ') || '',
      duration: project.duration || '',
      applicationDeadline: project.applicationDeadline ? new Date(project.applicationDeadline).toISOString().split('T')[0] : '',
      isActive: project.isActive
    });
    setIsCreatingProject(true);
    setActiveTabIndex(0);
  };
  
  // Count applications by status
  const getApplicationCounts = () => {
    const counts = {
      pending: 0,
      approved: 0,
      returned: 0,
      total: applications.length
    };
    
    applications.forEach(app => {
      if (['Faculty Review', 'Department Review', 'Admin Review'].includes(app.status)) {
        counts.pending++;
      } else if (app.status === 'Approved') {
        counts.approved++;
      } else if (['Returned', 'Rejected'].includes(app.status)) {
        counts.returned++;
      }
    });
    
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
      <Heading level={2}>Faculty Dashboard</Heading>
      <Text>Welcome, {user.name}!</Text>
      
      {error && <Text color="red">{error}</Text>}
      {successMessage && <Text color="green">{successMessage}</Text>}
      
      <Flex direction={{ base: 'column', large: 'row' }} gap="1rem">
        <Card variation="elevated" flex="1">
          <Heading level={4}>My Projects</Heading>
          <Flex wrap="wrap" gap="1rem" marginTop="1rem">
            <Card variation="outlined" padding="1rem" flex="1">
              <Heading level={5}>{projects.length}</Heading>
              <Text>Total Projects</Text>
            </Card>
            <Card variation="outlined" padding="1rem" flex="1">
              <Heading level={5}>{projects.filter(p => p.isActive).length}</Heading>
              <Text>Active Projects</Text>
            </Card>
          </Flex>
        </Card>
        
        <Card variation="elevated" flex="1">
          <Heading level={4}>Applications</Heading>
          <Flex wrap="wrap" gap="1rem" marginTop="1rem">
            <Card variation="outlined" padding="1rem" flex="1">
              <Heading level={5} color="orange">{applicationCounts.pending}</Heading>
              <Text>Pending Review</Text>
            </Card>
            <Card variation="outlined" padding="1rem" flex="1">
              <Heading level={5} color="green">{applicationCounts.approved}</Heading>
              <Text>Approved</Text>
            </Card>
          </Flex>
        </Card>
        
        <Card variation="elevated" flex="1">
          <Heading level={4}>Quick Actions</Heading>
          <Flex direction="column" gap="0.5rem" marginTop="1rem">
            <Button 
              variation="primary" 
              onClick={() => {
                setIsCreatingProject(true);
                setSelectedProject(null);
                setProjectForm({
                  title: '',
                  description: '',
                  department: user.department || '',
                  skillsRequired: '',
                  duration: '',
                  applicationDeadline: '',
                  isActive: true
                });
              }}
            >
              Create New Project
            </Button>
            <Button onClick={() => setActiveTabIndex(1)}>
              Review Applications
            </Button>
          </Flex>
        </Card>
      </Flex>
      
      <Tabs
        currentIndex={activeTabIndex}
        onChange={(index) => setActiveTabIndex(index)}
      >
        <TabItem title="My Projects">
          {isCreatingProject ? (
            <Card>
              <Heading level={4}>{selectedProject ? 'Edit Project' : 'Create New Project'}</Heading>
              <Divider margin="1rem 0" />
              
              <form onSubmit={handleSubmitProject}>
                <Flex direction="column" gap="1rem">
                  <TextField
                    name="title"
                    label="Project Title *"
                    value={projectForm.title}
                    onChange={handleProjectFormChange}
                    required
                  />
                  
                  <TextAreaField
                    name="description"
                    label="Project Description *"
                    value={projectForm.description}
                    onChange={handleProjectFormChange}
                    required
                    rows={5}
                  />
                  
                  <TextField
                    name="department"
                    label="Department *"
                    value={projectForm.department}
                    onChange={handleProjectFormChange}
                    required
                  />
                  
                  <TextField
                    name="skillsRequired"
                    label="Skills Required (comma-separated)"
                    value={projectForm.skillsRequired}
                    onChange={handleSkillsChange}
                    placeholder="e.g. Python, Data Analysis, Machine Learning"
                  />
                  
                  <TextField
                    name="duration"
                    label="Project Duration"
                    value={projectForm.duration}
                    onChange={handleProjectFormChange}
                    placeholder="e.g. 3 months, Fall Semester"
                  />
                  
                  <TextField
                    name="applicationDeadline"
                    label="Application Deadline *"
                    type="date"
                    value={projectForm.applicationDeadline}
                    onChange={handleProjectFormChange}
                    required
                  />
                  
                  <SelectField
                    name="isActive"
                    label="Status"
                    value={projectForm.isActive.toString()}
                    onChange={(e) => setProjectForm(prev => ({ 
                      ...prev, 
                      isActive: e.target.value === 'true' 
                    }))}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </SelectField>
                  
                  <Flex gap="1rem">
                    <Button 
                      onClick={() => setIsCreatingProject(false)}
                      variation="link"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      variation="primary"
                      isLoading={isSubmitting}
                    >
                      {selectedProject ? 'Update Project' : 'Create Project'}
                    </Button>
                  </Flex>
                </Flex>
              </form>
            </Card>
          ) : (
            <>
              {projects.length === 0 ? (
                <Card>
                  <Text>You haven't created any projects yet.</Text>
                  <Button 
                    variation="primary" 
                    onClick={() => setIsCreatingProject(true)}
                    marginTop="1rem"
                  >
                    Create Your First Project
                  </Button>
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
                          <Badge 
                            backgroundColor={project.isActive ? 'green' : 'gray'}
                            color="white"
                          >
                            {project.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </Flex>
                        
                        <Text fontWeight="bold">Department: {project.department}</Text>
                        <Text>{project.description}</Text>
                        
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
                            Deadline: {project.applicationDeadline ? new Date(project.applicationDeadline).toLocaleDateString('en-US', { timeZone: 'UTC' }) : 'Not specified'}
                          </Text>
                          <Flex gap="0.5rem">
                            <Button 
                              size="small"
                              onClick={() => editProject(project)}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="small"
                              variation="primary"
                              onClick={() => {
                                setActiveTabIndex(1);
                              }}
                            >
                              View Applications
                            </Button>
                          </Flex>
                        </Flex>
                      </Flex>
                    </Card>
                  )}
                </Collection>
              )}
            </>
          )}
        </TabItem>
        
        <TabItem title="Applications">
          {applications.length === 0 ? (
            <Card>
              <Text>No applications have been submitted for your projects yet.</Text>
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
                <ApplicationReview 
                  key={application.id}
                  application={application}
                  userRole="Faculty"
                  onUpdate={handleApplicationUpdate}
                />
              )}
            </Collection>
          )}
        </TabItem>
      </Tabs>
    </Flex>
  );
};

export default FacultyDashboard;
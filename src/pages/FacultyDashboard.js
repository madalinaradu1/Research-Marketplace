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
  Badge,
  View,
  Image,
  useTheme
} from '@aws-amplify/ui-react';
import { listProjects, listApplications, createProject, updateProject, getUser, listUsers } from '../graphql/operations';
import { createMessage, createNotification } from '../graphql/message-operations';
import { sendEmailNotification, sendNewItemNotification } from '../utils/emailNotifications';
import ApplicationReview from '../components/ApplicationReview';
import ApplicationStatusGuide from '../components/ApplicationStatusGuide';

const FacultyDashboard = ({ user }) => {
  const { tokens } = useTheme();
  const [projects, setProjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewingApplicationsForProject, setViewingApplicationsForProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    department: user.department || '',
    skillsRequired: '',
    qualifications: '',
    duration: '',
    applicationDeadline: '',
    requiresTranscript: false,
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnseenApplications, setHasUnseenApplications] = useState(false);
  const [messagingStudent, setMessagingStudent] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [reviewingApplication, setReviewingApplication] = useState(null);
  const [viewingReturnReason, setViewingReturnReason] = useState(null);
  
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
      
      const allProjects = projectResult.data.listProjects.items;
      setProjects(allProjects);
      
      // Fetch applications for faculty's projects
      if (projectResult.data.listProjects.items.length > 0) {
        const projectIds = projectResult.data.listProjects.items.map(p => p.id);
        
        // Fetch all applications and filter client-side to avoid DynamoDB issues
        const applicationResult = await API.graphql(graphqlOperation(listApplications, { 
          limit: 100
        }));
        
        // Filter applications for faculty's projects client-side
        const facultyApplications = applicationResult.data.listApplications.items.filter(
          app => projectIds.includes(app.projectID)
        );
        
        // Fetch all users to match with applications
        let allUsers = [];
        try {
          const usersResult = await API.graphql(graphqlOperation(listUsers, { limit: 100 }));
          allUsers = usersResult.data.listUsers.items || [];
          console.log('All users fetched:', allUsers);
        } catch (err) {
          console.error('Error fetching users:', err);
        }
        
        // Enrich applications with project and student data, filter out applications with missing students
        const enrichedApplications = facultyApplications
          .map(app => {
            const project = projectResult.data.listProjects.items.find(p => p.id === app.projectID);
            const student = allUsers.find(u => u.id === app.studentID);
            
            return {
              ...app,
              project,
              student
            };
          })
          .filter(app => app.student); // Filter out applications where student no longer exists
        
        console.log('Enriched applications:', enrichedApplications);
        
        setApplications(enrichedApplications);
        
        // Check for unseen applications
        const storedLastViewed = localStorage.getItem(`lastViewedFacultyApplications_${userId}`);
        const lastViewed = storedLastViewed ? new Date(storedLastViewed) : new Date(0);
        
        const hasNewApplications = enrichedApplications.some(app => {
          const createdAt = new Date(app.createdAt);
          const updatedAt = new Date(app.updatedAt);
          // Show notification for new applications or applications that were updated (re-submitted)
          return createdAt > lastViewed || (updatedAt > lastViewed && updatedAt > createdAt);
        });
        
        setHasUnseenApplications(hasNewApplications);
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
  
  const handleApplicationUpdate = async () => {
    await fetchData();
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
      
      // Prepare input with proper types and new workflow status
      const input = {
        title: projectForm.title,
        description: projectForm.description,
        department: projectForm.department,
        skillsRequired: skillsArray,
        qualifications: projectForm.qualifications || null,
        duration: projectForm.duration || null,
        applicationDeadline: deadline,
        requiresTranscript: projectForm.requiresTranscript,
        facultyID: userId,
        isActive: projectForm.isActive === true || projectForm.isActive === 'true',
        projectStatus: selectedProject && selectedProject.projectStatus === 'Returned' ? 'Coordinator Review' : (selectedProject ? selectedProject.projectStatus : 'Coordinator Review')
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
        
        // Send notification if project was resubmitted from Returned status
        if (selectedProject.projectStatus === 'Returned') {
          try {
            await sendNewItemNotification(
              'coordinator@gcu.edu', // Replace with actual coordinator email
              'Coordinator',
              'Project Resubmission',
              input.title,
              user.name,
              user.email
            );
          } catch (emailError) {
            console.log('Email notification prepared (SES integration pending):', emailError);
          }
          setSuccessMessage('Project resubmitted for coordinator review!');
        } else {
          setSuccessMessage('Project updated successfully!');
        }
      } else {
        // Create new project
        console.log('Creating new project with input:', JSON.stringify(input, null, 2));
        result = await API.graphql(graphqlOperation(createProject, { input }));
        console.log('Project created:', result);
        
        // Send notification to coordinator about new project
        try {
          await sendNewItemNotification(
            'coordinator@gcu.edu', // Replace with actual coordinator email
            'Coordinator',
            'Project',
            input.title,
            user.name,
            user.email
          );
        } catch (emailError) {
          console.log('Email notification prepared (SES integration pending):', emailError);
        }
        
        setSuccessMessage('Project submitted for coordinator review!');
      }
      
      setIsCreatingProject(false);
      setSelectedProject(null);
      setViewingReturnReason(null);
      setProjectForm({
        title: '',
        description: '',
        department: user.department || '',
        skillsRequired: '',
        qualifications: '',
        duration: '',
        applicationDeadline: '',
        requiresTranscript: false,
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
      title: project.title || '',
      description: project.description || '',
      department: project.department || '',
      skillsRequired: project.skillsRequired?.join(', ') || '',
      qualifications: project.qualifications || '',
      duration: project.duration || '',
      applicationDeadline: project.applicationDeadline ? new Date(project.applicationDeadline).toISOString().split('T')[0] : '',
      requiresTranscript: project.requiresTranscript || false,
      isActive: project.isActive !== undefined ? project.isActive : true
    });
    setIsCreatingProject(true);
    setActiveTabIndex(0);
  };
  
  // Count applications by status
  const getApplicationCounts = () => {
    const counts = {
      reviewNeeded: 0,
      approved: 0,
      returned: 0,
      total: applications.length
    };
    
    applications.forEach(app => {
      if (user.role === 'Faculty' && app.status === 'Faculty Review') {
        counts.reviewNeeded++;
      } else if (user.role === 'Coordinator' && app.status === 'Department Review') {
        counts.reviewNeeded++;
      } else if (user.role === 'Admin' && app.status === 'Admin Review') {
        counts.reviewNeeded++;
      } else if (app.status === 'Approved') {
        counts.approved++;
      } else if (['Returned', 'Rejected'].includes(app.status)) {
        counts.returned++;
      }
    });
    
    return counts;
  };
  
  // Filter applications that need review by current user role
  const getReviewNeededApplications = () => {
    return applications.filter(app => {
      if (user.role === 'Faculty') {
        return app.status === 'Faculty Review';
      } else if (user.role === 'Coordinator') {
        return app.status === 'Department Review';
      } else if (user.role === 'Admin') {
        return app.status === 'Admin Review';
      }
      return false;
    });
  };
  
  // Get projects that need faculty attention (returned projects)
  const getProjectsNeedingAttention = () => {
    return projects.filter(project => project.projectStatus === 'Returned');
  };
  
  // Filter applications that have been processed (approved, rejected, returned)
  const getProcessedApplications = () => {
    return applications.filter(app => 
      ['Approved', 'Rejected', 'Returned'].includes(app.status)
    );
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
    <View width="100%">
      <View
        position="relative"
        width="100vw"
        height="450px"
        style={{ left: '50%', marginLeft: '-50vw', marginTop: '-2rem' }}
      >
        <Image
          alt="Faculty Meeting Banner"
          src="/Faculty_Meeting.png"
          width="100%"
          height="100%"
          objectFit="cover"
          objectPosition="center 35%"
        />
      </View>
      <Flex direction="column" padding="2rem" gap="2rem">
      <Heading level={2}>Faculty Dashboard</Heading>
      
      {error && <Text color="red">{error}</Text>}
      {successMessage && <Text color="green">{successMessage}</Text>}
      
      <Flex justifyContent="space-between" alignItems="center" marginBottom="2rem">
        <Button 
          backgroundColor="white"
          color="black"
          border="1px solid black"
          size="small"
          onClick={() => {
            setIsCreatingProject(true);
            setSelectedProject(null);
            setProjectForm({
              title: '',
              description: '',
              department: user.department || '',
              skillsRequired: '',
              qualifications: '',
              duration: '',
              applicationDeadline: '',
              requiresTranscript: false,
              isActive: true
            });
          }}
        >
          + Create Project
        </Button>
      </Flex>
      
      <Tabs
        currentIndex={activeTabIndex}
        onChange={(index) => {
          setActiveTabIndex(index);
          if (index === 1 || index === 2) { // All Applications or Pending Review tab
            setHasUnseenApplications(false);
            const userId = user.id || user.username;
            localStorage.setItem(`lastViewedFacultyApplications_${userId}`, new Date().toISOString());
          }
        }}
      >
        <TabItem title="My Projects">
          <Flex direction="column" gap="2rem">
            {/* Projects Section */}
            <Card>
              <Heading level={4} marginBottom="1rem">My Projects ({projects.length})</Heading>
              
              {projects.length === 0 ? (
                <Text>No projects created yet.</Text>
              ) : (
                <Collection items={projects} type="list" gap="1rem">
                  {(project) => (
                    <Card key={project.id} variation="outlined">
                      <Flex direction="column" gap="0.5rem">
                        <Flex justifyContent="space-between" alignItems="center">
                          <Text fontWeight="bold">{project.title}</Text>
                          <Badge 
                            backgroundColor={
                              project.projectStatus === 'Approved' ? tokens.colors.green[60] :
                              project.projectStatus === 'Returned' ? tokens.colors.yellow[60] :
                              project.projectStatus === 'Coordinator Review' ? tokens.colors.orange[60] : tokens.colors.neutral[60]
                            }
                            color="white"
                          >
                            {project.projectStatus || 'Draft'}
                          </Badge>
                        </Flex>
                        <Flex justifyContent="space-between" alignItems="center">
                          <Text fontSize="0.9rem">{project.department} • Deadline: {project.applicationDeadline ? new Date(project.applicationDeadline).toLocaleDateString() : 'Not set'}</Text>
                          <Flex gap="0.5rem">
                            {project.projectStatus === 'Returned' ? (
                              <Button size="small" onClick={() => {
                                editProject(project);
                                setViewingReturnReason(project);
                              }}>Fix & Resubmit</Button>
                            ) : (
                              <Button size="small" onClick={() => editProject(project)}>Edit</Button>
                            )}
                            <Button size="small" onClick={() => {
                              setViewingApplicationsForProject(project);
                              setActiveTabIndex(1);
                            }}>Applications</Button>
                          </Flex>
                        </Flex>
                      </Flex>
                    </Card>
                  )}
                </Collection>
              )}
            </Card>
          </Flex>
        </TabItem>
        

        
        <TabItem title="All Applications">
          {getProcessedApplications().length === 0 ? (
            <Card>
              <Text>No processed applications yet.</Text>
            </Card>
          ) : (
            <Flex direction="column" gap="2rem">
              {projects.map(project => {
                const projectApplications = getProcessedApplications().filter(app => app.projectID === project.id);
                if (projectApplications.length === 0) return null;
                
                return (
                  <Card key={project.id}>
                    <Heading level={4}>{project.title}</Heading>
                    <Text>Department: {project.department}</Text>
                    <Divider margin="1rem 0" />
                    <Collection
                      items={projectApplications.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))}
                      type="list"
                      gap="1rem"
                      wrap="nowrap"
                      direction="column"
                    >
                      {(application) => (
                        <Card key={application.id}>
                          <Flex justifyContent="space-between" alignItems="center">
                            <Flex direction="row" gap="2rem" alignItems="center" flex="1">
                              <Text fontWeight="bold" width="180px">{application.student?.name || 'Unknown Student'}</Text>
                              <Text fontSize="0.9rem" width="220px">{application.student?.email}</Text>
                              <Text fontSize="0.9rem" width="120px">{new Date(application.createdAt).toLocaleDateString()}</Text>
                              <Badge 
                                backgroundColor={
                                  application.status === 'Approved' ? tokens.colors.green[60] :
                                  application.status === 'Returned' ? tokens.colors.yellow[60] :
                                  application.status === 'Rejected' ? tokens.colors.red[60] :
                                  application.status === 'Faculty Review' ? tokens.colors.blue[60] :
                                  application.status === 'Coordinator Review' ? tokens.colors.orange[60] : tokens.colors.neutral[60]
                                }
                                color="white"
                              >
                                {application.status}
                              </Badge>
                            </Flex>
                            
                            <Flex gap="1rem" alignItems="center">
                              <Button 
                                size="small"
                                onClick={() => setReviewingApplication(application)}
                              >
                                View Details
                              </Button>
                              
                              {application.status === 'Approved' && (
                                <Button 
                                  size="small"
                                  onClick={() => setMessagingStudent({ application, student: application.student })}
                                >
                                  Message
                                </Button>
                              )}
                            </Flex>
                          </Flex>
                        </Card>
                      )}
                    </Collection>
                  </Card>
                );
              })}
            </Flex>
          )}
        </TabItem>
        
        <TabItem title="Pending Review">
          {getReviewNeededApplications().length === 0 && getProjectsNeedingAttention().length === 0 ? (
            <Card>
              <Text>No items need your review at this time.</Text>
            </Card>
          ) : (
            <Flex direction="column" gap="2rem">
              {/* Returned Projects Section */}
              {getProjectsNeedingAttention().length > 0 && (
                <Card>
                  <Heading level={4} marginBottom="1rem">Projects ({getProjectsNeedingAttention().length})</Heading>
                  <Collection items={getProjectsNeedingAttention()} type="list" gap="1rem">
                    {(project) => (
                      <Card key={project.id} variation="outlined">
                        <Flex justifyContent="space-between" alignItems="center">
                          <Flex direction="column" gap="0.5rem" flex="1">
                            <Text fontWeight="bold">{project.title}</Text>
                            <Text fontSize="0.9rem">{project.department}</Text>
                          </Flex>
                          <Flex gap="0.5rem">
                            <Button size="small" onClick={() => {
                              editProject(project);
                              setViewingReturnReason(project);
                            }}>Edit & Resubmit</Button>
                          </Flex>
                        </Flex>
                      </Card>
                    )}
                  </Collection>
                </Card>
              )}
              {projects.map(project => {
                const projectApplications = getReviewNeededApplications().filter(app => app.projectID === project.id);
                if (projectApplications.length === 0) return null;
                
                return (
                  <Card key={project.id}>
                    <Heading level={4}>{project.title}</Heading>
                    <Text>Department: {project.department}</Text>
                    <Divider margin="1rem 0" />
                    <Collection
                      items={projectApplications.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))}
                      type="list"
                      gap="1rem"
                      wrap="nowrap"
                      direction="column"
                    >
                      {(application) => (
                        <Card key={application.id}>
                          <Flex justifyContent="space-between" alignItems="center">
                            <Flex direction="row" gap="2rem" alignItems="center" flex="1">
                              <Text fontWeight="bold" width="180px">{application.student?.name || 'Unknown Student'}</Text>
                              <Text fontSize="0.9rem" width="220px">{application.student?.email}</Text>
                              <Text fontSize="0.9rem" width="120px">{new Date(application.createdAt).toLocaleDateString()}</Text>
                              <Badge 
                                backgroundColor={
                                  application.status === 'Faculty Review' ? tokens.colors.blue[60] :
                                  application.status === 'Coordinator Review' ? tokens.colors.orange[60] : tokens.colors.orange[60]
                                }
                                color="white"
                              >
                                {application.status}
                              </Badge>
                            </Flex>
                            
                            <Button 
                              size="small"
                              backgroundColor="white"
                              color="black"
                              border="1px solid black"
                              onClick={() => setReviewingApplication(application)}
                            >
                              Review Now
                            </Button>
                          </Flex>
                        </Card>
                      )}
                    </Collection>
                  </Card>
                );
              })}
            </Flex>
          )}
        </TabItem>
        
        <TabItem title="Status Guide">
          <ApplicationStatusGuide />
        </TabItem>
      </Tabs>
      
      {/* View Application Details Modal */}
      {reviewingApplication && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1000 }}
          onClick={() => setReviewingApplication(null)}
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
                application={reviewingApplication}
                userRole="Faculty"
                onUpdate={() => {
                  handleApplicationUpdate();
                  setReviewingApplication(null);
                }}
              />
              <Button 
                onClick={() => setReviewingApplication(null)}
                marginTop="1rem"
              >
                Close
              </Button>
            </Card>
          </Flex>
        </View>
      )}
      
      {/* Message Student Modal */}
      {messagingStudent && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1000 }}
          onClick={() => setMessagingStudent(null)}
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
              <Heading level={4}>Message Student</Heading>
              <Divider margin="1rem 0" />
              
              <Flex direction="column" gap="1rem">
                <Text><strong>To:</strong> {messagingStudent.student?.name} ({messagingStudent.student?.email})</Text>
                <Text><strong>Project:</strong> {messagingStudent.application?.project?.title}</Text>
                
                <TextAreaField
                  label="Message"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  rows={6}
                  required
                />
                
                <Flex gap="1rem">
                  <Button 
                    onClick={() => {
                      setMessagingStudent(null);
                      setMessageText('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    backgroundColor="#552b9a"
                    color="white"
                    isLoading={isSendingMessage}
                    onClick={async () => {
                      if (!messageText.trim()) return;
                      
                      setIsSendingMessage(true);
                      try {
                        const currentUser = await Auth.currentAuthenticatedUser();
                        const userId = currentUser.username;
                        
                        const messageInput = {
                          senderID: userId,
                          receiverID: messagingStudent.student.id,
                          subject: `Message about ${messagingStudent.application.project?.title}`,
                          body: messageText,
                          isRead: false
                        };
                        
                        await API.graphql(graphqlOperation(createMessage, { input: messageInput }));
                        
                        await sendEmailNotification(
                          messagingStudent.student.email,
                          messagingStudent.student.name,
                          user.name,
                          `Message about ${messagingStudent.application.project?.title}`,
                          messageText,
                          messagingStudent.application.project?.title
                        );
                        
                        setMessagingStudent(null);
                        setMessageText('');
                        setSuccessMessage('Message sent successfully!');
                      } catch (err) {
                        console.error('Error sending message:', err);
                        setError('Failed to send message. Please try again.');
                      } finally {
                        setIsSendingMessage(false);
                      }
                    }}
                  >
                    Send Message
                  </Button>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </View>
      )}
      
      {/* Create/Edit Project Modal */}
      {isCreatingProject && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1000 }}
          onClick={() => setIsCreatingProject(false)}
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
              <Heading level={4} marginBottom="1rem">{selectedProject ? 'Edit Project' : 'Create New Project'}</Heading>
              <form onSubmit={handleSubmitProject}>
                <Flex direction="column" gap="1.5rem">
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
                    rows={6}
                  />
                  <Flex direction={{ base: 'column', large: 'row' }} gap="1rem">
                    <TextField
                      name="department"
                      label="Department *"
                      value={projectForm.department}
                      onChange={handleProjectFormChange}
                      required
                      flex="1"
                    />
                    <TextField
                      name="applicationDeadline"
                      label="Application Deadline *"
                      type="date"
                      value={projectForm.applicationDeadline}
                      onChange={handleProjectFormChange}
                      required
                      flex="1"
                    />
                  </Flex>
                  <TextField
                    name="skillsRequired"
                    label="Skills Required (comma-separated)"
                    value={projectForm.skillsRequired}
                    onChange={handleSkillsChange}
                    placeholder="e.g. Python, Data Analysis, Machine Learning"
                  />
                  <TextAreaField
                    name="qualifications"
                    label="Required Qualifications/Prerequisites"
                    value={projectForm.qualifications}
                    onChange={handleProjectFormChange}
                    placeholder="e.g. Completion of PSYC 101, minimum GPA of 3.0, upper-division standing"
                    rows={4}
                  />
                  <TextField
                    name="duration"
                    label="Project Duration"
                    value={projectForm.duration}
                    onChange={handleProjectFormChange}
                    placeholder="e.g. 3 months, Fall Semester"
                  />
                  <SelectField
                    name="requiresTranscript"
                    label="Requires Transcript Upload"
                    value={(projectForm.requiresTranscript || false).toString()}
                    onChange={(e) => setProjectForm(prev => ({ 
                      ...prev, 
                      requiresTranscript: e.target.value === 'true' 
                    }))}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </SelectField>
                  <Flex gap="0.5rem">
                    <Button 
                      onClick={() => setIsCreatingProject(false)} 
                      backgroundColor="white"
                      color="black"
                      border="1px solid black"
                      size="small"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      backgroundColor="white"
                      color="black"
                      border="1px solid black"
                      size="small" 
                      isLoading={isSubmitting}
                    >
                      {selectedProject ? 'Update Project' : 'Create Project'}
                    </Button>
                  </Flex>
                </Flex>
              </form>
            </Card>
          </Flex>
        </View>
      )}
      
      {/* View Return Reason and Edit Modal */}
      {viewingReturnReason && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1000 }}
          onClick={() => setViewingReturnReason(null)}
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
              <Heading level={4}>Project Returned - Edit & Resubmit</Heading>
              
              {viewingReturnReason.coordinatorNotes && (
                <Card backgroundColor="#fff3cd" padding="1rem" marginTop="1rem">
                  <Text fontWeight="bold" color="#856404">Coordinator Notes:</Text>
                  <Text color="#856404" marginTop="0.5rem">{viewingReturnReason.coordinatorNotes}</Text>
                  <Text fontSize="0.9rem" color="#856404" marginTop="0.5rem" fontStyle="italic">
                    Please address these concerns and resubmit your project.
                  </Text>
                </Card>
              )}
              
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
                  
                  <TextAreaField
                    name="qualifications"
                    label="Required Qualifications/Prerequisites"
                    value={projectForm.qualifications}
                    onChange={handleProjectFormChange}
                    placeholder="e.g. Completion of PSYC 101, minimum GPA of 3.0, upper-division standing"
                    rows={3}
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
                    name="requiresTranscript"
                    label="Requires Transcript Upload"
                    value={(projectForm.requiresTranscript || false).toString()}
                    onChange={(e) => setProjectForm(prev => ({ 
                      ...prev, 
                      requiresTranscript: e.target.value === 'true' 
                    }))}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </SelectField>
                  
                  <SelectField
                    name="isActive"
                    label="Status"
                    value={(projectForm.isActive !== undefined ? projectForm.isActive : true).toString()}
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
                      onClick={() => setViewingReturnReason(null)}
                      backgroundColor="white"
                      color="black"
                      border="1px solid black"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      backgroundColor="white"
                      color="black"
                      border="1px solid black"
                      isLoading={isSubmitting}
                    >
                      Resubmit Project
                    </Button>
                  </Flex>
                </Flex>
              </form>
            </Card>
          </Flex>
        </View>
      )}
      </Flex>
    </View>
  );
};

export default FacultyDashboard;
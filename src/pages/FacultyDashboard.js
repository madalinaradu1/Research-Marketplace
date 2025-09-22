import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API, graphqlOperation, Auth } from 'aws-amplify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
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
  CheckboxField,
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
import { getStatusColorValue } from '../utils/statusColors';

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
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [viewingApplicationsForProject, setViewingApplicationsForProject] = useState(null);
  // Load cached project data on component mount
  const loadCachedProjectData = () => {
    try {
      const cacheKey = `project_draft_${user.id || user.username}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const data = JSON.parse(cached);
        return {
          title: data.title || '',
          description: data.description || '',
          department: data.department || user.department || '',
          skillsRequired: data.skillsRequired || '',
          tags: data.tags || '',
          qualifications: data.qualifications || '',
          duration: data.duration || '',
          applicationDeadline: data.applicationDeadline || '',
          requiresTranscript: data.requiresTranscript || false,
          isActive: data.isActive !== undefined ? data.isActive : true
        };
      }
    } catch (e) {
      console.error('Error loading cached project data:', e);
    }
    return {
      title: '',
      description: '',
      department: user.department || '',
      skillsRequired: '',
      tags: '',
      qualifications: '',
      duration: '',
      applicationDeadline: '',
      requiresTranscript: false,
      isActive: true
    };
  };
  
  const [projectForm, setProjectForm] = useState(loadCachedProjectData());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnseenApplications, setHasUnseenApplications] = useState(false);
  const [messagingStudent, setMessagingStudent] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [reviewingApplication, setReviewingApplication] = useState(null);
  const [viewingReturnReason, setViewingReturnReason] = useState(null);
  const [projectsPage, setProjectsPage] = useState(1);
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const itemsPerPage = 10;
  const [openKebabMenu, setOpenKebabMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [applicationSearchTerm, setApplicationSearchTerm] = useState('');
  const [viewingProject, setViewingProject] = useState(null);
  const [sortOptions, setSortOptions] = useState({
    newest: true,
    oldest: false,
    title: false,
    department: false,
    deadline: false
  });
  

  

  
  // Refs for ReactQuill components to suppress findDOMNode warnings
  const messageQuillRef = useRef(null);
  const createProjectQuillRef = useRef(null);
  const editProjectQuillRef = useRef(null);
  const resubmitQuillRef = useRef(null);
  
  // Clean HTML content - minimal cleaning to preserve user formatting
  const cleanHtmlContent = (html) => {
    if (!html || html === '<p><br></p>') return '';
    return html.trim();
  };
  
  // Strip HTML tags for plain text editing
  const stripHtmlTags = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  };
  

  
  useEffect(() => {
    fetchData();
  }, [user]);
  
  // Close kebab menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenKebabMenu(null);
    };
    
    if (openKebabMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openKebabMenu]);
  

  
  // Cleanup expired projects
  const cleanupExpiredProjects = async (projects) => {
    const now = new Date();
    const projectsToDelete = projects.filter(project => {
      if (project.applicationDeadline) {
        const deadline = new Date(project.applicationDeadline);
        const daysSinceExpired = (now - deadline) / (1000 * 60 * 60 * 24);
        return daysSinceExpired > 14;
      }
      return false;
    });
    
    for (const project of projectsToDelete) {
      try {
        await API.graphql(graphqlOperation(updateProject, { 
          input: { id: project.id, isActive: false }
        }));
        console.log(`Deactivated expired project: ${project.title}`);
      } catch (err) {
        console.error(`Error deactivating project ${project.id}:`, err);
      }
    }
  };
  
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
      
      // Cleanup expired projects (deactivate them)
      await cleanupExpiredProjects(allProjects);
      
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
  
  // Save project form data to localStorage
  const saveProjectToDraft = (formData) => {
    try {
      const cacheKey = selectedProject ? `project_edit_${selectedProject.id}` : `project_draft_${user.id || user.username}`;
      const draftData = {
        ...formData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(cacheKey, JSON.stringify(draftData));
    } catch (e) {
      console.error('Error saving project draft:', e);
    }
  };
  
  // Clear project draft after successful submission
  const clearProjectDraft = () => {
    try {
      const cacheKey = selectedProject ? `project_edit_${selectedProject.id}` : `project_draft_${user.id || user.username}`;
      localStorage.removeItem(cacheKey);
    } catch (e) {
      console.error('Error clearing project draft:', e);
    }
  };
  
  const handleProjectFormChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...projectForm, [name]: value };
    setProjectForm(newForm);
    saveProjectToDraft(newForm);
  };
  
  const handleSkillsChange = (e) => {
    const newForm = { 
      ...projectForm, 
      skillsRequired: e.target.value 
    };
    setProjectForm(newForm);
    saveProjectToDraft(newForm);
  };
  
  const handleSubmitProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    // Validate required fields
    const requiredFields = {
      'Project Title': projectForm.title,
      'Project Description': projectForm.description,
      'College': projectForm.department,
      'Application Deadline': projectForm.applicationDeadline
    };
    
    const missingFields = Object.entries(requiredFields)
      .filter(([field, value]) => !value || value.trim() === '')
      .map(([field]) => field);
    
    if (missingFields.length > 0) {
      setError(`Please fill out all required fields: ${missingFields.join(', ')}`);
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Get current authenticated user to ensure we have the correct ID
      const currentUser = await Auth.currentAuthenticatedUser();
      const userId = currentUser.username;
      console.log('Current authenticated user ID:', userId);
      
      // Convert skills and tags strings to arrays
      const skillsArray = projectForm.skillsRequired
        ? projectForm.skillsRequired
            .split(',')
            .map(skill => skill.trim())
            .filter(skill => skill)
        : [];
      
      const tagsArray = projectForm.tags
        ? projectForm.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag)
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
        description: cleanHtmlContent(projectForm.description),
        department: projectForm.department,
        skillsRequired: skillsArray,
        tags: tagsArray,
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
      
      // Clear draft after successful submission
      clearProjectDraft();
      
      fetchData();
    } catch (err) {
      console.error('Error saving project:', err);
      console.error('Full error object:', JSON.stringify(err, null, 2));
      
      if (err.errors && err.errors.length > 0) {
        console.error('GraphQL error details:', err.errors);
        console.error('First error object:', err.errors[0]);
        const errorMessage = err.errors[0].message || err.errors[0].errorType || 'GraphQL error';
        console.error('Specific error message:', errorMessage);
        setError(`Failed to save project: ${errorMessage}`);
      } else {
        const errorMessage = err.message || 'Unknown error';
        console.error('Non-GraphQL error:', errorMessage);
        setError(`Failed to save project: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const editProject = (project) => {
    // Load cached edit data if available
    const loadCachedEditData = () => {
      try {
        const cacheKey = `project_edit_${project.id}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const data = JSON.parse(cached);
          return {
            title: data.title || project.title || '',
            description: data.description || project.description || '',
            department: data.department || project.department || '',
            skillsRequired: data.skillsRequired || (project.skillsRequired?.join(', ')) || '',
            tags: data.tags || (project.tags?.join(', ')) || '',
            qualifications: data.qualifications || project.qualifications || '',
            duration: data.duration || project.duration || '',
            applicationDeadline: data.applicationDeadline || (project.applicationDeadline ? new Date(project.applicationDeadline).toISOString().split('T')[0] : ''),
            requiresTranscript: data.requiresTranscript !== undefined ? data.requiresTranscript : (project.requiresTranscript || false),
            isActive: data.isActive !== undefined ? data.isActive : (project.isActive !== undefined ? project.isActive : true)
          };
        }
      } catch (e) {
        console.error('Error loading cached edit data:', e);
      }
      return {
        title: project.title || '',
        description: project.description || '',
        department: project.department || '',
        skillsRequired: project.skillsRequired?.join(', ') || '',
        tags: project.tags?.join(', ') || '',
        qualifications: project.qualifications || '',
        duration: project.duration || '',
        applicationDeadline: project.applicationDeadline ? new Date(project.applicationDeadline).toISOString().split('T')[0] : '',
        requiresTranscript: project.requiresTranscript || false,
        isActive: project.isActive !== undefined ? project.isActive : true
      };
    };
    
    setSelectedProject(project);
    setIsEditingProject(true);
    setProjectForm(loadCachedEditData());
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
        return app.status === 'Coordinator Review';
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
  
  // Get rejected projects
  const getRejectedProjects = () => {
    return projects.filter(project => project.projectStatus === 'Rejected');
  };
  
  // Get rejected applications
  const getRejectedApplications = () => {
    return applications.filter(app => app.status === 'Rejected');
  };
  
  // Filter applications that have been processed (approved, rejected, returned)
  const getProcessedApplications = () => {
    return applications.filter(app => 
      ['Approved', 'Rejected', 'Returned'].includes(app.status)
    );
  };
  
  // Get applications that are approved and ready for faculty selection
  const getApprovedApplications = () => {
    return applications.filter(app => app.status === 'Approved');
  };
  
  const applicationCounts = getApplicationCounts();
  
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
  
  if (loading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }
  
  return (
    <View width="100%" backgroundColor="#f5f5f5">
      <View
        position="relative"
        width="100vw"
        height="450px"
        style={{ left: '50%', marginLeft: '-50vw', marginTop: '-2rem' }}
      >
        <Image
          alt="Faculty Banner"
          src="/Faculty.jpg"
          width="100%"
          height="100%"
          objectFit="cover"
          objectPosition="center"
        />
      </View>
      <Flex direction="column" padding="2rem" gap="2rem">
      <Flex direction="column" gap="0.5rem">
        <Heading level={2}>Faculty Dashboard</Heading>
        <Text fontSize="1.1rem" color="#666">
          Welcome back, {user?.name || 'Faculty'}! You are logged in as a {user?.role || 'Faculty'} member.
        </Text>
      </Flex>
      
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
            setIsEditingProject(false);
            
            // Load cached draft data if available
            const loadCachedDraftData = () => {
              try {
                const cacheKey = `project_draft_${user.id || user.username}`;
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                  const data = JSON.parse(cached);
                  return {
                    title: data.title || '',
                    description: data.description || '',
                    department: data.department || user.department || '',
                    skillsRequired: data.skillsRequired || '',
                    tags: data.tags || '',
                    qualifications: data.qualifications || '',
                    duration: data.duration || '',
                    applicationDeadline: data.applicationDeadline || '',
                    requiresTranscript: data.requiresTranscript || false,
                    isActive: data.isActive !== undefined ? data.isActive : true
                  };
                }
              } catch (e) {
                console.error('Error loading cached draft data:', e);
              }
              return {
                title: '',
                description: '',
                department: user.department || '',
                skillsRequired: '',
                tags: '',
                qualifications: '',
                duration: '',
                applicationDeadline: '',
                requiresTranscript: false,
                isActive: true
              };
            };
            
            const newForm = loadCachedDraftData();
            setProjectForm(newForm);
            saveProjectToDraft(newForm);
          }}
        >
          + Create Project
        </Button>
      </Flex>
      
      <Tabs
        currentIndex={activeTabIndex}
        onChange={(index) => {
          setActiveTabIndex(index);
          // Reset pagination when switching tabs
          setProjectsPage(1);
          setApplicationsPage(1);
          setPendingPage(1);
          if (index === 1 || index === 2) { // All Applications or Pending Review tab
            setHasUnseenApplications(false);
            const userId = user.id || user.username;
            localStorage.setItem(`lastViewedFacultyApplications_${userId}`, new Date().toISOString());
          }
        }}
      >
        <TabItem title="Posted Opportunities">
          <Flex direction="column" gap="2rem">
            {/* Projects Section */}
              {projects.length === 0 ? (
                <Card backgroundColor="white" padding="1rem">
                  <Text>No projects created yet.</Text>
                </Card>
              ) : (
                <>
                <Flex direction="column">
                  <Card backgroundColor="white" padding="1rem">
                    <Flex direction="column" gap="1rem">
                      <Flex alignItems="center" gap="0.5rem">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <TextField
                          placeholder="Search by project title or department..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          width="400px"
                          size="small"
                        />
                      </Flex>
                      
                      <Flex alignItems="center" gap="2rem" wrap="wrap">
                        <Text fontSize="0.9rem" fontWeight="bold" color="#666">Sort by:</Text>
                        <Flex alignItems="center" gap="1.5rem" wrap="wrap">
                          <Flex alignItems="center" gap="0.4rem">
                            <input
                              type="checkbox"
                              checked={sortOptions.newest}
                              onChange={(e) => setSortOptions(prev => ({ ...prev, newest: e.target.checked }))}
                              onClick={(e) => setSortOptions(prev => ({ ...prev, newest: !prev.newest }))}
                            />
                            <Text fontSize="0.9rem">Newest First</Text>
                          </Flex>
                          <Flex alignItems="center" gap="0.4rem">
                            <input
                              type="checkbox"
                              checked={sortOptions.oldest}
                              onChange={(e) => setSortOptions(prev => ({ ...prev, oldest: e.target.checked }))}
                              onClick={(e) => setSortOptions(prev => ({ ...prev, oldest: !prev.oldest }))}
                            />
                            <Text fontSize="0.9rem">Oldest First</Text>
                          </Flex>
                          <Flex alignItems="center" gap="0.4rem">
                            <input
                              type="checkbox"
                              checked={sortOptions.title}
                              onChange={(e) => setSortOptions(prev => ({ ...prev, title: e.target.checked }))}
                              onClick={(e) => setSortOptions(prev => ({ ...prev, title: !prev.title }))}
                            />
                            <Text fontSize="0.9rem">Alphabetical</Text>
                          </Flex>
                          <Flex alignItems="center" gap="0.4rem">
                            <input
                              type="checkbox"
                              checked={sortOptions.department}
                              onChange={(e) => setSortOptions(prev => ({ ...prev, department: e.target.checked }))}
                              onClick={(e) => setSortOptions(prev => ({ ...prev, department: !prev.department }))}
                            />
                            <Text fontSize="0.9rem">By Department</Text>
                          </Flex>
                          <Flex alignItems="center" gap="0.4rem">
                            <input
                              type="checkbox"
                              checked={sortOptions.deadline}
                              onChange={(e) => setSortOptions(prev => ({ ...prev, deadline: e.target.checked }))}
                              onClick={(e) => setSortOptions(prev => ({ ...prev, deadline: !prev.deadline }))}
                            />
                            <Text fontSize="0.9rem">By Deadline</Text>
                          </Flex>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Card>
                  <Flex direction="column" gap="0.5rem">
                    {getPaginatedItems(projects.filter(project => {
                    // Filter out deactivated projects
                    if (project.isActive === false) {
                      return false;
                    }
                    
                    // Filter out projects expired for more than 14 days
                    if (project.applicationDeadline) {
                      const deadline = new Date(project.applicationDeadline);
                      const now = new Date();
                      const daysSinceExpired = (now - deadline) / (1000 * 60 * 60 * 24);
                      if (daysSinceExpired > 14) {
                        return false; // Hide projects expired for more than 14 days
                      }
                    }
                    
                    const title = (project.title || '').toLowerCase();
                    const department = (project.department || '').toLowerCase();
                    const search = searchTerm.toLowerCase();
                    return title.includes(search) || department.includes(search);
                  }).sort((a, b) => {
                    // Apply multiple sorts in order of priority
                    if (sortOptions.newest) {
                      const dateCompare = new Date(b.createdAt) - new Date(a.createdAt);
                      if (dateCompare !== 0) return dateCompare;
                    }
                    if (sortOptions.oldest) {
                      const dateCompare = new Date(a.createdAt) - new Date(b.createdAt);
                      if (dateCompare !== 0) return dateCompare;
                    }
                    if (sortOptions.title) {
                      const titleCompare = (a.title || '').localeCompare(b.title || '');
                      if (titleCompare !== 0) return titleCompare;
                    }
                    if (sortOptions.department) {
                      const deptCompare = (a.department || '').localeCompare(b.department || '');
                      if (deptCompare !== 0) return deptCompare;
                    }
                    if (sortOptions.deadline) {
                      const aDeadline = a.applicationDeadline ? new Date(a.applicationDeadline) : new Date('9999-12-31');
                      const bDeadline = b.applicationDeadline ? new Date(b.applicationDeadline) : new Date('9999-12-31');
                      const deadlineCompare = aDeadline - bDeadline;
                      if (deadlineCompare !== 0) return deadlineCompare;
                    }
                    return 0;
                  }), projectsPage).map((project) => (
                    <Card key={project.id} backgroundColor="white" padding="1rem" style={{ cursor: 'pointer' }} onClick={() => {
                      setSelectedProject(project);
                      setIsEditingProject(false);
                    }}>
                      <Flex direction="column" gap="0.5rem">
                        <Flex justifyContent="space-between" alignItems="flex-start">
                          <Text fontWeight="bold">{project.title}</Text>
                          <Flex direction="column" alignItems="flex-end" gap="0.5rem" minWidth="150px">
                            <Badge 
                              backgroundColor={
                                project.applicationDeadline && new Date(project.applicationDeadline) < new Date() ? 'gray' :
                                getStatusColorValue(project.projectStatus, tokens)
                              }
                              color="white"
                            >
                              {project.applicationDeadline && new Date(project.applicationDeadline) < new Date() ? 'Expired' : (project.projectStatus || 'Draft')}
                            </Badge>
                            {/* Only show meatball menu for non-expired projects */}
                            {(!project.applicationDeadline || new Date(project.applicationDeadline) >= new Date()) && (
                              <View position="relative">
                              <Button 
                                size="medium"
                                backgroundColor="transparent"
                                color="black"
                                border="none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenKebabMenu(openKebabMenu === project.id ? null : project.id);
                                }}
                                style={{ padding: '0.75rem' }}
                              >
                                ⋯
                              </Button>
                              {openKebabMenu === project.id && (
                                <Card
                                  position="absolute"
                                  top="100%"
                                  right="0"
                                  style={{ zIndex: 100, minWidth: '200px' }}
                                  backgroundColor="white"
                                  border="1px solid black"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Flex direction="column" gap="0">
                                    <Button
                                      size="small"
                                      backgroundColor="white"
                                      color="black"
                                      border="none"
                                      style={{ textAlign: 'left', justifyContent: 'flex-start', borderRadius: '0' }}
                                      onClick={() => {
                                        editProject(project);
                                        setOpenKebabMenu(null);
                                      }}
                                      isDisabled={project.applicationDeadline && new Date(project.applicationDeadline) < new Date()}
                                    >
                                      {project.applicationDeadline && new Date(project.applicationDeadline) < new Date() ? 'Expired' : 'Edit'}
                                    </Button>
                                    {project.projectStatus === 'Returned' && (
                                      <Button
                                        size="small"
                                        backgroundColor="white"
                                        color="black"
                                        border="none"
                                        style={{ textAlign: 'left', justifyContent: 'flex-start', borderRadius: '0' }}
                                        onClick={() => {
                                          editProject(project);
                                          setViewingReturnReason(project);
                                          setOpenKebabMenu(null);
                                        }}
                                      >
                                        Edit and Resubmit
                                      </Button>
                                    )}
                                    {!(project.applicationDeadline && new Date(project.applicationDeadline) < new Date()) && (
                                      <Button
                                        size="small"
                                        backgroundColor="white"
                                        color="black"
                                        border="none"
                                        style={{ textAlign: 'left', justifyContent: 'flex-start', borderRadius: '0' }}
                                        onClick={() => {
                                          setViewingApplicationsForProject(project);
                                          setActiveTabIndex(1);
                                          setOpenKebabMenu(null);
                                        }}
                                      >
                                        Applications ({applications.filter(app => app.projectID === project.id).length})
                                      </Button>
                                    )}
                                  </Flex>
                                </Card>
                              )}
                              </View>
                            )}
                          </Flex>
                        </Flex>
                        <Flex justifyContent="space-between" alignItems="center">
                          <Text fontSize="0.9rem">{project.department} • Deadline: {project.applicationDeadline ? new Date(project.applicationDeadline).toLocaleDateString() : 'Not set'}</Text>
                        </Flex>
                      </Flex>
                    </Card>
                    ))}
                  </Flex>
                </Flex>
                {renderPagination(projects, projectsPage, setProjectsPage)}
                </>
              )}
          </Flex>
        </TabItem>
        

        
        <TabItem title="Applications">
          {viewingApplicationsForProject ? (
            // Show applications for specific project
            <Card>
              <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem">
                <Heading level={4}>{viewingApplicationsForProject.title}</Heading>
                <Flex alignItems="center" gap="0.5rem">
                  <TextField
                    placeholder="Search applications..."
                    value={applicationSearchTerm}
                    onChange={(e) => setApplicationSearchTerm(e.target.value)}
                    width="250px"
                    size="small"
                  />
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </Flex>
              </Flex>
              {applications.filter(app => app.projectID === viewingApplicationsForProject.id).length === 0 ? (
                <Text>No applications submitted for this project yet.</Text>
              ) : (
                <>
                  <Divider margin="1rem 0" />
                  <Collection
                    items={getPaginatedItems(applications.filter(app => {
                      if (app.projectID !== viewingApplicationsForProject.id) return false;
                      const studentName = (app.student?.name || '').toLowerCase();
                      const studentEmail = (app.student?.email || '').toLowerCase();
                      const status = (app.status || '').toLowerCase();
                      const search = applicationSearchTerm.toLowerCase();
                      return studentName.includes(search) || studentEmail.includes(search) || status.includes(search);
                    }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)), applicationsPage)}
                    type="list"
                    gap="1rem"
                    wrap="nowrap"
                    direction="column"
                  >
                    {(application) => (
                      <Card key={application.id} backgroundColor="white" padding="1rem" style={{ cursor: 'pointer' }} onClick={() => {
                        setReviewingApplication(application);
                      }}>
                        <Flex direction="column" gap="0.5rem">
                          <Flex justifyContent="space-between" alignItems="flex-start">
                            <Text fontWeight="bold">{application.student?.name || 'Unknown Student'}</Text>
                            <Flex direction="column" alignItems="flex-end" gap="0.5rem" minWidth="150px">
                              <Badge 
                                backgroundColor={getStatusColorValue(application.status, tokens)}
                                color="white"
                              >
                                {application.status}
                              </Badge>
                              <View position="relative">
                                <Button 
                                  size="medium"
                                  backgroundColor="transparent"
                                  color="black"
                                  border="none"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenKebabMenu(openKebabMenu === application.id ? null : application.id);
                                  }}
                                  style={{ padding: '0.75rem' }}
                                >
                                  ⋯
                                </Button>
                                {openKebabMenu === application.id && (
                                  <Card
                                    position="absolute"
                                    top="100%"
                                    right="0"
                                    style={{ zIndex: 100, minWidth: '200px' }}
                                    backgroundColor="white"
                                    border="1px solid black"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Flex direction="column" gap="0">
                                      <Button
                                        size="small"
                                        backgroundColor="white"
                                        color="black"
                                        border="none"
                                        style={{ textAlign: 'left', justifyContent: 'flex-start', borderRadius: '0' }}
                                        onClick={() => {
                                          setReviewingApplication(application);
                                          setOpenKebabMenu(null);
                                        }}
                                      >
                                        View Details
                                      </Button>
                                      {application.status === 'Approved' && (
                                        <Button
                                          size="small"
                                          backgroundColor="white"
                                          color="black"
                                          border="none"
                                          style={{ textAlign: 'left', justifyContent: 'flex-start', borderRadius: '0' }}
                                          onClick={() => {
                                            setMessagingStudent({ application, student: application.student });
                                            setOpenKebabMenu(null);
                                          }}
                                        >
                                          Message
                                        </Button>
                                      )}
                                    </Flex>
                                  </Card>
                                )}
                              </View>
                            </Flex>
                          </Flex>
                          <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="0.9rem">{application.student?.email} • Applied: {new Date(application.createdAt).toLocaleDateString()}</Text>
                          </Flex>
                        </Flex>
                      </Card>
                    )}
                  </Collection>
                  {renderPagination(applications.filter(app => app.projectID === viewingApplicationsForProject.id), applicationsPage, setApplicationsPage)}
                </>
              )}
            </Card>
          ) : (
            // Show all applications grouped by project
            applications.length === 0 ? (
              <Card>
                <Text>No applications yet.</Text>
              </Card>
            ) : (
              <Flex direction="column" gap="2rem">
                {projects.map(project => {
                  const projectApplications = applications.filter(app => app.projectID === project.id);
                  if (projectApplications.length === 0) return null;
                  
                  return (
                    <Card key={project.id}>
                      <Heading level={4}>{project.title}</Heading>
                      <Text>College: {project.department}</Text>
                      <Divider margin="1rem 0" />
                      <Collection
                        items={getPaginatedItems(projectApplications.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)), applicationsPage)}
                        type="list"
                        gap="1rem"
                        wrap="nowrap"
                        direction="column"
                      >
                      {(application) => (
                        <Card key={application.id} backgroundColor="white" padding="1rem" style={{ cursor: 'pointer' }} onClick={() => {
                          setReviewingApplication(application);
                        }}>
                          <Flex justifyContent="space-between" alignItems="center">
                            <Flex direction="row" gap="2rem" alignItems="center" flex="1">
                              <Text fontWeight="bold" width="180px">{application.student?.name || 'Unknown Student'}</Text>
                              <Text fontSize="0.9rem" width="220px">{application.student?.email}</Text>
                              <Text fontSize="0.9rem" width="120px">{new Date(application.createdAt).toLocaleDateString()}</Text>
                              <Badge 
                                backgroundColor={getStatusColorValue(application.status, tokens)}
                                color="white"
                              >
                                {application.status}
                              </Badge>
                            </Flex>
                            
                            <View position="relative">
                              <Button 
                                size="medium"
                                backgroundColor="transparent"
                                color="black"
                                border="none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenKebabMenu(openKebabMenu === application.id ? null : application.id);
                                }}
                                style={{ padding: '0.75rem' }}
                              >
                                ⋯
                              </Button>
                              {openKebabMenu === application.id && (
                                <Card
                                  position="absolute"
                                  top="100%"
                                  right="0"
                                  style={{ zIndex: 100, minWidth: '200px' }}
                                  backgroundColor="white"
                                  border="1px solid black"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Flex direction="column" gap="0">
                                    <Button
                                      size="small"
                                      backgroundColor="white"
                                      color="black"
                                      border="none"
                                      style={{ textAlign: 'left', justifyContent: 'flex-start', borderRadius: '0' }}
                                      onClick={() => {
                                        setReviewingApplication(application);
                                        setOpenKebabMenu(null);
                                      }}
                                    >
                                      View Details
                                    </Button>
                                    {application.status === 'Approved' && (
                                      <Button
                                        size="small"
                                        backgroundColor="white"
                                        color="black"
                                        border="none"
                                        style={{ textAlign: 'left', justifyContent: 'flex-start', borderRadius: '0' }}
                                        onClick={() => {
                                          setMessagingStudent({ application, student: application.student });
                                          setOpenKebabMenu(null);
                                        }}
                                      >
                                        Message
                                      </Button>
                                    )}
                                  </Flex>
                                </Card>
                              )}
                            </View>
                          </Flex>
                        </Card>
                      )}
                    </Collection>
                    {renderPagination(projectApplications, applicationsPage, setApplicationsPage)}
                  </Card>
                  );
                })}
              </Flex>
            )
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
                  <Collection items={getPaginatedItems(getProjectsNeedingAttention(), pendingPage)} type="list" gap="1rem">
                    {(project) => (
                      <Card key={project.id} backgroundColor="white" padding="1rem" style={{ cursor: 'pointer' }} onClick={() => {
                        setViewingProject(project);
                      }}>
                        <Flex justifyContent="space-between" alignItems="center">
                          <Flex direction="column" gap="0.5rem" flex="1">
                            <Text fontWeight="bold">{project.title}</Text>
                            <Text fontSize="0.9rem">{project.department}</Text>
                          </Flex>
                          <Flex gap="0.5rem">
                            <Button size="small" onClick={() => {
                              editProject(project);
                              setViewingReturnReason(project);
                            }}>Edit and Resubmit</Button>
                          </Flex>
                        </Flex>
                      </Card>
                    )}
                  </Collection>
                  {renderPagination(getProjectsNeedingAttention(), pendingPage, setPendingPage)}
                </Card>
              )}
              {projects.map(project => {
                const projectApplications = getReviewNeededApplications().filter(app => app.projectID === project.id);
                if (projectApplications.length === 0) return null;
                
                return (
                  <Card key={project.id}>
                    <Heading level={4}>{project.title}</Heading>
                    <Divider margin="1rem 0" />
                    <Collection
                      items={getPaginatedItems(projectApplications.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)), pendingPage)}
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
                                backgroundColor={getStatusColorValue(application.status, tokens)}
                                color="white"
                              >
                                {application.status}
                              </Badge>
                            </Flex>
                            
                            <View position="relative">
                              <Button 
                                size="medium"
                                backgroundColor="transparent"
                                color="black"
                                border="none"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenKebabMenu(openKebabMenu === application.id ? null : application.id);
                                }}
                                style={{ padding: '0.75rem' }}
                              >
                                ⋯
                              </Button>
                              {openKebabMenu === application.id && (
                                <Card
                                  position="absolute"
                                  top="100%"
                                  right="0"
                                  style={{ zIndex: 100, minWidth: '200px' }}
                                  backgroundColor="white"
                                  border="1px solid black"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Flex direction="column" gap="0">
                                    <Button
                                      size="small"
                                      backgroundColor="white"
                                      color="black"
                                      border="none"
                                      style={{ textAlign: 'left', justifyContent: 'flex-start', borderRadius: '0' }}
                                      onClick={() => {
                                        setReviewingApplication(application);
                                        setOpenKebabMenu(null);
                                      }}
                                    >
                                      Review Now
                                    </Button>
                                  </Flex>
                                </Card>
                              )}
                            </View>
                          </Flex>
                        </Card>
                      )}
                    </Collection>
                    {renderPagination(projectApplications, pendingPage, setPendingPage)}
                  </Card>
                );
              })}
            </Flex>
          )}
        </TabItem>
        
        <TabItem title="Rejected Items">
          <Flex direction="column" gap="2rem">
            {/* Rejected Projects */}
            {getRejectedProjects().length > 0 && (
              <>
                <Collection items={getPaginatedItems(getRejectedProjects().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)), projectsPage)} type="list" gap="1rem">
                    {(project) => (
                      <Card key={project.id} backgroundColor="white" padding="1rem" minHeight="120px" style={{ cursor: 'pointer' }} onClick={() => {
                        setSelectedProject(project);
                        setIsEditingProject(false);
                      }}>
                        <Flex direction="column" gap="0.5rem">
                          <Flex justifyContent="space-between" alignItems="center">
                            <Text fontWeight="bold">{project.title}</Text>
                            <Flex direction="column" alignItems="flex-end" gap="0.5rem" minWidth="150px">
                              <Badge backgroundColor={getStatusColorValue('Rejected', tokens)} color="white">
                                Rejected
                              </Badge>

                            </Flex>
                          </Flex>
                          <Flex justifyContent="space-between" alignItems="center">
                            <Text fontSize="0.9rem">{project.department} • Rejected: {new Date(project.updatedAt).toLocaleDateString()}</Text>
                          </Flex>
                        </Flex>
                      </Card>
                    )}
                  </Collection>
                  {renderPagination(getRejectedProjects(), projectsPage, setProjectsPage)}
                </>
            )}
            
            {/* Rejected Applications */}
            {getRejectedApplications().length > 0 && (
              <>
                <Collection items={getPaginatedItems(getRejectedApplications().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)), applicationsPage)} type="list" gap="1rem">
                  {(application) => (
                    <Card key={application.id} backgroundColor="white" padding="1rem" minHeight="120px" style={{ cursor: 'pointer' }} onClick={() => {
                      setReviewingApplication(application);
                    }}>
                      <Flex direction="column" gap="0.5rem">
                        <Flex justifyContent="space-between" alignItems="center">
                          <Text fontWeight="bold">{application.project?.title}</Text>
                          <Flex direction="column" alignItems="flex-end" gap="0.5rem" minWidth="150px">
                            <Badge backgroundColor={getStatusColorValue('Rejected', tokens)} color="white">
                              Rejected
                            </Badge>

                          </Flex>
                        </Flex>
                        <Flex justifyContent="space-between" alignItems="center">
                          <Text fontSize="0.9rem">{application.student?.name} • Rejected: {new Date(application.updatedAt).toLocaleDateString()}</Text>
                        </Flex>
                        {application.rejectionReason && (
                          <Text fontSize="0.8rem" color="red">
                            Reason: {application.rejectionReason}
                          </Text>
                        )}
                      </Flex>
                    </Card>
                  )}
                  </Collection>
                  {renderPagination(getRejectedApplications(), applicationsPage, setApplicationsPage)}
              </>
            )}
            
            {getRejectedProjects().length === 0 && getRejectedApplications().length === 0 && (
              <Card>
                <Text>No rejected items.</Text>
              </Card>
            )}
          </Flex>
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
              maxWidth="900px"
              width="100%"
              maxHeight="100vh"
              backgroundColor="white"
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
              maxWidth="900px"
              width="100%"
              maxHeight="100vh"
              style={{ overflow: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Heading level={4}>Message Student</Heading>
              <Divider margin="1rem 0" />
              
              <Flex direction="column" gap="1rem">
                <Text><strong>To:</strong> {messagingStudent.student?.name} ({messagingStudent.student?.email})</Text>
                <Text><strong>Project:</strong> {messagingStudent.application?.project?.title}</Text>
                
                <div>
                  <Text fontWeight="bold">Message</Text>
                  <div style={{ height: '400px' }}>
                    <ReactQuill
                      ref={messageQuillRef}
                      value={messageText}
                      onChange={(value) => {
                        if (value !== messageText) {
                          setMessageText(value);
                          // Auto-save message draft
                          try {
                            const draftKey = `faculty_message_draft_${user.id || user.username}_${messagingStudent?.student?.id}`;
                            localStorage.setItem(draftKey, value);
                          } catch (e) {
                            console.error('Error saving message draft:', e);
                          }
                        }
                      }}
                      placeholder="Type your message here..."
                      modules={{
                        toolbar: [
                          ['bold', 'italic', 'underline'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['clean']
                        ]
                      }}
                      style={{ height: '350px' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'none' }}
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
                    backgroundColor="white"
                    color="black"
                    border="1px solid black"
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
                          isRead: false,
                          sentAt: new Date().toISOString()
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
                    Send
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
              maxWidth="900px"
              width="100%"
              maxHeight="100vh"
              style={{ overflow: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Heading level={4} marginBottom="1rem">
                {viewingReturnReason ? 'Project Returned - Edit & Resubmit' : (selectedProject ? 'Edit Project' : 'Create New Project')}
              </Heading>
              
              {viewingReturnReason?.coordinatorNotes && (
                <Card backgroundColor="#fff3cd" padding="1rem" marginTop="1rem">
                  <Text fontWeight="bold" color="#856404">Coordinator Notes:</Text>
                  <Text color="#856404" marginTop="0.5rem">{viewingReturnReason.coordinatorNotes}</Text>
                  <Text fontSize="0.9rem" color="#856404" marginTop="0.5rem" fontStyle="italic">
                    Please address these concerns and resubmit your project.
                  </Text>
                </Card>
              )}
              <form onSubmit={handleSubmitProject}>
                <Flex direction="column" gap="1.5rem">
                  <TextField
                    name="title"
                    label="Project Title *"
                    value={projectForm.title}
                    onChange={handleProjectFormChange}
                    required
                  />
                  <div>
                    <Text fontWeight="bold">Project Description *</Text>
                    <div style={{ height: '300px' }}>
                      <ReactQuill
                        ref={createProjectQuillRef}
                        value={projectForm.description}
                        onChange={(value) => {
                          if (value !== projectForm.description) {
                            const newForm = { ...projectForm, description: value };
                            setProjectForm(newForm);
                            saveProjectToDraft(newForm);
                          }
                        }}
                        placeholder="Describe the research project, objectives, and what students will learn..."
                        modules={{
                          toolbar: [
                            ['bold', 'italic', 'underline'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            ['clean']
                          ]
                        }}
                        style={{ height: '250px' }}
                      />
                    </div>
                  </div>
                  <Flex direction={{ base: 'column', large: 'row' }} gap="1rem">
                    <TextField
                      name="department"
                      label="College *"
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
                  <TextField
                    name="tags"
                    label="Research Tags (comma-separated)"
                    value={projectForm.tags}
                    onChange={(e) => {
                      const newForm = { ...projectForm, tags: e.target.value };
                      setProjectForm(newForm);
                      saveProjectToDraft(newForm);
                    }}
                    placeholder="e.g. lab, field, geology, code, clinical"
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
                      onClick={() => {
                        setIsCreatingProject(false);
                        setSelectedProject(null);
                        setIsEditingProject(false);
                        setViewingReturnReason(null);
                      }} 
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
      

      
      {/* Project Details Modal */}
      {selectedProject && !isCreatingProject && !isEditingProject && !viewingReturnReason && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1000 }}
          onClick={() => {
            setSelectedProject(null);
            setViewingReturnReason(null);
          }}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            height="100%"
            padding="2rem"
          >
            <Card
              maxWidth="900px"
              width="100%"
              maxHeight="100vh"
              style={{ overflow: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Heading level={3}>{selectedProject.title}</Heading>
              
              {/* Rejection Reason Banner */}
              {selectedProject.rejectionReason && (
                <Card 
                  backgroundColor="#fff3cd" 
                  border="1px solid #ffeaa7"
                  padding="1rem"
                  marginTop="1rem"
                >
                  <Text fontWeight="bold" color="black">
                    Rejection Reason: {selectedProject.rejectionReason}
                  </Text>
                </Card>
              )}
              
              <Divider margin="1rem 0" />
              
              <Flex direction="column" gap="1rem">
                <Text><strong>College:</strong> {selectedProject.department}</Text>
                <div>
                  <Text fontWeight="bold">Description:</Text>
                  <div dangerouslySetInnerHTML={{ __html: selectedProject.description }} />
                </div>
                
                {selectedProject.qualifications && (
                  <Text><strong>Required Qualifications/Prerequisites:</strong> {selectedProject.qualifications}</Text>
                )}
                
                {selectedProject.skillsRequired && selectedProject.skillsRequired.length > 0 && (
                  <>
                    <Text><strong>Skills Required:</strong></Text>
                    <Flex wrap="wrap" gap="0.5rem">
                      {selectedProject.skillsRequired.map((skill, index) => (
                        <Badge key={index} backgroundColor="lightgray" color="white">
                          Skills: {skill}
                        </Badge>
                      ))}
                    </Flex>
                  </>
                )}
                
                {selectedProject.tags && selectedProject.tags.length > 0 && (
                  <>
                    <Text><strong>Research Tags:</strong></Text>
                    <Flex wrap="wrap" gap="0.5rem">
                      {selectedProject.tags.map((tag, index) => (
                        <Badge key={index} backgroundColor="lightgray" color="white">
                          {tag}
                        </Badge>
                      ))}
                    </Flex>
                  </>
                )}
                
                {selectedProject.duration && (
                  <Text><strong>Duration:</strong> {selectedProject.duration}</Text>
                )}
                
                <Text><strong>Application Deadline:</strong> {selectedProject.applicationDeadline ? new Date(selectedProject.applicationDeadline).toLocaleDateString() : 'Not specified'}</Text>
                
                <Text><strong>Requires Transcript Upload:</strong> {selectedProject.requiresTranscript ? 'Yes' : 'No'}</Text>
                
                <Text><strong>Status:</strong> {selectedProject.projectStatus || 'Draft'}</Text>
                
                <Flex gap="1rem" marginTop="1rem">
                  <Button 
                    onClick={() => {
                      setSelectedProject(null);
                      setViewingReturnReason(null);
                    }}
                    backgroundColor="white"
                    color="black"
                    border="1px solid black"
                  >
                    Close
                  </Button>
                  {selectedProject.applicationDeadline && new Date(selectedProject.applicationDeadline) < new Date() && (
                    <Button 
                      backgroundColor="white"
                      color="black"
                      border="1px solid black"
                      isDisabled={true}
                    >
                      Expired
                    </Button>
                  )}
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </View>
      )}
      </Flex>
    </View>
  );
};

export default FacultyDashboard;
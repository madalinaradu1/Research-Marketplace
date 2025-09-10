import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { 
  Flex, 
  Heading, 
  Text, 
  Button, 
  Card, 
  Tabs,
  TabItem,
  Collection,
  Badge,
  TextField,
  TextAreaField,
  SelectField,
  useTheme,
  View,
  Divider
} from '@aws-amplify/ui-react';
import { Storage } from 'aws-amplify';
import { listProjects, listApplications, listUsers, updateProject, updateApplication } from '../graphql/operations';
import { createMessage } from '../graphql/message-operations';
import { sendStatusChangeNotification, sendEmailNotification } from '../utils/emailNotifications';

const CoordinatorDashboard = ({ user }) => {
  const { tokens } = useTheme();
  const [projects, setProjects] = useState({ pending: [], approved: [], rejected: [] });
  const [applications, setApplications] = useState([]);
  const [approvedApplications, setApprovedApplications] = useState([]);
  const [rejectedApplications, setRejectedApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [applicationToReject, setApplicationToReject] = useState(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [applicationToApprove, setApplicationToApprove] = useState(null);
  const [showProjectRejectConfirm, setShowProjectRejectConfirm] = useState(false);
  const [projectToReject, setProjectToReject] = useState(null);
  const [showProjectApproveConfirm, setShowProjectApproveConfirm] = useState(false);
  const [projectToApprove, setProjectToApprove] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [viewingApplication, setViewingApplication] = useState(null);
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState('');
  const [documentUrl, setDocumentUrl] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(false);
  const [viewingProject, setViewingProject] = useState(null);
  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);
  const itemsPerPage = 10;
  const [openKebabMenu, setOpenKebabMenu] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    department: '',
    skillsRequired: '',
    tags: '',
    qualifications: '',
    duration: '',
    applicationDeadline: '',
    requiresTranscript: false,
    isActive: true
  });


  useEffect(() => {
    fetchData();
  }, []);
  
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

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all users to get faculty information
      const usersResult = await API.graphql(graphqlOperation(listUsers, { limit: 100 }));
      const allUsers = usersResult.data?.listUsers?.items || [];
      
      // Fetch projects needing coordinator review
      const projectsResult = await API.graphql(graphqlOperation(listProjects, { limit: 100 }));
      const allProjects = projectsResult.data?.listProjects?.items || [];
      const pendingProjects = allProjects
        .filter(p => p.projectStatus === 'Coordinator Review')
        .map(project => {
          const faculty = allUsers.find(user => user.id === project.facultyID);
          return {
            ...project,
            faculty: faculty || { name: 'Unknown Faculty' }
          };
        });
      
      // Fetch approved projects
      const approvedProjects = allProjects
        .filter(p => p.projectStatus === 'Approved')
        .map(project => {
          const faculty = allUsers.find(user => user.id === project.facultyID);
          return {
            ...project,
            faculty: faculty || { name: 'Unknown Faculty' }
          };
        });
      
      // Fetch rejected projects
      const rejectedProjects = allProjects
        .filter(p => p.projectStatus === 'Rejected')
        .map(project => {
          const faculty = allUsers.find(user => user.id === project.facultyID);
          return {
            ...project,
            faculty: faculty || { name: 'Unknown Faculty' }
          };
        });
      
      // Fetch applications needing coordinator review
      const applicationsResult = await API.graphql(graphqlOperation(listApplications, { limit: 100 }));
      const allApplications = applicationsResult.data?.listApplications?.items || [];
      const pendingApplications = allApplications
        .filter(a => a.status === 'Coordinator Review')
        .map(application => {
          const student = allUsers.find(user => user.id === application.studentID);
          const project = allProjects.find(p => p.id === application.projectID);
          return {
            ...application,
            student: student || { name: 'Unknown Student' },
            project: project || { title: 'Unknown Project' }
          };
        });
      
      // Fetch approved applications (Faculty Review or Approved status)
      const approvedApps = allApplications
        .filter(a => a.status === 'Faculty Review' || a.status === 'Approved')
        .map(application => {
          const student = allUsers.find(user => user.id === application.studentID);
          const project = allProjects.find(p => p.id === application.projectID);
          return {
            ...application,
            student: student || { name: 'Unknown Student' },
            project: project || { title: 'Unknown Project' }
          };
        });
      
      // Fetch rejected applications
      const rejectedApps = allApplications
        .filter(a => a.status === 'Rejected')
        .map(application => {
          const student = allUsers.find(user => user.id === application.studentID);
          const project = allProjects.find(p => p.id === application.projectID);
          return {
            ...application,
            student: student || { name: 'Unknown Student' },
            project: project || { title: 'Unknown Project' }
          };
        });
      
      setProjects({ pending: pendingProjects, approved: approvedProjects, rejected: rejectedProjects });
      setApplications(pendingApplications);
      setApprovedApplications(approvedApps);
      setRejectedApplications(rejectedApps);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectAction = async (project, actionType) => {
    try {
      let newStatus;
      switch (actionType) {
        case 'approve':
          newStatus = 'Approved';
          break;
        case 'return':
          newStatus = 'Returned';
          break;
        case 'reject':
          newStatus = 'Rejected';
          break;
        default:
          return;
      }

      const input = {
        id: project.id,
        projectStatus: newStatus,
        coordinatorNotes: notes,
        ...(actionType === 'approve' && { isActive: true })
      };

      await API.graphql(graphqlOperation(updateProject, { input }));
      
      // Send email notification for project status change
      try {
        await sendStatusChangeNotification(
          project.faculty?.email,
          project.faculty?.name,
          'Project',
          project.title,
          project.projectStatus,
          newStatus,
          'Coordinator',
          notes
        );
      } catch (emailError) {
        console.log('Email notification prepared (SES integration pending):', emailError);
      }
      
      setNotes('');
      setSelectedProject(null);
      fetchData();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleProjectFormChange = (e) => {
    const { name, value } = e.target;
    setProjectForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const skillsArray = projectForm.skillsRequired
        ? projectForm.skillsRequired.split(',').map(skill => skill.trim()).filter(skill => skill)
        : [];
      
      const tagsArray = projectForm.tags
        ? projectForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [];
      
      const deadline = projectForm.applicationDeadline 
        ? new Date(projectForm.applicationDeadline + 'T00:00:00Z').toISOString() 
        : null;
      
      const input = {
        id: editingProject.id,
        title: projectForm.title,
        description: projectForm.description,
        department: projectForm.department,
        skillsRequired: skillsArray,
        tags: tagsArray,
        qualifications: projectForm.qualifications || null,
        duration: projectForm.duration || null,
        applicationDeadline: deadline,
        requiresTranscript: projectForm.requiresTranscript,
        isActive: projectForm.isActive
      };
      
      await API.graphql(graphqlOperation(updateProject, { input }));
      setEditingProject(null);
      fetchData();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleApplicationAction = async (application, actionType) => {
    try {
      let newStatus;
      switch (actionType) {
        case 'approve':
          newStatus = 'Faculty Review';
          break;
        case 'return':
          newStatus = 'Returned';
          break;
        case 'reject':
          newStatus = 'Rejected';
          break;
        default:
          return;
      }

      const input = {
        id: application.id,
        status: newStatus,
        coordinatorNotes: notes
      };

      await API.graphql(graphqlOperation(updateApplication, { input }));
      
      // Send email notification for application status change to student
      try {
        await sendStatusChangeNotification(
          application.student?.email,
          application.student?.name,
          'Application',
          application.project?.title,
          application.status,
          newStatus,
          'Coordinator',
          notes
        );
      } catch (emailError) {
        console.log('Email notification prepared (SES integration pending):', emailError);
      }
      
      setNotes('');
      setSelectedApplication(null);
      fetchData();
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

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
  
  if (loading) return <Text>Loading...</Text>;

  return (
    <Flex direction="column" padding="2rem" gap="2rem">
      <Flex direction="column" gap="0.5rem">
        <Heading level={2}>Coordinator Dashboard</Heading>
        <Text fontSize="1.1rem" color="#666">
          Welcome back, {user?.name || 'Coordinator'}! You are logged in as a {user?.role || 'Coordinator'}.
        </Text>
      </Flex>
      

      <Tabs
        onChange={() => {
          setPendingPage(1);
          setApprovedPage(1);
          setRejectedPage(1);
        }}
      >
        <TabItem title="Pending Reviews">
          <Flex direction="column" gap="2rem">
            {/* Projects Needing Review */}
            {projects.pending && projects.pending.length > 0 && (
              <Card>
                <Heading level={4} marginBottom="1rem">Projects ({projects.pending.length})</Heading>
                <Collection items={getPaginatedItems(projects.pending, pendingPage)} type="list" gap="1rem">
                  {(project) => (
                    <Card key={project.id} variation="outlined">
                      <Flex justifyContent="space-between" alignItems="center">
                        <Flex direction="column" gap="0.5rem" flex="1">
                          <Text fontWeight="bold">{project.title}</Text>
                          <Text fontSize="0.9rem">{project.faculty?.name} • {project.department}</Text>
                        </Flex>
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
                                    setViewingProject(project);
                                    setOpenKebabMenu(null);
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  size="small"
                                  backgroundColor="white"
                                  color="black"
                                  border="none"
                                  style={{ textAlign: 'left', justifyContent: 'flex-start', borderRadius: '0' }}
                                  onClick={() => {
                                    setEditingProject(project);
                                    setProjectForm({
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
                                    });
                                    setOpenKebabMenu(null);
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="small"
                                  backgroundColor="white"
                                  color="black"
                                  border="none"
                                  style={{ textAlign: 'left', justifyContent: 'flex-start', borderRadius: '0' }}
                                  onClick={() => {
                                    setProjectToApprove(project);
                                    setShowProjectApproveConfirm(true);
                                    setOpenKebabMenu(null);
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="small"
                                  backgroundColor="white"
                                  color="black"
                                  border="none"
                                  style={{ textAlign: 'left', justifyContent: 'flex-start', borderRadius: '0' }}
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setOpenKebabMenu(null);
                                  }}
                                >
                                  Return
                                </Button>
                                <Button
                                  size="small"
                                  backgroundColor="white"
                                  color="black"
                                  border="none"
                                  style={{ textAlign: 'left', justifyContent: 'flex-start', borderRadius: '0' }}
                                  onClick={() => {
                                    setProjectToReject(project);
                                    setShowProjectRejectConfirm(true);
                                    setOpenKebabMenu(null);
                                  }}
                                >
                                  Reject
                                </Button>
                              </Flex>
                            </Card>
                          )}
                        </View>
                      </Flex>
                    </Card>
                  )}
                </Collection>
                {renderPagination(projects.pending, pendingPage, setPendingPage)}
              </Card>
            )}
            
            {/* Applications Needing Review */}
            {applications.length > 0 && (
              <Card>
                <Heading level={4} marginBottom="1rem">Applications ({applications.length})</Heading>
                <Collection items={getPaginatedItems(applications, pendingPage)} type="list" gap="1rem">
                  {(application) => (
                    <Card key={application.id} variation="outlined">
                      <Flex justifyContent="space-between" alignItems="center">
                        <Flex direction="column" gap="0.5rem" flex="1">
                          <Text fontWeight="bold">{application.project?.title}</Text>
                          <Text fontSize="0.9rem">{application.student?.name}</Text>
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
                                    setViewingApplication(application);
                                    setOpenKebabMenu(null);
                                  }}
                                >
                                  View
                                </Button>
                                <Button
                                  size="small"
                                  backgroundColor="white"
                                  color="black"
                                  border="none"
                                  style={{ textAlign: 'left', justifyContent: 'flex-start', borderRadius: '0' }}
                                  onClick={() => {
                                    setApplicationToApprove(application);
                                    setShowApproveConfirm(true);
                                    setOpenKebabMenu(null);
                                  }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="small"
                                  backgroundColor="white"
                                  color="black"
                                  border="none"
                                  style={{ textAlign: 'left', justifyContent: 'flex-start', borderRadius: '0' }}
                                  onClick={() => {
                                    setSelectedApplication(application);
                                    setOpenKebabMenu(null);
                                  }}
                                >
                                  Return
                                </Button>
                                <Button
                                  size="small"
                                  backgroundColor="white"
                                  color="black"
                                  border="none"
                                  style={{ textAlign: 'left', justifyContent: 'flex-start', borderRadius: '0' }}
                                  onClick={() => {
                                    setApplicationToReject(application);
                                    setShowRejectConfirm(true);
                                    setOpenKebabMenu(null);
                                  }}
                                >
                                  Reject
                                </Button>
                              </Flex>
                            </Card>
                          )}
                        </View>
                      </Flex>
                    </Card>
                  )}
                </Collection>
                {renderPagination(applications, pendingPage, setPendingPage)}
              </Card>
            )}
            
            {projects.pending?.length === 0 && applications.length === 0 && (
              <Card>
                <Text>No items need your review at this time.</Text>
              </Card>
            )}
          </Flex>
        </TabItem>
        
        <TabItem title="Approved Items">
          <Flex direction="column" gap="2rem">
            {/* Approved Applications */}
            {approvedApplications.length > 0 && (
              <Card>
                <Heading level={4} marginBottom="1rem">Applications ({approvedApplications.length})</Heading>
                <Collection items={getPaginatedItems(approvedApplications, approvedPage)} type="list" gap="1rem">
                  {(application) => (
                    <Card key={application.id} variation="outlined">
                      <Flex justifyContent="space-between" alignItems="center">
                        <Flex direction="column" gap="0.5rem" flex="1">
                          <Text fontWeight="bold">{application.project?.title}</Text>
                          <Text fontSize="0.9rem">{application.student?.name} • {application.status}</Text>
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
                                    setViewingApplication(application);
                                    setOpenKebabMenu(null);
                                  }}
                                >
                                  View Details
                                </Button>
                              </Flex>
                            </Card>
                          )}
                        </View>
                      </Flex>
                    </Card>
                  )}
                </Collection>
                {renderPagination(approvedApplications, approvedPage, setApprovedPage)}
              </Card>
            )}
            
            {/* Approved Projects */}
            {projects.approved && projects.approved.length > 0 && (
              <Card>
                <Heading level={4} marginBottom="1rem">Projects ({projects.approved.length})</Heading>
                <Collection items={getPaginatedItems(projects.approved, approvedPage)} type="list" gap="1rem">
                  {(project) => (
                    <Card key={project.id} variation="outlined">
                      <Flex justifyContent="space-between" alignItems="center">
                        <Flex direction="column" gap="0.5rem" flex="1">
                          <Text fontWeight="bold">{project.title}</Text>
                          <Text fontSize="0.9rem">{project.faculty?.name} • {project.department}</Text>
                        </Flex>
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
                                    setViewingProject(project);
                                    setOpenKebabMenu(null);
                                  }}
                                >
                                  View Details
                                </Button>
                              </Flex>
                            </Card>
                          )}
                        </View>
                      </Flex>
                    </Card>
                  )}
                </Collection>
                {renderPagination(projects.approved, approvedPage, setApprovedPage)}
              </Card>
            )}
            
            {approvedApplications.length === 0 && projects.approved?.length === 0 && (
              <Card>
                <Text>No approved items yet.</Text>
              </Card>
            )}
          </Flex>
        </TabItem>
        
        <TabItem title="Rejected Items">
          <Flex direction="column" gap="2rem">
            {/* Rejected Projects */}
            {projects.rejected && projects.rejected.length > 0 && (
              <Card>
                <Heading level={4} marginBottom="1rem">Projects ({projects.rejected.length})</Heading>
                <Collection items={getPaginatedItems(projects.rejected, rejectedPage)} type="list" gap="1rem">
                  {(project) => (
                    <Card key={project.id} variation="outlined">
                      <Flex justifyContent="space-between" alignItems="center">
                        <Flex direction="column" gap="0.5rem" flex="1">
                          <Text fontWeight="bold">{project.title}</Text>
                          <Text fontSize="0.9rem">Faculty: {project.faculty?.name} • {project.department}</Text>
                          <Text fontSize="0.8rem" color="gray">
                            Rejected: {new Date(project.updatedAt).toLocaleDateString()}
                          </Text>
                        </Flex>
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
                                    setViewingProject(project);
                                    setOpenKebabMenu(null);
                                  }}
                                >
                                  View Details
                                </Button>
                              </Flex>
                            </Card>
                          )}
                        </View>
                      </Flex>
                    </Card>
                  )}
                </Collection>
                {renderPagination(projects.rejected, rejectedPage, setRejectedPage)}
              </Card>
            )}
            
            {/* Rejected Applications */}
            {rejectedApplications.length > 0 && (
              <Card>
                <Heading level={4} marginBottom="1rem">Applications ({rejectedApplications.length})</Heading>
                <Collection items={getPaginatedItems(rejectedApplications, rejectedPage)} type="list" gap="1rem">
                  {(application) => (
                    <Card key={application.id} variation="outlined">
                      <Flex justifyContent="space-between" alignItems="center">
                        <Flex direction="column" gap="0.5rem" flex="1">
                          <Text fontWeight="bold">{application.project?.title}</Text>
                          <Text fontSize="0.9rem">Student: {application.student?.name}</Text>
                          <Text fontSize="0.8rem" color="gray">
                            Rejected: {new Date(application.updatedAt).toLocaleDateString()}
                          </Text>
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
                                    setViewingApplication(application);
                                    setOpenKebabMenu(null);
                                  }}
                                >
                                  View Details
                                </Button>
                              </Flex>
                            </Card>
                          )}
                        </View>
                      </Flex>
                    </Card>
                  )}
                </Collection>
                {renderPagination(rejectedApplications, rejectedPage, setRejectedPage)}
              </Card>
            )}
            
            {projects.rejected?.length === 0 && rejectedApplications.length === 0 && (
              <Card>
                <Text>No rejected items yet.</Text>
              </Card>
            )}
          </Flex>
        </TabItem>
      </Tabs>
      
      {/* Project Notes Modal */}
      {selectedProject && (
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
              backgroundColor="white" 
              padding="2rem" 
              boxShadow="large" 
              width="800px" 
              maxWidth="90vw" 
              height="620px" 
              maxHeight="100vh"
              style={{ overflow: 'auto', border: '1px solid black' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Heading level={4}>Return Project for Edits</Heading>
              <Text marginBottom="1rem">Project: {selectedProject.title}</Text>
              
              <TextAreaField
                label="Notes for Faculty"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={15}
                placeholder="Explain what needs to be changed..."
              />
              
              <Flex gap="1rem" marginTop="1rem">
                <Button onClick={() => setSelectedProject(null)}>Cancel</Button>
                <Button 
                  backgroundColor="white" 
                  color="black"
                  border="1px solid black"
                  size="small"
                  onClick={() => handleProjectAction(selectedProject, 'return')}
                  isDisabled={!notes.trim()}
                >
                  Return with Notes
                </Button>
              </Flex>
            </Card>
          </Flex>
        </View>
      )}
      
      {/* Application Notes Modal */}
      {selectedApplication && (
        <Card position="fixed" top="50%" left="50%" transform="translate(-50%, -50%)" 
              backgroundColor="white" padding="2rem" boxShadow="large" 
              width="800px" maxWidth="90vw" height="550px" maxHeight="100vh"
              style={{ zIndex: 1000, overflow: 'auto' }}>
          <Heading level={4}>Return Application</Heading>
          <Text marginBottom="1rem">Student: {selectedApplication.student?.name}</Text>
          
          <TextAreaField
            label="Notes for Student"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={12}
            placeholder="Explain what information is missing..."
          />
          
          <Flex gap="1rem" marginTop="1rem">
            <Button onClick={() => setSelectedApplication(null)}>Cancel</Button>
            <Button 
              backgroundColor="white" 
              color="black"
              border="1px solid black"
              size="small"
              onClick={() => handleApplicationAction(selectedApplication, 'return')}
              isDisabled={!notes.trim()}
            >
              Return with Notes
            </Button>
          </Flex>
        </Card>
      )}
      
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
              maxWidth="900px"
              width="100%"
              maxHeight="100vh"
              style={{ overflow: 'auto', border: '1px solid black' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Flex direction="column" gap="1rem">
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading level={4}>Application Details</Heading>
                  <Button size="small" onClick={() => setViewingApplication(null)}>Close</Button>
                </Flex>
                
                <Divider />
                
                <Flex direction="column" gap="0.5rem">
                  <Text fontWeight="bold">Project Information</Text>
                  <Text>Project: {viewingApplication.project?.title}</Text>
                  <Text>Department: {viewingApplication.project?.department}</Text>
                  <Text>Status: {viewingApplication.status}</Text>
                  <Text>Submitted: {new Date(viewingApplication.createdAt).toLocaleDateString()}</Text>
                </Flex>
                
                <Divider />
                
                <Flex direction="column" gap="0.5rem">
                  <Text fontWeight="bold">Student Information</Text>
                  <Text>Student ID: {viewingApplication.student?.id || viewingApplication.studentID}</Text>
                  <Text>Name: {viewingApplication.student?.name}</Text>
                  <Text>Email: {viewingApplication.student?.email}</Text>
                  <Text>Program: {viewingApplication.student?.major || 'Not specified'}</Text>
                  <Text>Academic Year: {viewingApplication.student?.academicYear || 'Not specified'}</Text>
                  <Text>Expected Graduation: {viewingApplication.student?.expectedGraduation || 'Not specified'}</Text>
                  <Text>GPA: {viewingApplication.student?.gpa || 'Not specified'}</Text>
                </Flex>
                
                {viewingApplication.statement && (
                  <>
                    <Divider />
                    <Flex direction="column" gap="0.5rem">
                      <Text fontWeight="bold">Statement of Interest</Text>
                      <Card variation="outlined" padding="1rem">
                        <div dangerouslySetInnerHTML={{ __html: viewingApplication.statement }} />
                      </Card>
                    </Flex>
                  </>
                )}
                
                {viewingApplication.relevantCourses && viewingApplication.relevantCourses.length > 0 && (
                  <>
                    <Divider />
                    <Flex direction="column" gap="0.5rem">
                      <Text fontWeight="bold">Relevant Coursework</Text>
                      {viewingApplication.relevantCourses.map((course, index) => (
                        <Card key={index} variation="outlined" padding="0.5rem">
                          <Flex justifyContent="space-between">
                            <Text>{course.courseName} ({course.courseNumber})</Text>
                            <Text>Grade: {course.grade} | {course.semester} {course.year}</Text>
                          </Flex>
                        </Card>
                      ))}
                    </Flex>
                  </>
                )}
                
                {viewingApplication.documentKey && (
                  <>
                    <Divider />
                    <Flex direction="column" gap="0.5rem">
                      <Text fontWeight="bold">Supporting Documents</Text>
                      <Flex gap="0.5rem">
                        <Button size="small" onClick={async () => {
                          try {
                            const url = await Storage.get(viewingApplication.documentKey, { 
                              expires: 300
                            });
                            setDocumentUrl(url);
                            setViewingDocument(true);
                          } catch (err) {
                            console.error('Error loading document:', err);
                          }
                        }}>View Document</Button>
                        <Button size="small" backgroundColor="white" color="black" border="1px solid black" onClick={async () => {
                          try {
                            const url = await Storage.get(viewingApplication.documentKey, { 
                              expires: 300
                            });
                            const response = await fetch(url);
                            const blob = await response.blob();
                            const downloadUrl = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = downloadUrl;
                            link.download = 'application-document';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(downloadUrl);
                          } catch (err) {
                            console.error('Error downloading document:', err);
                          }
                        }}>Download</Button>
                      </Flex>
                    </Flex>
                  </>
                )}
              </Flex>
            </Card>
          </Flex>
        </View>
      )}
      
      {/* Document Viewer Modal */}
      {viewingDocument && documentUrl && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.8)"
          style={{ zIndex: 2000 }}
          onClick={() => {
            setViewingDocument(false);
            setDocumentUrl(null);
          }}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            height="100%"
            padding="2rem"
          >
            <Card
              maxWidth="90vw"
              width="100%"
              maxHeight="100vh"
              height="100%"
              onClick={(e) => e.stopPropagation()}
            >
              <Flex direction="column" height="100%">
                <Flex justifyContent="space-between" alignItems="center" padding="1rem">
                  <Heading level={4}>Supporting Document</Heading>
                  <Button size="small" onClick={() => {
                    setViewingDocument(false);
                    setDocumentUrl(null);
                  }}>Close</Button>
                </Flex>
                <Divider />
                <View flex="1" style={{ overflow: 'auto', padding: '1rem' }}>
                  {viewingApplication?.documentKey && viewingApplication.documentKey.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
                    <img
                      src={documentUrl}
                      alt="Supporting Document"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        display: 'block',
                        margin: '0 auto'
                      }}
                    />
                  ) : viewingApplication?.documentKey && viewingApplication.documentKey.toLowerCase().match(/\.(pdf|doc|docx|txt)$/i) ? (
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(documentUrl)}&embedded=true`}
                      width="100%"
                      height="100%"
                      style={{ border: 'none', minHeight: '500px' }}
                      title="Supporting Document"
                    />
                  ) : (
                    <Flex direction="column" alignItems="center" justifyContent="center" height="100%" gap="1rem">
                      <Text>Document preview not available for this file type.</Text>
                      <Button onClick={() => {
                        const link = document.createElement('a');
                        link.href = documentUrl;
                        link.download = 'supporting-document';
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}>Download Document</Button>
                    </Flex>
                  )}
                </View>
              </Flex>
            </Card>
          </Flex>
        </View>
      )}
      
      {/* View Project Details Modal */}
      {viewingProject && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1000 }}
          onClick={() => setViewingProject(null)}
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
              style={{ overflow: 'auto', border: '1px solid black' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Flex direction="column" gap="1rem">
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading level={4}>Project Details</Heading>
                  <Button size="small" onClick={() => setViewingProject(null)}>Close</Button>
                </Flex>
                
                <Divider />
                
                <Flex direction="column" gap="0.5rem">
                  <Text fontWeight="bold">Project Information</Text>
                  <Text>Title: {viewingProject.title}</Text>
                  <Text>Department: {viewingProject.department}</Text>
                  <Text>Faculty: {viewingProject.faculty?.name}</Text>
                  <Text>Status: {viewingProject.projectStatus}</Text>
                  <Text>Created: {new Date(viewingProject.createdAt).toLocaleDateString()}</Text>
                  <Text>Application Deadline: {viewingProject.applicationDeadline ? new Date(viewingProject.applicationDeadline).toLocaleDateString() : 'Not specified'}</Text>
                </Flex>
                
                <Divider />
                
                <Flex direction="column" gap="0.5rem">
                  <Text fontWeight="bold">Project Description</Text>
                  <Card variation="outlined" padding="1rem">
                    <div dangerouslySetInnerHTML={{ __html: viewingProject.description }} />
                  </Card>
                </Flex>
                
                {viewingProject.qualifications && (
                  <>
                    <Divider />
                    <Flex direction="column" gap="0.5rem">
                      <Text fontWeight="bold">Required Qualifications/Prerequisites</Text>
                      <Card variation="outlined" padding="1rem">
                        <Text style={{ whiteSpace: 'pre-wrap' }}>{viewingProject.qualifications}</Text>
                      </Card>
                    </Flex>
                  </>
                )}
                
                {viewingProject.skillsRequired && viewingProject.skillsRequired.length > 0 && (
                  <>
                    <Divider />
                    <Flex direction="column" gap="0.5rem">
                      <Text fontWeight="bold">Skills Required</Text>
                      <Flex wrap="wrap" gap="0.5rem">
                        {viewingProject.skillsRequired.map((skill, index) => (
                          <Badge key={index} backgroundColor="lightgray" color="white">
                            {skill}
                          </Badge>
                        ))}
                      </Flex>
                    </Flex>
                  </>
                )}
                
                {viewingProject.tags && viewingProject.tags.length > 0 && (
                  <>
                    <Divider />
                    <Flex direction="column" gap="0.5rem">
                      <Text fontWeight="bold">Research Tags</Text>
                      <Flex wrap="wrap" gap="0.5rem">
                        {viewingProject.tags.map((tag, index) => (
                          <Badge key={index} backgroundColor="lightgray" color="white">
                            {tag}
                          </Badge>
                        ))}
                      </Flex>
                    </Flex>
                  </>
                )}
                
                <Divider />
                
                <Flex direction="column" gap="0.5rem">
                  <Text fontWeight="bold">Project Details</Text>
                  {viewingProject.duration && (
                    <Text>Duration: {viewingProject.duration}</Text>
                  )}
                  <Text>Requires Transcript Upload: {viewingProject.requiresTranscript ? 'Yes' : 'No'}</Text>
                  <Text>Active: {viewingProject.isActive ? 'Yes' : 'No'}</Text>
                </Flex>
                
                {viewingProject.coordinatorNotes && (
                  <>
                    <Divider />
                    <Flex direction="column" gap="0.5rem">
                      <Text fontWeight="bold">Coordinator Notes</Text>
                      <Card variation="outlined" padding="1rem">
                        <Text style={{ whiteSpace: 'pre-wrap' }}>{viewingProject.coordinatorNotes}</Text>
                      </Card>
                    </Flex>
                  </>
                )}
              </Flex>
            </Card>
          </Flex>
        </View>
      )}
      
      {/* Reject Confirmation Modal */}
      {showRejectConfirm && applicationToReject && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 2000 }}
          onClick={() => setShowRejectConfirm(false)}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            height="100%"
            padding="2rem"
          >
            <Card
              maxWidth="400px"
              width="100%"
              onClick={(e) => e.stopPropagation()}
            >
              <Flex direction="column" gap="1rem">
                <Heading level={4}>Reject Application</Heading>
                <Text>Are you sure you want to reject this application from {applicationToReject.student?.name} for {applicationToReject.project?.title}?</Text>
                <Flex gap="1rem" justifyContent="flex-end">
                  <Button
                    onClick={() => {
                      setShowRejectConfirm(false);
                      setApplicationToReject(null);
                    }}
                    backgroundColor="white"
                    color="black"
                    border="1px solid black"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      await handleApplicationAction(applicationToReject, 'reject');
                      setShowRejectConfirm(false);
                      setApplicationToReject(null);
                    }}
                    backgroundColor="white"
                    color="black"
                    border="1px solid black"
                  >
                    Reject
                  </Button>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </View>
      )}
      
      {/* Approve Confirmation Modal */}
      {showApproveConfirm && applicationToApprove && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 2000 }}
          onClick={() => setShowApproveConfirm(false)}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            height="100%"
            padding="2rem"
          >
            <Card
              maxWidth="400px"
              width="100%"
              onClick={(e) => e.stopPropagation()}
            >
              <Flex direction="column" gap="1rem">
                <Heading level={4}>Approve Application</Heading>
                <Text>Are you sure you want to approve this application from {applicationToApprove.student?.name} for {applicationToApprove.project?.title}?</Text>
                <Flex gap="1rem" justifyContent="flex-end">
                  <Button
                    onClick={() => {
                      setShowApproveConfirm(false);
                      setApplicationToApprove(null);
                    }}
                    backgroundColor="white"
                    color="black"
                    border="1px solid black"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      await handleApplicationAction(applicationToApprove, 'approve');
                      setShowApproveConfirm(false);
                      setApplicationToApprove(null);
                    }}
                    backgroundColor="white"
                    color="black"
                    border="1px solid black"
                  >
                    Approve
                  </Button>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </View>
      )}
      
      {/* Project Approve Confirmation Modal */}
      {showProjectApproveConfirm && projectToApprove && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 2000 }}
          onClick={() => setShowProjectApproveConfirm(false)}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            height="100%"
            padding="2rem"
          >
            <Card
              maxWidth="400px"
              width="100%"
              onClick={(e) => e.stopPropagation()}
            >
              <Flex direction="column" gap="1rem">
                <Heading level={4}>Approve Project</Heading>
                <Text>Are you sure you want to approve the project "{projectToApprove.title}" by {projectToApprove.faculty?.name}?</Text>
                <Flex gap="1rem" justifyContent="flex-end">
                  <Button
                    onClick={() => {
                      setShowProjectApproveConfirm(false);
                      setProjectToApprove(null);
                    }}
                    backgroundColor="white"
                    color="black"
                    border="1px solid black"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      await handleProjectAction(projectToApprove, 'approve');
                      setShowProjectApproveConfirm(false);
                      setProjectToApprove(null);
                    }}
                    backgroundColor="white"
                    color="black"
                    border="1px solid black"
                  >
                    Approve
                  </Button>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </View>
      )}
      
      {/* Project Reject Confirmation Modal */}
      {showProjectRejectConfirm && projectToReject && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 2000 }}
          onClick={() => setShowProjectRejectConfirm(false)}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            height="100%"
            padding="2rem"
          >
            <Card
              maxWidth="400px"
              width="100%"
              onClick={(e) => e.stopPropagation()}
            >
              <Flex direction="column" gap="1rem">
                <Heading level={4}>Reject Project</Heading>
                <Text>Are you sure you want to reject the project "{projectToReject.title}" by {projectToReject.faculty?.name}?</Text>
                <Flex gap="1rem" justifyContent="flex-end">
                  <Button
                    onClick={() => {
                      setShowProjectRejectConfirm(false);
                      setProjectToReject(null);
                    }}
                    backgroundColor="white"
                    color="black"
                    border="1px solid black"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      await handleProjectAction(projectToReject, 'reject');
                      setShowProjectRejectConfirm(false);
                      setProjectToReject(null);
                    }}
                    backgroundColor="white"
                    color="black"
                    border="1px solid black"
                  >
                    Reject
                  </Button>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </View>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1000 }}
          onClick={() => setEditingProject(null)}
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
              style={{ overflow: 'auto', border: '1px solid black' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Heading level={4} marginBottom="1rem">Edit Project</Heading>
              <form onSubmit={handleUpdateProject}>
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
                        value={projectForm.description}
                        onChange={(value) => setProjectForm(prev => ({ ...prev, description: value }))}
                        placeholder="Describe the research project..."
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
                    onChange={handleProjectFormChange}
                    placeholder="e.g. Python, Data Analysis, Machine Learning"
                  />
                  <TextField
                    name="tags"
                    label="Research Tags (comma-separated)"
                    value={projectForm.tags}
                    onChange={handleProjectFormChange}
                    placeholder="e.g. lab, field, geology, code, clinical"
                  />
                  <TextAreaField
                    name="qualifications"
                    label="Required Qualifications/Prerequisites"
                    value={projectForm.qualifications}
                    onChange={handleProjectFormChange}
                    placeholder="e.g. Completion of PSYC 101, minimum GPA of 3.0"
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
                    value={projectForm.requiresTranscript.toString()}
                    onChange={(e) => setProjectForm(prev => ({ 
                      ...prev, 
                      requiresTranscript: e.target.value === 'true' 
                    }))}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </SelectField>
                  <Flex gap="1rem">
                    <Button onClick={() => setEditingProject(null)}>Cancel</Button>
                    <Button 
                      type="submit"
                      backgroundColor="white"
                      color="black"
                      border="1px solid black"
                    >
                      Update Project
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

export default CoordinatorDashboard;
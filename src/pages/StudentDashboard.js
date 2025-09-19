import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';
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
  TextAreaField,
  Image,
  Badge
} from '@aws-amplify/ui-react';
import { listApplications, listProjects, createApplication } from '../graphql/operations';
import EnhancedApplicationForm from '../components/EnhancedApplicationForm';
import ApplicationStatus from '../components/ApplicationStatus';
import ApplicationStatusGuide from '../components/ApplicationStatusGuide';

const StudentDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 10;
  const [applicationForm, setApplicationForm] = useState({
    hoursPerWeek: '',
    statement: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnseenChanges, setHasUnseenChanges] = useState(false);
  const [lastViewedTime, setLastViewedTime] = useState(null);
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [returnedPage, setReturnedPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    fetchData();
  }, [user]);
  
  // Clear notification when My Applications tab is viewed
  useEffect(() => {
    if (activeTabIndex === 1 && hasUnseenChanges) {
      setHasUnseenChanges(false);
      const userId = user.id || user.username;
      localStorage.setItem(`lastViewedApplications_${userId}`, new Date().toISOString());
    }
  }, [activeTabIndex, hasUnseenChanges, user]);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = user.id || user.username;
      
      let userApplications = [];
      
      // Fetch student's applications
      try {
        const applicationResult = await API.graphql(graphqlOperation(listApplications, { 
          limit: 100
        }));
        
        // Filter applications client-side for now
        userApplications = applicationResult.data?.listApplications?.items?.filter(
          app => app.studentID === userId
        ) || [];
      } catch (appErr) {
        console.error('Error fetching applications:', appErr);
        if (appErr.errors && appErr.errors.length > 0) {
          console.error('GraphQL errors:', appErr.errors);
        }
        // Continue with other operations even if this fails
        userApplications = [];
      }
      
      // Fetch all projects for enriching applications
      try {
        const projectResult = await API.graphql(graphqlOperation(listProjects, { 
          limit: 100
        }));
        
        if (projectResult.data && projectResult.data.listProjects) {
          const allProjects = projectResult.data.listProjects.items || [];
          // Set approved/published projects for display (coordinator-approved projects)
          const filteredProjects = allProjects.filter(p => p.isActive && (p.projectStatus === 'Approved' || p.projectStatus === 'Published'));
          setProjects(filteredProjects);
          
          // Use all projects for enriching applications
          const enrichedApplications = userApplications.map(app => {
            const project = allProjects.find(p => p.id === app.projectID);
            return {
              ...app,
              project: project || null
            };
          }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          
          setApplications(enrichedApplications);
          
          // Check for unseen changes
          const storedLastViewed = localStorage.getItem(`lastViewedApplications_${userId}`);
          const lastViewed = storedLastViewed ? new Date(storedLastViewed) : new Date(0);
          setLastViewedTime(lastViewed);
          
          const hasChanges = enrichedApplications.some(app => {
            const updatedAt = new Date(app.updatedAt);
            const createdAt = new Date(app.createdAt);
            return updatedAt > lastViewed && updatedAt > createdAt;
          });
          
          setHasUnseenChanges(hasChanges);
        } else {
          console.warn('No project data returned');
          setProjects([]);
          setApplications(userApplications);
        }
      } catch (projErr) {
        console.error('Error fetching projects:', projErr);
        console.error('Project error details:', projErr.errors);
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
      <Flex
        position="relative"
        width="100vw"
        height="400px"
        style={{ left: '50%', marginLeft: '-50vw', marginTop: '-2rem' }}
      >
        <Image
          alt="Library Banner"
          src="/Library.jpg"
          width="100%"
          height="100%"
          objectFit="cover"
          objectPosition="center"
        />
      </Flex>
      <Flex direction="column" padding="2rem" gap="2rem">
        <Flex direction="column" gap="0.5rem">
          <Heading level={2}>Student Dashboard</Heading>
          <Text fontSize="1.1rem" color="#666">
            Welcome back, {user?.name || 'Student'}! You are logged in as a {user?.role || 'Student'}.
          </Text>
        </Flex>
      
      {error && <Text color="red">{error}</Text>}
      
      <Flex direction={{ base: 'column', large: 'row' }} gap="1rem">
        <Card variation="elevated" flex="1">
          <Heading level={4}>My Applications</Heading>
          <Flex wrap="wrap" gap="1rem" marginTop="1rem">
            <Card variation="outlined" padding="1rem" flex="1">
              <Heading level={5}>{applications.filter(app => !['Rejected', 'Cancelled', 'Expired', 'Withdrawn'].includes(app.status)).length}/3</Heading>
              <Text>Applications Used</Text>
            </Card>
            <Card variation="outlined" padding="1rem" flex="1">
              <Heading level={5} color={statusCounts.approved > 0 ? "green" : "black"}>{statusCounts.approved}</Heading>
              <Text>Approved</Text>
            </Card>
          </Flex>
        </Card>
        
        <Card variation="elevated" flex="1">
          <Heading level={4}>Quick Links</Heading>
          <Flex direction="column" gap="0.5rem" marginTop="1rem">
            <Button backgroundColor="white" color="black" border="1px solid black" onClick={() => navigate('/search')}>
              Browse Research Opportunities
            </Button>
            <Button onClick={() => setActiveTabIndex(1)}>
              View My Applications
            </Button>
            <Button onClick={() => setActiveTabIndex(3)}>
              Application Status Guide
            </Button>
          </Flex>
        </Card>
      </Flex>
      
      <Tabs
        currentIndex={activeTabIndex}
        onChange={(index) => {
          setActiveTabIndex(index);
          // Reset pagination when switching tabs
          setApplicationsPage(1);
          setReturnedPage(1);
          if (index === 1) { // My Applications tab
            setHasUnseenChanges(false);
            const userId = user.id || user.username;
            localStorage.setItem(`lastViewedApplications_${userId}`, new Date().toISOString());
          }
        }}
      >
        <TabItem title="Research Opportunities">
          {projects.length === 0 ? (
            <Card backgroundColor="white">
              <Text>No active research opportunities available at this time.</Text>
            </Card>
          ) : (
            <>
              <Collection
                items={projects.slice((currentPage - 1) * projectsPerPage, currentPage * projectsPerPage)}
                type="list"
                gap="1rem"
                wrap="nowrap"
              direction="column"
            >
              {(project) => {
                const hasApplied = applications.some(app => app.projectID === project.id && !['Rejected', 'Cancelled', 'Expired', 'Withdrawn'].includes(app.status));
                const isExpired = project.applicationDeadline && new Date(project.applicationDeadline) < new Date();
                
                return (
                <Card key={project.id} backgroundColor="white">
                  <Flex direction="column" gap="0.5rem">
                    <Flex justifyContent="space-between" alignItems="center">
                      <Heading level={4}>{project.title}</Heading>
                      <Badge 
                        backgroundColor={isExpired ? "gray" : "green"}
                        color="white"
                      >
                        {isExpired ? "Expired" : "Active"}
                      </Badge>
                    </Flex>
                    
                    <Text fontWeight="bold">College: {project.department}</Text>
                    <div dangerouslySetInnerHTML={{ __html: project.description }} />
                    
                    {project.qualifications && (
                      <Text><strong>Required Qualifications/Prerequisites:</strong> {project.qualifications}</Text>
                    )}
                    
                    {project.duration && (
                      <Text><strong>Project Duration:</strong> {project.duration}</Text>
                    )}
                    
                    <Text><strong>Requires Transcript Upload:</strong> {project.requiresTranscript ? 'Yes' : 'No'}</Text>
                    
                    <Divider />
                    
                    {project.skillsRequired && project.skillsRequired.length > 0 && (
                      <Flex direction="column" gap="0.5rem">
                        <Text fontWeight="bold" fontSize="0.9rem">Skills Required:</Text>
                        <Flex wrap="wrap" gap="0.5rem">
                          {project.skillsRequired.map((skill, index) => (
                            <Badge key={index} backgroundColor="lightgray" color="white">
                              Skills: {skill}
                            </Badge>
                          ))}
                        </Flex>
                      </Flex>
                    )}
                    
                    {project.tags && project.tags.length > 0 && (
                      <Flex direction="column" gap="0.5rem">
                        <Text fontWeight="bold" fontSize="0.9rem">Research Tags:</Text>
                        <Flex wrap="wrap" gap="0.5rem">
                          {project.tags.map((tag, index) => (
                            <Badge key={index} backgroundColor="lightgray" color="white">
                              {tag}
                            </Badge>
                          ))}
                        </Flex>
                      </Flex>
                    )}
                    
                    <Divider />
                    
                    <Flex justifyContent="space-between" alignItems="center">
                      <Text fontSize="0.9rem">
                        Deadline: {project.applicationDeadline ? new Date(project.applicationDeadline).toLocaleDateString() : 'Not specified'}
                      </Text>
                      <Flex gap="0.5rem">
                        <Button 
                          backgroundColor="white"
                          color="black"
                          border="1px solid black"
                          size="small" 
                          onClick={() => handleApply(project)}
                          isDisabled={hasApplied || isExpired || applications.filter(app => !['Rejected', 'Cancelled', 'Expired', 'Withdrawn'].includes(app.status)).length >= 3}
                        >
                          {hasApplied ? 'Already Applied' : 
                           isExpired ? 'Expired' :
                           applications.filter(app => !['Rejected', 'Cancelled', 'Expired', 'Withdrawn'].includes(app.status)).length >= 3 ? 'Limit Reached' : 'Apply'}
                        </Button>
                      </Flex>
                    </Flex>
                  </Flex>
                </Card>
                );
              }}
            </Collection>
            
            {projects.length > projectsPerPage && (
              <Flex justifyContent="flex-end" alignItems="center" gap="1rem" marginTop="2rem">
                <Button 
                  size="small"
                  backgroundColor="white"
                  color="black"
                  border="1px solid black"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  isDisabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.ceil(projects.length / projectsPerPage) }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    size="small"
                    backgroundColor={currentPage === page ? "black" : "white"}
                    color={currentPage === page ? "white" : "black"}
                    border="1px solid black"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button 
                  size="small"
                  backgroundColor="white"
                  color="black"
                  border="1px solid black"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(projects.length / projectsPerPage)))}
                  isDisabled={currentPage === Math.ceil(projects.length / projectsPerPage)}
                >
                  Next
                </Button>
              </Flex>
            )}
            </>
          )}
        </TabItem>
        
        <TabItem title="My Applications">
          {applications.length === 0 ? (
            <Card backgroundColor="white">
              <Text>You haven't submitted any applications yet.</Text>
              <Button 
                backgroundColor="white"
                color="black"
                border="1px solid black"
                onClick={() => setActiveTabIndex(0)}
                marginTop="1rem"
              >
                Browse Opportunities
              </Button>
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
                <ApplicationStatus 
                  key={application.id}
                  application={{
                    ...application,
                    student: user
                  }}
                  isStudent={true}
                  onUpdate={handleApplicationUpdate}
                  showReturnedSection={false}
                />
              )}
            </Collection>
            {renderPagination(applications, applicationsPage, setApplicationsPage)}
            </>
          )}
        </TabItem>
        
        <TabItem title="Returned Applications">
          {applications.filter(app => app.status === 'Returned').length === 0 ? (
            <Card backgroundColor="white">
              <Text>No returned applications.</Text>
            </Card>
          ) : (
            <>
            <Collection
              items={getPaginatedItems(applications.filter(app => app.status === 'Returned').sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)), returnedPage)}
              type="list"
              gap="1rem"
              wrap="nowrap"
              direction="column"
            >
              {(application) => (
                <ApplicationStatus 
                  key={application.id}
                  application={{
                    ...application,
                    student: user
                  }}
                  isStudent={true}
                  onUpdate={handleApplicationUpdate}
                  showReturnedSection={true}
                />
              )}
            </Collection>
            {renderPagination(applications.filter(app => app.status === 'Returned'), returnedPage, setReturnedPage)}
            </>
          )}
        </TabItem>
        
        <TabItem title="Status Guide">
          <ApplicationStatusGuide />
        </TabItem>
      </Tabs>
      </Flex>
      

      
      {/* Enhanced Application Form Overlay */}
      {/* Project Details Modal */}
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
              maxWidth="900px"
              width="100%"
              maxHeight="100vh"
              style={{ overflow: 'auto', border: '1px solid black' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Flex direction="column" gap="1rem" padding="1rem">
                <Heading level={4}>Project Details</Heading>
                
                <Divider />
                
                <Flex direction="column" gap="0.5rem">
                  <Text fontWeight="bold">Title:</Text>
                  <Text>{selectedProject.title}</Text>
                  
                  <Text fontWeight="bold">College:</Text>
                  <Text>{selectedProject.department}</Text>
                  
                  <Text fontWeight="bold">Description:</Text>
                  <div dangerouslySetInnerHTML={{ __html: selectedProject.description }} />
                  
                  {selectedProject.qualifications && (
                    <>
                      <Text fontWeight="bold">Required Qualifications:</Text>
                      <Text style={{ whiteSpace: 'pre-wrap' }}>{selectedProject.qualifications}</Text>
                    </>
                  )}
                  
                  {selectedProject.skillsRequired && selectedProject.skillsRequired.length > 0 && (
                    <>
                      <Text fontWeight="bold">Skills Required:</Text>
                      <Flex wrap="wrap" gap="0.5rem">
                        {selectedProject.skillsRequired.map((skill, index) => (
                          <Badge key={index} backgroundColor="lightgray" color="white">
                            {skill}
                          </Badge>
                        ))}
                      </Flex>
                    </>
                  )}
                  
                  {selectedProject.tags && selectedProject.tags.length > 0 && (
                    <>
                      <Text fontWeight="bold">Research Tags:</Text>
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
                    <>
                      <Text fontWeight="bold">Duration:</Text>
                      <Text>{selectedProject.duration}</Text>
                    </>
                  )}
                  
                  <Text fontWeight="bold">Application Deadline:</Text>
                  <Text>{selectedProject.applicationDeadline ? new Date(selectedProject.applicationDeadline).toLocaleDateString() : 'Not specified'}</Text>
                  
                  <Text fontWeight="bold">Requires Transcript:</Text>
                  <Text>{selectedProject.requiresTranscript ? 'Yes' : 'No'}</Text>
                </Flex>
                
                <Divider />
                
                <Flex gap="0.5rem" justifyContent="flex-start">
                  <Button 
                    onClick={() => setSelectedProject(null)}
                  >
                    Close
                  </Button>
                  {(() => {
                    const hasApplied = applications.some(app => app.projectID === selectedProject.id && !['Rejected', 'Cancelled', 'Expired', 'Withdrawn'].includes(app.status));
                    const isExpired = selectedProject.applicationDeadline && new Date(selectedProject.applicationDeadline) < new Date();
                    
                    if (isExpired) {
                      return (
                        <Button 
                          backgroundColor="white"
                          color="black"
                          border="1px solid black"
                          isDisabled={true}
                        >
                          Expired
                        </Button>
                      );
                    } else if (hasApplied) {
                      return (
                        <Button 
                          backgroundColor="white"
                          color="black"
                          border="1px solid black"
                          isDisabled={true}
                        >
                          Already Applied
                        </Button>
                      );
                    } else {
                      return (
                        <Button 
                          backgroundColor="white"
                          color="black"
                          border="1px solid black"
                          onClick={() => {
                            setShowApplicationForm(true);
                          }}
                        >
                          Apply
                        </Button>
                      );
                    }
                  })()}
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </View>
      )}
      
      {showApplicationForm && selectedProject && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1000 }}
          onClick={() => {
            setShowApplicationForm(false);
            setSelectedProject(null);
          }}
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
              maxHeight="100vh"
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
              maxHeight="100vh"
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
    </View>
  );
};

export default StudentDashboard;
import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { Flex, Heading, Card, TextField, Button, Text, View, Divider } from '@aws-amplify/ui-react';
import { updateUser, listApplications, listProjects, updateApplication } from '../graphql/operations';
import { useNavigate } from 'react-router-dom';

const ProfilePage = ({ user, refreshProfile }) => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    studentId: '',
    currentProgram: '',
    degreeType: '',
    expectedGraduation: '',
    researchInterests: '',
    skillsExperience: '',
    availability: '',
    personalStatement: '',
    certificates: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [scheduledEvents, setScheduledEvents] = useState(() => {
    const userId = user?.id || user?.username || user?.email;
    const saved = localStorage.getItem(`scheduledEvents_${userId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({ title: '', description: '', startDate: '', endDate: '', allDay: true });
  const [showProjectEditModal, setShowProjectEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);
  const [applications, setApplications] = useState([]);
  const [projects, setProjects] = useState([]);

  // Initialize form with user data and load calendar events
  useEffect(() => {
    if (user) {
      setFormState({
        name: user.name || '',
        email: user.email || '',
        studentId: user.id || user.username || '',
        currentProgram: user.major || '',
        degreeType: user.academicYear || '',
        expectedGraduation: user.expectedGraduation || '',
        researchInterests: user.researchInterests ? user.researchInterests.join(', ') : '',
        skillsExperience: user.skills ? user.skills.join(', ') : '',
        availability: user.availability || '',
        personalStatement: user.personalStatement || '',
        certificates: user.certificates ? user.certificates.join(', ') : ''
      });
      loadCalendarEvents();
    }
  }, [user]);
  
  const loadCalendarEvents = async () => {
    try {
      const userId = user.id || user.username;
      
      // Get approved applications for this student
      const applicationsResult = await API.graphql(graphqlOperation(listApplications, { limit: 100 }));
      const approvedApplications = applicationsResult.data.listApplications.items.filter(
        app => app.studentID === userId && (app.status === 'Approved' || (app.status === 'Selected' && app.isSelected))
      );
      
      // Get project details for approved applications
      const projectsResult = await API.graphql(graphqlOperation(listProjects, { limit: 100 }));
      const allProjects = projectsResult.data.listProjects.items;
      
      // Store in state for use in other functions
      setApplications(applicationsResult.data.listApplications.items);
      setProjects(allProjects);
      
      const events = approvedApplications.map(app => {
        const project = allProjects.find(p => p.id === app.projectID);
        const projectDates = [];
        
        // Parse project duration to get date range
        if (project?.duration) {
          const duration = project.duration.toLowerCase();
          const currentYear = new Date().getFullYear();
          
          // Extract number of months if specified
          const monthsMatch = duration.match(/(\d+)\s*months?/);
          const numMonths = monthsMatch ? parseInt(monthsMatch[1]) : null;
          
          let startMonth = 0;
          if (duration.includes('fall')) {
            startMonth = 8; // September
          } else if (duration.includes('spring')) {
            startMonth = 0; // January
          } else if (duration.includes('summer')) {
            startMonth = 5; // June
          }
          
          // Use specified months or default semester length
          const monthsToAdd = numMonths || (duration.includes('fall') ? 4 : duration.includes('spring') ? 5 : 3);
          
          for (let i = 0; i < monthsToAdd; i++) {
            projectDates.push(new Date(currentYear, startMonth + i, 1));
          }
        }
        
        return {
          title: project?.title || 'Research Project',
          date: project?.applicationDeadline ? new Date(project.applicationDeadline).toLocaleDateString() : 'TBD',
          description: `Research opportunity: ${project?.title}`,
          type: 'research',
          projectDates: projectDates,
          facultyName: project?.facultyName || 'Faculty',
          facultyId: project?.facultyID
        };
      });
      
      setCalendarEvents(events);
    } catch (error) {
      console.error('Error loading calendar events:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      // Convert arrays
      const researchInterests = formState.researchInterests
        ? formState.researchInterests.split(',').map(item => item.trim()).filter(item => item)
        : [];
      const skills = formState.skillsExperience
        ? formState.skillsExperience.split(',').map(item => item.trim()).filter(item => item)
        : [];
      const certificates = formState.certificates
        ? formState.certificates.split(',').map(item => item.trim()).filter(item => item)
        : [];
      
      // Prepare input for updateUser mutation
      const input = {
        id: user.id || user.username,
        name: formState.name,
        major: formState.currentProgram,
        academicYear: formState.degreeType,
        expectedGraduation: formState.expectedGraduation || null,
        researchInterests,
        skills,
        availability: formState.availability || null,
        personalStatement: formState.personalStatement || null,
        certificates,
        profileComplete: true
      };
      
      // Update user in DynamoDB
      const result = await API.graphql(graphqlOperation(updateUser, { input }));
      setMessage('Profile updated successfully!');
      
      // Update form state with the saved data to keep fields populated
      const updatedUser = result.data.updateUser;
      setFormState({
        name: updatedUser.name || '',
        email: updatedUser.email || '',
        studentId: updatedUser.id || '',
        currentProgram: updatedUser.major || '',
        degreeType: updatedUser.academicYear || '',
        expectedGraduation: updatedUser.expectedGraduation || '',
        researchInterests: updatedUser.researchInterests ? updatedUser.researchInterests.join(', ') : '',
        skillsExperience: updatedUser.skills ? updatedUser.skills.join(', ') : '',
        availability: updatedUser.availability || '',
        personalStatement: updatedUser.personalStatement || '',
        certificates: updatedUser.certificates ? updatedUser.certificates.join(', ') : ''
      });
      
      // Refresh the user profile in the parent component
      if (refreshProfile) {
        refreshProfile();
      }
    } catch (err) {
      setError('An error occurred while updating your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          My Profile
        </Heading>
      </Card>
      
      <Flex direction="row" gap="2rem">
        <Card 
          flex="2"
          backgroundColor="white"
          padding="1.5rem"
          style={{
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="1rem">
            <TextField
              name="studentId"
              label="Student ID"
              placeholder="Your student ID"
              value={formState.studentId}
              onChange={handleChange}
              isReadOnly
            />
            
            <TextField
              name="currentProgram"
              label="Current Academic Program"
              placeholder="e.g., Computer Science, Biology"
              value={formState.currentProgram}
              onChange={handleChange}
            />
            
            <TextField
              name="degreeType"
              label="Degree Pursued"
              placeholder="e.g., Bachelor's, Master's, PhD"
              value={formState.degreeType}
              onChange={handleChange}
            />
            
            <TextField
              name="expectedGraduation"
              label="Expected Graduation Date"
              placeholder="e.g., Spring 2025"
              value={formState.expectedGraduation}
              onChange={handleChange}
            />
            
            <TextField
              name="researchInterests"
              label="Research Interests"
              placeholder="Enter research interests separated by commas"
              value={formState.researchInterests}
              onChange={handleChange}
            />
            
            <TextField
              name="skillsExperience"
              label="Skills and Experience"
              placeholder="Enter skills and experience separated by commas"
              value={formState.skillsExperience}
              onChange={handleChange}
            />
            
            <TextField
              name="availability"
              label="Availability"
              placeholder="e.g., Fall 2024, Spring 2025"
              value={formState.availability}
              onChange={handleChange}
            />
            
            <TextField
              name="personalStatement"
              label="Personal Statement"
              placeholder="Brief description of your motivation for research"
              value={formState.personalStatement}
              onChange={handleChange}
            />
            
            <TextField
              name="certificates"
              label="Certificates"
              placeholder="Enter certificates separated by commas"
              value={formState.certificates}
              onChange={handleChange}
            />
            
            {message && <Text color="green">{message}</Text>}
            {error && <Text color="red">{error}</Text>}
            
            <Flex justifyContent="flex-end">
              <Button 
                type="submit" 
                backgroundColor="white"
                color="black"
                border="1px solid black"
                size="small"
                isLoading={isSubmitting}
                loadingText="Saving..."
              >
                Save Changes
              </Button>
            </Flex>
          </Flex>
        </form>
        </Card>
        
        {/* Calendar Sidebar */}
        <Card 
          flex="1" 
          height="fit-content"
          backgroundColor="white"
          padding="1.5rem"
          style={{
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <Flex direction="column" gap="1rem">
            <Flex justifyContent="space-between" alignItems="center">
              <Heading level={4} color="#2d3748">My Calendar</Heading>
              <Button
                size="small"
                backgroundColor="white"
                color="black"
                border="1px solid black"
                onClick={() => setShowCalendarModal(true)}
              >
                View Full Calendar
              </Button>
            </Flex>
            <Divider />
            
            {/* Mini Calendar View */}
            <Card variation="outlined" padding="1rem">
              <Flex justifyContent="space-between" alignItems="center" marginBottom="0.5rem">
                <Button
                  size="small"
                  backgroundColor="white"
                  color="black"
                  border="1px solid black"
                  onClick={() => {
                    const newDate = new Date(miniCalendarDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setMiniCalendarDate(newDate);
                  }}
                >
                  ←
                </Button>
                <Text fontSize="0.9rem" textAlign="center">
                  {miniCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <Button
                  size="small"
                  backgroundColor="white"
                  color="black"
                  border="1px solid black"
                  onClick={() => {
                    const newDate = new Date(miniCalendarDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setMiniCalendarDate(newDate);
                  }}
                >
                  →
                </Button>
              </Flex>
              
              {/* Simple calendar grid */}
              <Flex direction="column" gap="0.2rem">
                {/* Days of week header */}
                <Flex justifyContent="space-between">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <Text key={i} fontSize="0.8rem" fontWeight="bold" width="2rem" textAlign="center">
                      {day}
                    </Text>
                  ))}
                </Flex>
                
                {/* Calendar days - simplified for now */}
                {Array.from({ length: 5 }, (_, week) => (
                  <Flex key={week} justifyContent="space-between">
                    {Array.from({ length: 7 }, (_, day) => {
                      const dayNum = week * 7 + day - 2; // Rough calculation
                      const today = new Date();
                      const currentDate = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth(), dayNum);
                      const isToday = dayNum === today.getDate() && 
                                     miniCalendarDate.getMonth() === today.getMonth() && 
                                     miniCalendarDate.getFullYear() === today.getFullYear();
                      
                      // Check if this date has scheduled events
                      const hasScheduledEventMini = scheduledEvents.some(event => {
                        const eventStart = new Date(event.startDate + 'T00:00:00');
                        const eventEnd = new Date(event.endDate + 'T00:00:00');
                        const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
                        return currentDateOnly >= eventStart && currentDateOnly <= eventEnd;
                      });
                      
                      // Check if this date has a project
                      const hasProjectMini = calendarEvents.some(event => 
                        event.projectDates && event.projectDates.some(projectDate => 
                          projectDate.getMonth() === currentDate.getMonth() && 
                          projectDate.getFullYear() === currentDate.getFullYear()
                        )
                      );
                      return (
                        <Button
                          key={day}
                          size="small"
                          width="2rem"
                          height="2rem"
                          fontSize="0.8rem"
                          backgroundColor={isToday ? '#4caf50' : 'transparent'}
                          color={isToday ? 'white' : 'black'}
                          border="none"
                          style={{ position: 'relative' }}
                          onClick={() => {
                            if (dayNum > 0 && dayNum <= 31) {
                              const clickedDate = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth(), dayNum);
                              setSelectedDate(clickedDate);
                              setEditingEvent(null);
                              setEventForm({ title: '', description: '', startDate: clickedDate.toISOString().split('T')[0], endDate: clickedDate.toISOString().split('T')[0], allDay: true });
                              setShowScheduleForm(true);
                            }
                          }}
                        >
                          {dayNum > 0 && dayNum <= 31 ? dayNum : ''}
                          {hasProjectMini && dayNum > 0 && dayNum <= 31 && (
                            <View
                              style={{
                                position: 'absolute',
                                top: '2px',
                                right: '2px',
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                backgroundColor: '#4caf50'
                              }}
                            />
                          )}
                          {hasScheduledEventMini && dayNum > 0 && dayNum <= 31 && (
                            <View
                              style={{
                                position: 'absolute',
                                top: hasProjectMini ? '8px' : '2px',
                                right: '2px',
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                backgroundColor: '#2196f3'
                              }}
                            />
                          )}
                        </Button>
                      );
                    })}
                  </Flex>
                ))}
              </Flex>
            </Card>
            
            {/* Upcoming Events */}
            <Card variation="outlined" padding="1rem">
              <Text fontWeight="bold" marginBottom="0.5rem" color="#2d3748">Upcoming Events</Text>
              {calendarEvents.length === 0 && scheduledEvents.length === 0 ? (
                <Text fontSize="0.9rem" color="#4a5568">No events scheduled</Text>
              ) : (
                <Flex direction="column" gap="0.5rem">
                  {calendarEvents.slice(0, 2).map((event, index) => (
                    <Card key={`project-${index}`} variation="outlined" padding="0.5rem">
                      <Flex justifyContent="space-between" alignItems="center">
                        <Flex direction="column" flex="1">
                          <Text fontSize="0.9rem" fontWeight="bold" color="#2d3748">{event.title}</Text>
                          <Text fontSize="0.8rem" color="#4a5568">{event.date}</Text>
                          <Text fontSize="0.7rem" color="green">Research Project</Text>
                        </Flex>
                        <Button
                          size="small"
                          backgroundColor="white"
                          color="black"
                          border="1px solid black"
                          fontSize="0.7rem"
                          padding="0.25rem 0.5rem"
                          onClick={() => {
                            setDeleteAction(() => async () => {
                              try {
                                // Find the application for this project
                                const application = applications.find(app => {
                                  const project = projects.find(p => p.id === app.projectID);
                                  return project?.title === event.title;
                                });
                                
                                if (application) {
                                  // Update application status to withdrawn
                                  await API.graphql(graphqlOperation(updateApplication, {
                                    input: {
                                      id: application.id,
                                      status: 'withdrawn'
                                    }
                                  }));
                                  
                                  // Refresh the data
                                  window.location.reload();
                                }
                              } catch (error) {
                                console.error('Error withdrawing from project:', error);
                              }
                            });
                            setShowDeleteConfirm(true);
                          }}
                        >
                          Delete
                        </Button>
                      </Flex>
                    </Card>
                  ))}
                  {scheduledEvents.slice(0, 2).map((event, index) => (
                    <Card key={`scheduled-${index}`} variation="outlined" padding="0.5rem">
                      <Flex justifyContent="space-between" alignItems="center">
                        <Flex direction="column" flex="1">
                          <Text fontSize="0.9rem" fontWeight="bold" color="#2d3748">{event.title}</Text>
                          <Text fontSize="0.8rem" color="#4a5568">
                          {event.startDate === event.endDate ? 
                            (event.startDate ? new Date(event.startDate + 'T00:00:00').toLocaleDateString() : 'No date') : 
                            `${event.startDate ? new Date(event.startDate + 'T00:00:00').toLocaleDateString() : 'No date'} - ${event.endDate ? new Date(event.endDate + 'T00:00:00').toLocaleDateString() : 'No date'}`
                          }
                        </Text>
                          {event.description && <Text fontSize="0.8rem" color="#4a5568">{event.description}</Text>}
                          <Text fontSize="0.7rem" color="blue">Scheduled Event</Text>
                        </Flex>
                        <Flex direction="column" gap="0.25rem">
                          <Button
                            size="small"
                            backgroundColor="white"
                            color="black"
                            border="1px solid black"
                            fontSize="0.7rem"
                            padding="0.25rem 0.5rem"
                            onClick={() => {
                              setEditingEvent(event);
                              setEventForm({ title: event.title, description: event.description, startDate: event.startDate, endDate: event.endDate, allDay: event.allDay });
                              setSelectedDate(new Date(event.date));
                              setShowScheduleForm(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            backgroundColor="white"
                            color="black"
                            border="1px solid black"
                            fontSize="0.7rem"
                            padding="0.25rem 0.5rem"
                            onClick={() => {
                              setDeleteAction(() => () => {
                                const updatedEvents = scheduledEvents.filter(e => e.id !== event.id);
                                setScheduledEvents(updatedEvents);
                                const userId = user?.id || user?.username || user?.email;
                                localStorage.setItem(`scheduledEvents_${userId}`, JSON.stringify(updatedEvents));
                              });
                              setShowDeleteConfirm(true);
                            }}
                          >
                            Delete
                          </Button>
                        </Flex>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              )}
            </Card>
            

          </Flex>
        </Card>
      </Flex>
      
      {/* Full Calendar Modal */}
      {showCalendarModal && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1000 }}
          onClick={() => setShowCalendarModal(false)}
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
              <Flex direction="column" gap="1rem">
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading level={3}>My Academic Calendar</Heading>
                  <Button 
                    onClick={() => setShowCalendarModal(false)}
                    backgroundColor="white"
                    color="black"
                    border="1px solid black"
                  >
                    Close
                  </Button>
                </Flex>
                
                <Divider />
                
                {/* Full Calendar View */}
                <Card padding="2rem">
                  <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem">
                    <Flex gap="0.5rem">
                      <Button 
                        onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear() - 1, currentCalendarDate.getMonth(), 1))}
                        backgroundColor="white"
                        color="black"
                        border="1px solid black"
                        size="small"
                      >
                        ««
                      </Button>
                      <Button 
                        onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1))}
                        backgroundColor="white"
                        color="black"
                        border="1px solid black"
                        size="small"
                      >
                        ←
                      </Button>
                    </Flex>
                    <Text fontSize="1.2rem">
                      {currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                    <Flex gap="0.5rem">
                      <Button 
                        onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1))}
                        backgroundColor="white"
                        color="black"
                        border="1px solid black"
                        size="small"
                      >
                        →
                      </Button>
                      <Button 
                        onClick={() => setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear() + 1, currentCalendarDate.getMonth(), 1))}
                        backgroundColor="white"
                        color="black"
                        border="1px solid black"
                        size="small"
                      >
                        »»
                      </Button>
                    </Flex>
                  </Flex>
                  
                  {/* Full month calendar grid */}
                  <Flex direction="column" gap="0.5rem">
                    {/* Days of week header */}
                    <Flex justifyContent="space-between">
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => (
                        <Text key={i} fontWeight="bold" width="12%" textAlign="center" padding="0.5rem">
                          {day}
                        </Text>
                      ))}
                    </Flex>
                    
                    {/* Calendar weeks */}
                    {Array.from({ length: 6 }, (_, week) => (
                      <Flex key={week} justifyContent="space-between">
                        {Array.from({ length: 7 }, (_, day) => {
                          const dayNum = week * 7 + day - 2;
                          const currentDate = new Date();
                          const cellDate = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), dayNum);
                          const today = new Date();
                          const isToday = dayNum > 0 && dayNum <= 31 && 
                                         cellDate.getDate() === today.getDate() && 
                                         cellDate.getMonth() === today.getMonth() && 
                                         cellDate.getFullYear() === today.getFullYear();
                          
                          // Check if this date has a project
                          const hasProject = calendarEvents.some(event => 
                            event.projectDates && event.projectDates.some(projectDate => 
                              projectDate.getMonth() === cellDate.getMonth() && 
                              projectDate.getFullYear() === cellDate.getFullYear()
                            )
                          );
                          
                          // Check if this date has scheduled events
                          const hasScheduledEvent = scheduledEvents.some(event => {
                            const eventStart = new Date(event.startDate + 'T00:00:00');
                            const eventEnd = new Date(event.endDate + 'T00:00:00');
                            const cellDateOnly = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
                            return cellDateOnly >= eventStart && cellDateOnly <= eventEnd;
                          });
                          
                          return (
                            <Card
                              key={day}
                              width="12%"
                              minHeight="4rem"
                              padding="0.5rem"
                              backgroundColor={isToday ? '#c8e6c9' : 'white'}
                              variation="outlined"
                              style={{ 
                                position: 'relative',
                                cursor: dayNum > 0 && dayNum <= 31 ? 'pointer' : 'default',
                                transition: 'background-color 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                if (dayNum > 0 && dayNum <= 31 && !isToday) {
                                  e.currentTarget.style.backgroundColor = '#e1bee7';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (dayNum > 0 && dayNum <= 31 && !isToday) {
                                  e.currentTarget.style.backgroundColor = 'white';
                                }
                              }}
                              onClick={() => {
                                if (dayNum > 0 && dayNum <= 31) {
                                  if (hasProject) {
                                    // Show project details
                                    const dayEvents = calendarEvents.filter(event => 
                                      event.projectDates && event.projectDates.some(projectDate => 
                                        projectDate.getMonth() === cellDate.getMonth() && 
                                        projectDate.getFullYear() === cellDate.getFullYear()
                                      )
                                    );
                                    setSelectedDayEvents({ date: cellDate, events: dayEvents });
                                    setShowDayModal(true);
                                  } else {
                                    // Show schedule form
                                    setSelectedDate(cellDate);
                                    setEventForm({ title: '', description: '', startDate: cellDate.toISOString().split('T')[0], endDate: cellDate.toISOString().split('T')[0], allDay: true });
                                    setShowScheduleForm(true);
                                  }
                                }
                              }}
                            >
                              <Text fontSize="0.9rem" fontWeight={isToday ? 'bold' : 'normal'}>
                                {dayNum > 0 && dayNum <= 31 ? dayNum : ''}
                              </Text>
                              {hasProject && dayNum > 0 && dayNum <= 31 && (
                                <View
                                  style={{
                                    position: 'absolute',
                                    top: '5px',
                                    right: '5px',
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: '#4caf50',
                                    cursor: 'pointer'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const dayEvents = calendarEvents.filter(event => 
                                      event.projectDates && event.projectDates.some(projectDate => 
                                        projectDate.getMonth() === cellDate.getMonth() && 
                                        projectDate.getFullYear() === cellDate.getFullYear()
                                      )
                                    );
                                    setSelectedDayEvents({ date: cellDate, events: dayEvents });
                                    setShowDayModal(true);
                                  }}
                                />
                              )}
                              {hasScheduledEvent && dayNum > 0 && dayNum <= 31 && (
                                <View
                                  style={{
                                    position: 'absolute',
                                    top: hasProject ? '18px' : '5px',
                                    right: '5px',
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: '#2196f3',
                                    cursor: 'pointer'
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const dayEvents = scheduledEvents.filter(event => {
                                      const eventStart = new Date(event.startDate + 'T00:00:00');
                                      const eventEnd = new Date(event.endDate + 'T00:00:00');
                                      const cellDateOnly = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
                                      return cellDateOnly >= eventStart && cellDateOnly <= eventEnd;
                                    });
                                    const dayEvent = dayEvents[0]; // Get first event for that date
                                    if (dayEvent) {
                                      setEditingEvent(dayEvent);
                                      setEventForm({ title: dayEvent.title, description: dayEvent.description, startDate: dayEvent.startDate, endDate: dayEvent.endDate, allDay: dayEvent.allDay });
                                      setSelectedDate(cellDate);
                                      setShowScheduleForm(true);
                                    }
                                  }}
                                />
                              )}
                            </Card>
                          );
                        })}
                      </Flex>
                    ))}
                  </Flex>
                </Card>

              </Flex>
            </Card>
          </Flex>
        </View>
      )}
      
      {/* Day Details Modal */}
      {showDayModal && selectedDayEvents && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1001 }}
          onClick={() => setShowDayModal(false)}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            height="100%"
            padding="2rem"
          >
            <Card
              maxWidth="500px"
              maxHeight="600px"
              width="100%"
              onClick={(e) => e.stopPropagation()}
            >
              <Flex direction="column" gap="1rem" padding="1rem">
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading level={4}>
                    {selectedDayEvents.date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Heading>
                  <Button 
                    onClick={() => setShowDayModal(false)}
                    backgroundColor="white"
                    color="black"
                    border="1px solid black"
                    size="small"
                  >
                    Close
                  </Button>
                </Flex>
                
                <Divider />
                
                {selectedDayEvents.events.map((event, index) => {
                  return (
                    <Card key={index} variation="outlined" padding="1rem">
                      <Flex direction="column" gap="0.5rem">
                        <Text fontWeight="bold" fontSize="1.1rem">{event.title}</Text>
                        <Text fontSize="0.9rem" color="gray">Research Project</Text>
                        <Text fontSize="0.9rem">{event.description}</Text>
                        <Text fontSize="0.9rem">Faculty: {event.facultyName}</Text>
                        <Text fontSize="0.8rem" color="gray">Duration: Active during this period</Text>
                        <Flex gap="0.5rem">
                          <Button 
                            onClick={() => {
                              setShowDayModal(false);
                              navigate('/messages');
                            }}
                            backgroundColor="white"
                            color="black"
                            border="1px solid black"
                            size="small"
                          >
                            Message Faculty
                          </Button>
                          <Button 
                            onClick={() => {
                              setSelectedDate(selectedDayEvents.date);
                              setEventForm({ title: '', description: '', startDate: selectedDayEvents.date.toISOString().split('T')[0], endDate: selectedDayEvents.date.toISOString().split('T')[0], allDay: true });
                              setShowDayModal(false);
                              setShowScheduleForm(true);
                            }}
                            backgroundColor="white"
                            color="black"
                            border="1px solid black"
                            size="small"
                          >
                            Schedule Research Opportunity
                          </Button>
                        </Flex>
                      </Flex>
                    </Card>
                  );
                })}

              </Flex>
            </Card>
          </Flex>
        </View>
      )}
      
      {/* Schedule Research Opportunity Modal */}
      {showScheduleForm && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1002 }}
          onClick={() => setShowScheduleForm(false)}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            height="100%"
            padding="2rem"
          >
            <Card
              maxWidth="500px"
              maxHeight="600px"
              width="100%"
              onClick={(e) => e.stopPropagation()}
            >
              <Flex direction="column" gap="1rem" padding="1rem">
                <Heading level={4}>Schedule Research Opportunity</Heading>
                
                <Text fontSize="0.9rem" color="gray" marginBottom="1rem">
                  Plan your research opportunities and academic commitments for {selectedDate?.toLocaleDateString()}
                </Text>
                
                <Flex direction="column" gap="1rem">
                  <TextField
                    label="Event Title"
                    value={eventForm.title}
                    onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                  <Flex direction="row" alignItems="center" gap="1rem">
                    <Text>All Day</Text>
                    <input
                      type="checkbox"
                      checked={eventForm.allDay}
                      onChange={(e) => {
                        const isAllDay = e.target.checked;
                        setEventForm(prev => ({ 
                          ...prev, 
                          allDay: isAllDay,
                          endDate: isAllDay ? prev.startDate : prev.endDate
                        }));
                      }}
                    />
                  </Flex>
                  <Flex direction="row" gap="1rem">
                    <TextField
                      label="Start Date"
                      type="date"
                      flex="1"
                      value={eventForm.startDate}
                      onChange={(e) => {
                        const newStartDate = e.target.value;
                        setEventForm(prev => ({ 
                          ...prev, 
                          startDate: newStartDate,
                          endDate: prev.allDay ? newStartDate : prev.endDate
                        }));
                      }}
                    />
                    {!eventForm.allDay && (
                      <TextField
                        label="End Date"
                        type="date"
                        flex="1"
                        value={eventForm.endDate}
                        onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    )}
                  </Flex>
                  <TextField
                    label="Description"
                    value={eventForm.description}
                    onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                  
                  <Flex gap="0.5rem" justifyContent="flex-end">
                    <Button 
                      backgroundColor="white"
                      color="black"
                      border="1px solid black"
                      size="small"
                      onClick={() => {
                        const newEvent = {
                          id: editingEvent?.id || Date.now(),
                          startDate: eventForm.startDate,
                          endDate: eventForm.endDate || eventForm.startDate,
                          allDay: eventForm.allDay,
                          title: eventForm.title,
                          description: eventForm.description
                        };
                        
                        const userId = user?.id || user?.username || user?.email;
                        if (editingEvent) {
                          const updatedEvents = scheduledEvents.map(e => e.id === editingEvent.id ? newEvent : e);
                          setScheduledEvents(updatedEvents);
                          localStorage.setItem(`scheduledEvents_${userId}`, JSON.stringify(updatedEvents));
                        } else {
                          const updatedEvents = [...scheduledEvents, newEvent];
                          setScheduledEvents(updatedEvents);
                          localStorage.setItem(`scheduledEvents_${userId}`, JSON.stringify(updatedEvents));
                        }
                        
                        setEventForm({ title: '', description: '', startDate: '', endDate: '', allDay: true });
                        setEditingEvent(null);
                        setShowScheduleForm(false);
                        
                        // Force re-render to update calendar dots
                        setTimeout(() => {
                          // This ensures the calendar re-renders with updated events
                        }, 0);
                      }}
                    >
                      {editingEvent ? 'Update Event' : 'Add to Calendar'}
                    </Button>
                    <Button 
                      onClick={() => setShowScheduleForm(false)}
                      backgroundColor="white"
                      color="black"
                      border="1px solid black"
                      size="small"
                    >
                      Close
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </View>
      )}
      
      {/* Project Edit Modal */}
      {showProjectEditModal && editingProject && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1003 }}
          onClick={() => setShowProjectEditModal(false)}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            height="100%"
            padding="2rem"
          >
            <Card
              maxWidth="500px"
              maxHeight="600px"
              width="100%"
              onClick={(e) => e.stopPropagation()}
            >
              <Flex direction="column" gap="1rem" padding="1rem">
                <Heading level={4}>Research Project Details</Heading>
                
                <Flex direction="column" gap="1rem">
                  <TextField
                    label="Project Title"
                    value={editingProject.title}
                    isReadOnly
                  />
                  <TextField
                    label="Faculty"
                    value={editingProject.facultyName || 'Faculty'}
                    isReadOnly
                  />
                  <TextField
                    label="Application Deadline"
                    value={editingProject.date}
                    isReadOnly
                  />
                  <TextField
                    label="Description"
                    value={editingProject.description || 'No description available'}
                    isReadOnly
                  />
                  
                  <Flex gap="0.5rem" justifyContent="flex-end">
                    <Button 
                      onClick={() => setShowProjectEditModal(false)}
                      backgroundColor="white"
                      color="black"
                      border="1px solid black"
                      size="small"
                    >
                      Close
                    </Button>
                  </Flex>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </View>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1004 }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            height="100%"
            padding="2rem"
          >
            <Card
              maxWidth="450px"
              width="100%"
              variation="outlined"
              onClick={(e) => e.stopPropagation()}
            >
              <Flex direction="column" gap="0.5rem" padding="0.75rem">
                <Heading level={4}>Confirm Delete</Heading>
                <Text>Are you sure you want to delete this item?</Text>
                
                <Flex gap="0.5rem" justifyContent="flex-end">
                  <Button 
                    onClick={() => setShowDeleteConfirm(false)}
                    backgroundColor="white"
                    color="black"
                    border="1px solid black"
                    size="small"
                  >
                    No
                  </Button>
                  <Button 
                    onClick={() => {
                      if (deleteAction) {
                        deleteAction();
                      }
                      setShowDeleteConfirm(false);
                      setDeleteAction(null);
                    }}
                    backgroundColor="white"
                    color="black"
                    border="1px solid black"
                    size="small"
                  >
                    Yes
                  </Button>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </View>
      )}
    </Flex>
  );
};

export default ProfilePage;
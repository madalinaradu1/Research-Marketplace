import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { Flex, Heading, Card, TextField, Button, Text, View, Divider } from '@aws-amplify/ui-react';
import { updateUser, listApplications, listProjects } from '../graphql/operations';
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
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

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
      
      console.log('Sending update input:', input);

      // Update user in DynamoDB
      const result = await API.graphql(graphqlOperation(updateUser, { input }));
      console.log('Profile updated:', result.data.updateUser);
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
      console.error('Error updating profile:', err);
      setError('An error occurred while updating your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex direction="column" padding="2rem" gap="2rem">
      <Heading level={2}>My Profile</Heading>
      
      <Flex direction="row" gap="2rem">
        <Card flex="2">
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
        <Card flex="1" height="fit-content">
          <Flex direction="column" gap="1rem">
            <Heading level={4}>My Calendar</Heading>
            <Divider />
            
            {/* Mini Calendar View */}
            <Card variation="outlined" padding="1rem">
              <Text fontSize="0.9rem" textAlign="center" marginBottom="0.5rem">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              
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
                      const isToday = dayNum === today.getDate() && 
                                     new Date().getMonth() === today.getMonth() && 
                                     new Date().getFullYear() === today.getFullYear();
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
                        >
                          {dayNum > 0 && dayNum <= 31 ? dayNum : ''}
                        </Button>
                      );
                    })}
                  </Flex>
                ))}
              </Flex>
            </Card>
            
            {/* Upcoming Events */}
            <Card variation="outlined" padding="1rem">
              <Text fontWeight="bold" marginBottom="0.5rem">Upcoming Events</Text>
              {calendarEvents.length === 0 ? (
                <Text fontSize="0.9rem" color="gray">No research projects scheduled</Text>
              ) : (
                <Flex direction="column" gap="0.5rem">
                  {calendarEvents.slice(0, 3).map((event, index) => (
                    <Card key={index} variation="outlined" padding="0.5rem">
                      <Text fontSize="0.9rem" fontWeight="bold">{event.title}</Text>
                      <Text fontSize="0.8rem" color="gray">{event.date}</Text>
                    </Card>
                  ))}
                </Flex>
              )}
            </Card>
            
            <Button 
              backgroundColor="white"
              color="black"
              border="1px solid black"
              onClick={() => setShowCalendarModal(true)}
            >
              View Full Calendar
            </Button>
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
              maxHeight="80vh"
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
                      </Flex>
                    </Card>
                  );
                })}
                
                <Divider />
                
                {/* Schedule Research Opportunity Section */}
                <Card variation="outlined" padding="1rem">
                  <Heading level={5}>Schedule Research Opportunity</Heading>
                  <Text fontSize="0.9rem" color="gray" marginBottom="1rem">
                    Plan your research activities for {selectedDayEvents.date.toLocaleDateString()}
                  </Text>
                  
                  <Flex direction="column" gap="1rem">
                    <TextField
                      label="Event Title"
                      placeholder="e.g., Research Project Meeting"
                    />
                    <Flex direction="row" gap="1rem">
                      <TextField
                        label="Date"
                        type="date"
                        flex="1"
                        value={selectedDayEvents.date.toISOString().split('T')[0]}
                      />
                      <TextField
                        label="Time"
                        type="time"
                        flex="1"
                      />
                    </Flex>
                    <TextField
                      label="Description"
                      placeholder="Meeting details, location, etc."
                    />
                    
                    <Button 
                      backgroundColor="white"
                      color="black"
                      border="1px solid black"
                      size="small"
                    >
                      Add to Calendar
                    </Button>
                  </Flex>
                </Card>
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
              width="100%"
              onClick={(e) => e.stopPropagation()}
            >
              <Flex direction="column" gap="1rem" padding="1rem">
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading level={4}>Schedule Research Opportunity</Heading>
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
                
                <Text fontSize="0.9rem" color="gray" marginBottom="1rem">
                  Plan your research opportunities and academic commitments for {selectedDate?.toLocaleDateString()}
                </Text>
                
                <Flex direction="column" gap="1rem">
                  <TextField
                    label="Event Title"
                    placeholder="e.g., Research Project Meeting"
                  />
                  <Flex direction="row" gap="1rem">
                    <TextField
                      label="Date"
                      type="date"
                      flex="1"
                      value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                    />
                    <TextField
                      label="Time"
                      type="time"
                      flex="1"
                    />
                  </Flex>
                  <TextField
                    label="Description"
                    placeholder="Meeting details, location, etc."
                  />
                  
                  <Button 
                    backgroundColor="white"
                    color="black"
                    border="1px solid black"
                    onClick={() => setShowScheduleForm(false)}
                  >
                    Add to Calendar
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
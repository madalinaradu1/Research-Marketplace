import React, { useState } from 'react';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { 
  Flex, 
  Heading, 
  Text, 
  Button, 
  Badge, 
  Card, 
  Divider, 
  TextAreaField,
  TextField,
  useTheme,
  View,
  Collection
} from '@aws-amplify/ui-react';
import { updateApplication } from '../graphql/operations';
import EnhancedApplicationForm from './EnhancedApplicationForm';

const ApplicationStatus = ({ application, isStudent = true, onUpdate }) => {
  const [withdrawReason, setWithdrawReason] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const { tokens } = useTheme();
  
  // Get status color
  const getStatusColor = (status) => {
    if (!status) return tokens.colors.neutral[60];
    
    switch (status) {
      case 'Draft':
        return tokens.colors.neutral[60];
      case 'Faculty Review':
        return tokens.colors.blue[60];
      case 'Department Review':
        return tokens.colors.purple[60];
      case 'Admin Review':
        return tokens.colors.orange[60];
      case 'Approved':
        return tokens.colors.green[60];
      case 'Returned':
      case 'Rejected':
        return tokens.colors.red[60];
      case 'Cancelled':
        return tokens.colors.neutral[80];
      case 'Expired':
        return tokens.colors.neutral[40];
      default:
        return tokens.colors.neutral[60];
    }
  };
  
  // Handle submit to faculty
  const handleSubmitToFaculty = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const input = {
        id: application.id,
        status: 'Faculty Review',
        submittedToFacultyAt: new Date().toISOString()
      };
      
      await API.graphql(graphqlOperation(updateApplication, { input }));
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle withdraw application
  const handleWithdraw = async () => {
    if (!withdrawReason) {
      setError('Please provide a reason for withdrawing your application');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const input = {
        id: application.id,
        status: 'Cancelled',
        statusDetail: `Cancelled (${application.status})`,
        withdrawReason,
        cancelledAt: new Date().toISOString()
      };
      
      await API.graphql(graphqlOperation(updateApplication, { input }));
      setIsWithdrawing(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error withdrawing application:', err);
      setError('Failed to withdraw application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Download proposal file
  const downloadProposal = async () => {
    if (!application.proposalFileKey) return;
    
    try {
      const url = await Storage.get(application.proposalFileKey, { expires: 60 });
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error downloading proposal:', err);
      setError('Failed to download proposal. Please try again.');
    }
  };
  
  return (
    <Card>
      <Flex direction="column" gap="1rem">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading level={4}>{application.project?.title || 'Research Application'}</Heading>
          <Badge
            backgroundColor={getStatusColor(application.status)}
            color="white"
          >
            {application.status}
          </Badge>
        </Flex>
        
        {application.statusDetail && (
          <Text fontStyle="italic">{application.statusDetail}</Text>
        )}
        
        <Divider />
        
        <Flex direction="column" gap="0.5rem">
          <Text fontWeight="bold">Application Details</Text>
          <Text>Project: {application.project?.title || 'Unknown Project'}</Text>
          <Text>Department: {application.project?.department || 'Unknown Department'}</Text>
          <Text>Status: {application.status}</Text>
          {application.statusDetail && (
            <Text>Status Detail: {application.statusDetail}</Text>
          )}
          <Text>Submitted: {new Date(application.createdAt).toLocaleDateString()}</Text>
        </Flex>
        
        {application.relevantCourses && application.relevantCourses.length > 0 && (
          <>
            <Divider />
            <Flex direction="column" gap="0.5rem">
              <Text fontWeight="bold">Relevant Coursework</Text>
              {application.relevantCourses.map((course, index) => (
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
        
        {(application.facultyNotes || application.coordinatorNotes || application.adminNotes) && (
          <>
            <Divider />
            <Flex direction="column" gap="0.5rem">
              <Text fontWeight="bold">Review Notes</Text>
              {application.facultyNotes && (
                <Card backgroundColor="#fff3cd" padding="0.5rem">
                  <Text><strong>Faculty:</strong> {application.facultyNotes}</Text>
                </Card>
              )}
              {application.coordinatorNotes && (
                <Text><strong>Coordinator:</strong> {application.coordinatorNotes}</Text>
              )}
              {application.adminNotes && (
                <Text><strong>Admin:</strong> {application.adminNotes}</Text>
              )}
            </Flex>
          </>
        )}
        
        <Divider />
        
        <Flex direction="column" gap="0.5rem">
          <Text fontWeight="bold">Status Timeline</Text>
          <Text>Created: {new Date(application.createdAt).toLocaleString()}</Text>
          {application.updatedAt !== application.createdAt && (
            <Text>Last Updated: {new Date(application.updatedAt).toLocaleString()}</Text>
          )}
          {application.submittedToFacultyAt && (
            <Text>Submitted to Faculty: {new Date(application.submittedToFacultyAt).toLocaleString()}</Text>
          )}
          {application.approvedAt && (
            <Text>Approved: {new Date(application.approvedAt).toLocaleString()}</Text>
          )}
          {application.returnedAt && (
            <Text>Returned: {new Date(application.returnedAt).toLocaleString()}</Text>
          )}
          {application.cancelledAt && (
            <Text>Cancelled: {new Date(application.cancelledAt).toLocaleString()}</Text>
          )}
        </Flex>
        
        {application.proposalFileKey && (
          <Button onClick={downloadProposal}>Download Proposal</Button>
        )}
        
        {isStudent && application.status === 'Draft' && (
          <Button 
            onClick={handleSubmitToFaculty}
            variation="primary"
            isLoading={isSubmitting}
            width="auto"
          >
            Submit to Faculty
          </Button>
        )}
        
        {isStudent && application.status === 'Returned' && (
          <Card variation="outlined" backgroundColor="#fff3cd" padding="1rem">
            <Flex direction="column" gap="1rem">
              <Heading level={5} color="#856404">⚠️ Application Returned for Revision</Heading>
              
              <Text fontSize="0.9rem" color="#856404" fontStyle="italic">
                📝 Please review the feedback in the Review Notes section and make the necessary changes to your application before resubmitting.
              </Text>
              
              <Button 
                variation="primary"
                onClick={() => setIsEditing(true)}
                size="large"
              >
                Edit & Resubmit Application
              </Button>
            </Flex>
          </Card>
        )}
        
        {isStudent && application.status !== 'Cancelled' && application.status !== 'Expired' && application.status !== 'Draft' && (
          <View>
            {isWithdrawing ? (
              <Card variation="outlined">
                <Flex direction="column" gap="1rem">
                  <Text fontWeight="bold">Withdraw Application</Text>
                  <TextAreaField
                    label="Reason for withdrawing"
                    value={withdrawReason}
                    onChange={(e) => setWithdrawReason(e.target.value)}
                    placeholder="Please provide a reason for withdrawing your application"
                    required
                  />
                  
                  {error && <Text color="red">{error}</Text>}
                  
                  <Flex gap="1rem">
                    <Button 
                      onClick={() => setIsWithdrawing(false)}
                      variation="link"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleWithdraw}
                      variation="destructive"
                      isLoading={isSubmitting}
                    >
                      Confirm Withdrawal
                    </Button>
                  </Flex>
                </Flex>
              </Card>
            ) : (
              <Button 
                onClick={() => setIsWithdrawing(true)}
                variation="destructive"
              >
                Withdraw Application
              </Button>
            )}
          </View>
        )}
        
        {/* Edit Application Overlay */}
        {isEditing && (
          <View
            position="fixed"
            top="0"
            left="0"
            width="100vw"
            height="100vh"
            backgroundColor="rgba(0, 0, 0, 0.5)"
            style={{ zIndex: 1000 }}
            onClick={() => setIsEditing(false)}
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
                <EditApplicationForm 
                  application={application}
                  onClose={() => setIsEditing(false)}
                  onSuccess={() => {
                    setIsEditing(false);
                    if (onUpdate) onUpdate();
                  }}
                />
              </Card>
            </Flex>
          </View>
        )}
      </Flex>
    </Card>
  );
};

// Component for editing returned applications
const EditApplicationForm = ({ application, onClose, onSuccess }) => {
  const [statement, setStatement] = useState(application.statement || '');
  const [courses, setCourses] = useState(() => {
    // Ensure we always have the existing courses pre-filled
    if (application.relevantCourses && application.relevantCourses.length > 0) {
      return [...application.relevantCourses];
    }
    return [{ courseName: '', courseNumber: '', grade: '', semester: '', year: '' }];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const addCourse = () => {
    if (courses.length < 10) {
      setCourses([...courses, { courseName: '', courseNumber: '', grade: '', semester: '', year: '' }]);
    }
  };

  const removeCourse = (index) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const updateCourse = (index, field, value) => {
    const updatedCourses = courses.map((course, i) => 
      i === index ? { ...course, [field]: value } : course
    );
    setCourses(updatedCourses);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const wordCount = statement.trim().split(/\s+/).length;
      if (wordCount < 300) {
        setError('Your statement should be at least 300 words. Current count: ' + wordCount);
        return;
      }

      const validCourses = courses.filter(course => course.courseName.trim());

      const input = {
        id: application.id,
        statement,
        relevantCourses: validCourses,
        status: 'Faculty Review',
        submittedToFacultyAt: new Date().toISOString()
      };

      await API.graphql(graphqlOperation(updateApplication, { input }));
      onSuccess();
    } catch (err) {
      console.error('Error updating application:', err);
      setError('Failed to update application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex direction="column" gap="1rem">
      <Heading level={3}>Edit Application: {application.project?.title}</Heading>
      
      {application.facultyNotes && (
        <Card variation="outlined" backgroundColor="#fff3cd" padding="1rem" marginBottom="1rem">
          <Heading level={5} color="#856404" marginBottom="0.5rem">📋 Faculty Feedback</Heading>
          <Card backgroundColor="white" padding="1rem" borderRadius="8px">
            <Text color="#333" lineHeight="1.5" whiteSpace="pre-wrap">
              {application.facultyNotes}
            </Text>
          </Card>
          <Text fontSize="0.8rem" color="#856404" marginTop="0.5rem" fontStyle="italic">
            Please address the points mentioned above in your revised application.
          </Text>
        </Card>
      )}
      
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="1rem">
          <TextAreaField
            label="Statement of Interest *"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            rows={10}
            required
          />
          <Text fontSize="0.9rem" color="gray">
            Word count: {statement.trim().split(/\s+/).filter(word => word).length} (aim for ~450 words)
          </Text>

          <Divider />

          <Heading level={4}>Relevant Coursework</Heading>
          {courses.map((course, index) => (
            <Card key={index} variation="outlined">
              <Flex direction="column" gap="0.5rem">
                <Flex justifyContent="space-between" alignItems="center">
                  <Text fontWeight="bold">Course {index + 1}</Text>
                  {courses.length > 1 && (
                    <Button size="small" onClick={() => removeCourse(index)}>
                      Remove
                    </Button>
                  )}
                </Flex>
                
                <Flex direction={{ base: 'column', large: 'row' }} gap="0.5rem">
                  <TextField
                    label="Course Name"
                    value={course.courseName}
                    onChange={(e) => updateCourse(index, 'courseName', e.target.value)}
                    flex="2"
                  />
                  <TextField
                    label="Course Number"
                    value={course.courseNumber}
                    onChange={(e) => updateCourse(index, 'courseNumber', e.target.value)}
                    flex="1"
                  />
                  <TextField
                    label="Grade"
                    value={course.grade}
                    onChange={(e) => updateCourse(index, 'grade', e.target.value)}
                    flex="1"
                  />
                </Flex>
              </Flex>
            </Card>
          ))}

          {courses.length < 10 && (
            <Button onClick={addCourse} variation="link">
              + Add Course
            </Button>
          )}

          {error && <Text color="red">{error}</Text>}

          <Flex gap="1rem">
            <Button onClick={onClose} variation="link">
              Cancel
            </Button>
            <Button type="submit" variation="primary" isLoading={isSubmitting}>
              Resubmit Application
            </Button>
          </Flex>
        </Flex>
      </form>
    </Flex>
  );
};

export default ApplicationStatus;
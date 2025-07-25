import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { Flex, Heading, Card, TextField, Button, Text } from '@aws-amplify/ui-react';
import { updateUser } from '../graphql/operations';

const ProfilePage = ({ user, refreshProfile }) => {
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

  // Initialize form with user data when it becomes available
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
    }
  }, [user]);

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
      
      <Card>
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
            
            <Button 
              type="submit" 
              variation="primary"
              isLoading={isSubmitting}
              loadingText="Saving..."
            >
              Save Changes
            </Button>
          </Flex>
        </form>
      </Card>
    </Flex>
  );
};

export default ProfilePage;
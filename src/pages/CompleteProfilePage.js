import React, { useState } from 'react';
import { API, graphqlOperation, Auth } from 'aws-amplify';
import { 
  Flex, 
  Heading, 
  TextField, 
  SelectField, 
  Button, 
  Card,
  Text,
  TextAreaField,
  useTheme
} from '@aws-amplify/ui-react';
import { createUser, updateUser } from '../graphql/operations';
import { useNavigate } from 'react-router-dom';

const CompleteProfilePage = ({ user }) => {
  const navigate = useNavigate();
  const { tokens } = useTheme();
  const [formState, setFormState] = useState({
    name: user?.name || '',
    currentProgram: user?.major || '',
    degreeType: user?.academicYear || '',
    expectedGraduation: user?.expectedGraduation || '',
    gpa: user?.gpa || '',
    researchInterests: user?.researchInterests?.join(', ') || '',
    skillsExperience: user?.skills?.join(', ') || '',
    availability: user?.availability || '',
    personalStatement: user?.personalStatement || '',
    facultyRecommendations: '',
    certificates: user?.certificates?.join(', ') || '',
    role: user?.role || 'Student'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Get current authenticated user
      const currentUser = await Auth.currentAuthenticatedUser();
      
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
      
      // Prepare input for user mutation
      const input = {
        id: currentUser.username,
        name: formState.name,
        email: currentUser.attributes.email,
        major: formState.currentProgram,
        academicYear: formState.degreeType,
        expectedGraduation: formState.expectedGraduation,
        gpa: formState.gpa ? parseFloat(formState.gpa) : null,
        researchInterests,
        skills,
        availability: formState.availability,
        personalStatement: formState.personalStatement,
        certificates,
        role: formState.role,
        profileComplete: true
      };

      try {
        // Try to update the user first
        await API.graphql(graphqlOperation(updateUser, { input }));
      } catch (updateError) {
        console.log('Update failed, trying to create user:', updateError);
        // If update fails, try to create the user
        await API.graphql(graphqlOperation(createUser, { input }));
      }
      
      // Force refresh of user profile and redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError('An error occurred while updating your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex direction="column" padding="2rem" gap="2rem">
      <Heading level={2}>Complete Your Profile</Heading>
      <Text>Please provide some additional information to complete your profile.</Text>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="1rem">
            <TextField
              name="name"
              label="Full Name"
              placeholder="Enter your full name"
              value={formState.name}
              onChange={handleChange}
              required
            />
            
            <TextField
              name="role"
              label="Role"
              value={formState.role}
              isReadOnly
            />
            
            {formState.role === 'Student' && (
              <>
                <TextField
                  name="studentId"
                  label="Student ID"
                  value={user?.id || user?.username || ''}
                  isReadOnly
                />
                
                <TextField
                  name="currentProgram"
                  label="Current Academic Program *"
                  placeholder="e.g., Computer Science, Biology"
                  value={formState.currentProgram}
                  onChange={handleChange}
                  required
                />
                
                <TextField
                  name="degreeType"
                  label="Degree Pursued *"
                  placeholder="e.g., Bachelor's, Master's, PhD"
                  value={formState.degreeType}
                  onChange={handleChange}
                  required
                />
                
                <TextField
                  name="expectedGraduation"
                  label="Expected Graduation Date *"
                  placeholder="e.g., Spring 2025"
                  value={formState.expectedGraduation}
                  onChange={handleChange}
                  required
                />
                
                <TextField
                  name="gpa"
                  label="GPA *"
                  placeholder="Enter your GPA (0.0 - 4.0)"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={formState.gpa || ''}
                  onChange={handleChange}
                  required
                />
                
                <TextField
                  name="researchInterests"
                  label="Research Interests *"
                  placeholder="Enter research interests separated by commas"
                  value={formState.researchInterests}
                  onChange={handleChange}
                  required
                />
                
                <TextField
                  name="skillsExperience"
                  label="Skills and Experience *"
                  placeholder="Enter skills and experience separated by commas"
                  value={formState.skillsExperience}
                  onChange={handleChange}
                  required
                />
                
                <TextField
                  name="availability"
                  label="Availability *"
                  placeholder="e.g., Fall 2024, Spring 2025"
                  value={formState.availability}
                  onChange={handleChange}
                  required
                />
                
                <TextAreaField
                  name="personalStatement"
                  label="Personal Statement *"
                  placeholder="Brief description of your motivation for research and goals"
                  value={formState.personalStatement}
                  onChange={handleChange}
                  rows={4}
                  required
                />
                
                <TextAreaField
                  name="facultyRecommendations"
                  label="Faculty Recommendations (Optional)"
                  placeholder="Non-sensitive recommendations or endorsements from faculty"
                  value={formState.facultyRecommendations}
                  onChange={handleChange}
                  rows={3}
                />
                
                <TextField
                  name="certificates"
                  label="Certificates (Optional)"
                  placeholder="Enter certificates separated by commas"
                  value={formState.certificates}
                  onChange={handleChange}
                />
              </>
            )}
            
            {error && (
              <Text color={tokens.colors.red[60]}>{error}</Text>
            )}
            
            <Button
              type="submit"
              variation="primary"
              isLoading={isSubmitting}
              loadingText="Saving..."
            >
              Save Profile
            </Button>
          </Flex>
        </form>
      </Card>
    </Flex>
  );
};

export default CompleteProfilePage;
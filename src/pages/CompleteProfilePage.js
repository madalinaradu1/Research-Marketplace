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
  useTheme
} from '@aws-amplify/ui-react';
import { createUser, updateUser } from '../graphql/operations';
import { useNavigate } from 'react-router-dom';

const CompleteProfilePage = ({ user }) => {
  const navigate = useNavigate();
  const { tokens } = useTheme();
  const [formState, setFormState] = useState({
    name: user?.name || '',
    major: user?.major || '',
    gpa: user?.gpa || '',
    affiliation: user?.affiliation || 'On-campus',
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
      
      // Convert GPA to float
      const gpa = formState.gpa ? parseFloat(formState.gpa) : null;
      
      // Prepare input for user mutation
      const input = {
        id: currentUser.username,
        name: formState.name,
        email: currentUser.attributes.email,
        major: formState.major,
        gpa,
        affiliation: formState.affiliation,
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
      
      // Redirect to dashboard
      navigate('/dashboard');
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
            
            <SelectField
              name="role"
              label="Role"
              value={formState.role}
              onChange={handleChange}
              required
            >
              <option value="Student">Student</option>
              <option value="Faculty">Faculty</option>
            </SelectField>
            
            {formState.role === 'Student' && (
              <>
                <TextField
                  name="major"
                  label="Major"
                  placeholder="Enter your major"
                  value={formState.major}
                  onChange={handleChange}
                />
                
                <TextField
                  name="gpa"
                  label="GPA"
                  placeholder="Enter your GPA"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4.0"
                  value={formState.gpa}
                  onChange={handleChange}
                />
                
                <SelectField
                  name="affiliation"
                  label="Affiliation"
                  value={formState.affiliation}
                  onChange={handleChange}
                >
                  <option value="On-campus">On-campus</option>
                  <option value="Off-campus">Off-campus</option>
                </SelectField>
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
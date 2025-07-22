import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { Flex, Heading, Card, TextField, Button, Text, SelectField } from '@aws-amplify/ui-react';
import { updateUser } from '../graphql/operations';

const ProfilePage = ({ user, refreshProfile }) => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    major: '',
    academicYear: '',
    gpa: '',
    affiliation: 'On-campus',
    department: ''
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
        major: user.major || '',
        academicYear: user.academicYear || '',
        gpa: user.gpa?.toString() || '',
        affiliation: user.affiliation || 'On-campus',
        department: user.department || ''
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
      // Convert GPA to float if provided
      const gpa = formState.gpa ? parseFloat(formState.gpa) : null;
      
      // Prepare input for updateUser mutation
      const input = {
        id: user.id || user.username,
        name: formState.name,
        major: formState.major,
        academicYear: formState.academicYear,
        gpa,
        affiliation: formState.affiliation,
        department: formState.department,
        profileComplete: true
      };

      // Update user in DynamoDB
      const result = await API.graphql(graphqlOperation(updateUser, { input }));
      console.log('Profile updated:', result.data.updateUser);
      setMessage('Profile updated successfully!');
      
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
              name="name"
              label="Name"
              placeholder="Your full name"
              value={formState.name}
              onChange={handleChange}
              required
            />
            
            <TextField
              name="email"
              label="Email"
              placeholder="Your email address"
              value={formState.email}
              onChange={handleChange}
              required
              isReadOnly
            />
            
            {user?.role === 'Faculty' && (
              <TextField
                name="department"
                label="Department"
                placeholder="Your department"
                value={formState.department}
                onChange={handleChange}
              />
            )}
            
            {user?.role === 'Student' && (
              <>
                <TextField
                  name="major"
                  label="Major"
                  placeholder="Your major"
                  value={formState.major}
                  onChange={handleChange}
                />
                
                <TextField
                  name="academicYear"
                  label="Academic Year"
                  placeholder="Your academic year"
                  value={formState.academicYear}
                  onChange={handleChange}
                />
                
                <TextField
                  name="gpa"
                  label="GPA"
                  placeholder="Your GPA"
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
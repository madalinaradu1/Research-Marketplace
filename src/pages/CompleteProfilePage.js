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
    studentId: user?.studentId || '',
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
  const [success, setSuccess] = useState(false);
  const [gpaError, setGpaError] = useState('');
  const [graduationError, setGraduationError] = useState('');
  const [studentIdError, setStudentIdError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'gpa') {
      const gpaValue = parseFloat(value);
      if (value && (gpaValue < 1.0 || gpaValue > 4.0)) {
        setGpaError('GPA must be between 1.0 and 4.0');
      } else {
        setGpaError('');
      }
    }
    if (name === 'expectedGraduation') {
      if (value) {
        const selectedDate = new Date(value + '-01');
        const today = new Date();
        today.setDate(1);
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          setGraduationError('Expected graduation date must be in the future');
        } else {
          setGraduationError('');
        }
      } else {
        setGraduationError('');
      }
    }
    if (name === 'studentId') {
      const alphanumericRegex = /^[a-zA-Z0-9]*$/;
      if (!alphanumericRegex.test(value)) {
        setStudentIdError('Student ID must be alphanumeric only (no spaces)');
      } else if (value.length > 0 && value.length < 5) {
        setStudentIdError('Student ID must be at least 5 characters');
      } else if (value.length > 20) {
        setStudentIdError('Student ID must not exceed 20 characters');
      } else {
        setStudentIdError('');
      }
    }
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const alphanumericRegex = /^[a-zA-Z0-9]*$/;
    if (!formState.studentId || formState.studentId.length < 5 || formState.studentId.length > 20 || !alphanumericRegex.test(formState.studentId)) {
      setError('Please enter a valid Student ID (5-20 alphanumeric characters, no spaces)');
      setIsSubmitting(false);
      return;
    }

    const gpaValue = parseFloat(formState.gpa);
    if (formState.gpa && (gpaValue < 1.0 || gpaValue > 4.0)) {
      setError('GPA must be between 1.0 and 4.0');
      setIsSubmitting(false);
      return;
    }

    if (formState.expectedGraduation) {
      const selectedDate = new Date(formState.expectedGraduation + '-01');
      const today = new Date();
      today.setDate(1);
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setError('Expected graduation date must be in the future');
        setIsSubmitting(false);
        return;
      }
    }

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
      
      // Prepare input for user mutation (only include fields that exist in UpdateUserInput)
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

      // Update the existing user profile
      await API.graphql(graphqlOperation(updateUser, { input }));
      
      setSuccess(true);
      
      // Force refresh of user profile and redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err) {
      console.error('Error updating user profile:', err);
      
      let errorMessage = 'An error occurred while updating your profile. Please try again.';
      
      if (err.errors && err.errors.length > 0) {
        errorMessage = err.errors[0].message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      if (err.response) {
        const status = err.response.status;
        if (status === 401 || status === 403) {
          errorMessage = 'Your session expired. Please sign in again.';
        } else if (status === 500) {
          errorMessage = 'Server error while saving. Try again.';
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      
      setError(errorMessage);
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
                <Flex direction="column" gap="0.25rem">
                  <TextField
                    name="studentId"
                    label="Student ID *"
                    placeholder="Enter your university-issued student ID"
                    value={formState.studentId}
                    onChange={handleChange}
                    required
                    hasError={!!studentIdError}
                    descriptiveText="Enter your university-issued student ID"
                    maxLength={20}
                  />
                  {studentIdError && <Text color={tokens.colors.red[60]} fontSize="0.875rem">{studentIdError}</Text>}
                </Flex>
                
                <Heading level={5} marginTop="1rem" marginBottom="0.5rem">Academic Information</Heading>
                
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
                
                <Flex direction="column" gap="0.25rem">
                  <TextField
                    name="gpa"
                    label="GPA *"
                    placeholder="Enter your GPA (1.0 - 4.0)"
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="4.0"
                    value={formState.gpa || ''}
                    onChange={handleChange}
                    required
                    hasError={!!gpaError}
                    descriptiveText="GPA must be between 1.0 and 4.0"
                  />
                  {gpaError && <Text color={tokens.colors.red[60]} fontSize="0.875rem">{gpaError}</Text>}
                </Flex>
                
                <Flex direction="column" gap="0.25rem">
                  <TextField
                    name="expectedGraduation"
                    label="Expected Graduation Date *"
                    type="month"
                    value={formState.expectedGraduation}
                    onChange={handleChange}
                    required
                    hasError={!!graduationError}
                  />
                  {graduationError && <Text color={tokens.colors.red[60]} fontSize="0.875rem">{graduationError}</Text>}
                </Flex>
                
                <Heading level={5} marginTop="1rem" marginBottom="0.5rem">Research Profile</Heading>
                
                <TextField
                  name="researchInterests"
                  label="Research Interests *"
                  placeholder="e.g., Machine Learning, Molecular Biology, Environmental Science"
                  value={formState.researchInterests}
                  onChange={handleChange}
                  required
                />
                
                <TextField
                  name="availability"
                  label="Availability *"
                  placeholder="e.g., Fall 2024, Spring 2025, 10-15 hours per week"
                  value={formState.availability}
                  onChange={handleChange}
                  required
                />
                
                <TextAreaField
                  name="personalStatement"
                  label="Personal Statement *"
                  placeholder="Describe your motivation for research, academic goals, and what you hope to achieve through undergraduate research opportunities. Include any relevant coursework or experiences."
                  value={formState.personalStatement}
                  onChange={handleChange}
                  rows={5}
                  required
                />
                
                <Heading level={5} marginTop="1rem" marginBottom="0.5rem">Additional Information (Optional)</Heading>
                
                <TextField
                  name="skillsExperience"
                  label="Skills and Experience (Optional)"
                  placeholder="e.g., Python, R, Lab Techniques, Data Analysis"
                  value={formState.skillsExperience}
                  onChange={handleChange}
                />
                
                <TextAreaField
                  name="facultyRecommendations"
                  label="Faculty Recommendations (Optional)"
                  placeholder="List any faculty members who can speak to your academic abilities and research potential."
                  value={formState.facultyRecommendations}
                  onChange={handleChange}
                  rows={4}
                />
                
                <TextField
                  name="certificates"
                  label="Certificates (Optional)"
                  placeholder="e.g., CITI Training, IRB Certification, Safety Training"
                  value={formState.certificates}
                  onChange={handleChange}
                />
              </>
            )}
            
            {success && (
              <Text color={tokens.colors.green[60]} fontWeight="bold">Profile saved successfully! Redirecting...</Text>
            )}
            
            {error && (
              <Text color={tokens.colors.red[60]}>{error}</Text>
            )}
            
            <Button
              type="submit"
              variation="primary"
              isLoading={isSubmitting}
              loadingText="Saving..."
              isDisabled={!!gpaError || !!graduationError || !!studentIdError}
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
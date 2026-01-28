import React, { useState, useCallback } from 'react';
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

const TagInput = ({ label, tags, input, setInput, onKeyDown, onRemove, placeholder, required }) => (
  <Flex direction="column" gap="0.5rem">
    <Text fontWeight="bold">{label} {required && '*'}</Text>
    {tags.length > 0 && (
      <Flex wrap="wrap" gap="0.5rem" marginBottom="0.5rem">
        {tags.map((tag, index) => (
          <Flex
            key={index}
            alignItems="center"
            gap="0.5rem"
            padding="0.25rem 0.75rem"
            backgroundColor="#E6D4F5"
            borderRadius="20px"
          >
            <Text fontSize="0.9rem">{tag}</Text>
            <Button
              size="small"
              variation="link"
              onClick={() => onRemove(tag)}
              style={{ padding: '0', minWidth: 'auto', color: '#000', backgroundColor: '#E6D4F5', border: 'none' }}
            >
              ×
            </Button>
          </Flex>
        ))}
      </Flex>
    )}
    <TextField
      placeholder={placeholder}
      value={input}
      onChange={(e) => setInput(e.target.value)}
      onKeyDown={onKeyDown}
    />
  </Flex>
);

const CompleteProfilePage = ({ user }) => {
  const navigate = useNavigate();
  const { tokens } = useTheme();
  
  // Form state for text fields
  const [formState, setFormState] = useState({
    name: user?.name || '',
    currentProgram: user?.major || '',
    degreeType: user?.academicYear || '',
    expectedGraduation: user?.expectedGraduation || '',
    gpa: user?.gpa || '',
    availability: user?.availability || '',
    personalStatement: user?.personalStatement || '',
    facultyRecommendations: '',
    role: user?.role || 'Student',
    // Faculty-specific fields
    college: user?.college || ''
  });
  
  const [researchInterestTags, setResearchInterestTags] = useState(user?.researchInterests || []);
  const [researchInterestInput, setResearchInterestInput] = useState('');
  const [skillsTags, setSkillsTags] = useState(user?.skills || []);
  const [skillsInput, setSkillsInput] = useState('');
  const [certificateTags, setCertificateTags] = useState(user?.certificates || []);
  const [certificateInput, setCertificateInput] = useState('');
  const [classesTaughtTags, setClassesTaughtTags] = useState(user?.classesTaught || []);
  const [classesTaughtInput, setClassesTaughtInput] = useState('');
  const [facultyResearchTags, setFacultyResearchTags] = useState(user?.facultyResearchInterests || []);
  const [facultyResearchInput, setFacultyResearchInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const createTagHandlers = useCallback((input, tags, setTags, setInput) => ({
    onKeyDown: (e) => {
      if (e.key === 'Enter' && input.trim()) {
        e.preventDefault();
        if (!tags.includes(input.trim())) {
          setTags([...tags, input.trim()]);
        }
        setInput('');
      }
    },
    onRemove: (tag) => setTags(tags.filter(item => item !== tag))
  }), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Get current authenticated user
      const currentUser = await Auth.currentAuthenticatedUser();
      
      // Convert arrays
      const researchInterests = researchInterestTags;
      const skills = skillsTags;
      const certificates = certificateTags;
      
      // Prepare input for user mutation - conditionally include fields based on role
      const input = {
        id: currentUser.username,
        name: formState.name,
        email: currentUser.attributes.email,
        role: formState.role,
        profileComplete: true,
        // Student-specific fields - only included if role is Student
        ...(formState.role === 'Student' && {
          major: formState.currentProgram,
          academicYear: formState.degreeType,
          expectedGraduation: formState.expectedGraduation,
          gpa: formState.gpa ? parseFloat(formState.gpa) : null,
          researchInterests,
          skills,
          availability: formState.availability,
          personalStatement: formState.personalStatement,
          certificates
        }),
        // Faculty-specific fields - only included if role is Faculty
        ...(formState.role === 'Faculty' && {
          college: formState.college,
          classesTaught: classesTaughtTags,
          facultyResearchInterests: facultyResearchTags
        })
      };

      // Update the existing user profile
      await API.graphql(graphqlOperation(updateUser, { input }));
      
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
            
            <SelectField
              name="role"
              label="Role *"
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
                
                <TagInput
                  label="Research Interests"
                  tags={researchInterestTags}
                  input={researchInterestInput}
                  setInput={setResearchInterestInput}
                  {...createTagHandlers(researchInterestInput, researchInterestTags, setResearchInterestTags, setResearchInterestInput)}
                  placeholder="Type and press Enter to add"
                  required
                />
                
                <TagInput
                  label="Skills and Experience"
                  tags={skillsTags}
                  input={skillsInput}
                  setInput={setSkillsInput}
                  {...createTagHandlers(skillsInput, skillsTags, setSkillsTags, setSkillsInput)}
                  placeholder="Type and press Enter to add"
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
                
                <TagInput
                  label="Certificates"
                  tags={certificateTags}
                  input={certificateInput}
                  setInput={setCertificateInput}
                  {...createTagHandlers(certificateInput, certificateTags, setCertificateTags, setCertificateInput)}
                  placeholder="Type and press Enter to add"
                />
              </>
            )}
                     
            {/* Faculty-specific fields */}
            {formState.role === 'Faculty' && (
              <>
                <TextField
                  name="college"
                  label="College/Department *"
                  placeholder="e.g., College of Science, Engineering and Technology"
                  value={formState.college}
                  onChange={handleChange}
                  required
                />

                <TagInput
                  label="Classes Taught"
                  tags={classesTaughtTags}
                  input={classesTaughtInput}
                  setInput={setClassesTaughtInput}
                  {...createTagHandlers(classesTaughtInput, classesTaughtTags, setClassesTaughtTags, setClassesTaughtInput)}
                  placeholder="Type and press Enter to add"
                  required
                />

                <TagInput
                  label="Research Interests"
                  tags={facultyResearchTags}
                  input={facultyResearchInput}
                  setInput={setFacultyResearchInput}
                  {...createTagHandlers(facultyResearchInput, facultyResearchTags, setFacultyResearchTags, setFacultyResearchInput)}
                  placeholder="Type and press Enter to add"
                  required
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

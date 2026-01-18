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
  const [researchInterestTags, setResearchInterestTags] = useState(
    user?.researchInterests || []
  );
  const [researchInterestInput, setResearchInterestInput] = useState('');
  const [skillsTags, setSkillsTags] = useState(user?.skills || []);
  const [skillsInput, setSkillsInput] = useState('');
  const [certificateTags, setCertificateTags] = useState(user?.certificates || []);
  const [certificateInput, setCertificateInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && researchInterestInput.trim()) {
      e.preventDefault();
      if (!researchInterestTags.includes(researchInterestInput.trim())) {
        setResearchInterestTags([...researchInterestTags, researchInterestInput.trim()]);
      }
      setResearchInterestInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setResearchInterestTags(researchInterestTags.filter(tag => tag !== tagToRemove));
  };

  const handleSkillsKeyDown = (e) => {
    if (e.key === 'Enter' && skillsInput.trim()) {
      e.preventDefault();
      if (!skillsTags.includes(skillsInput.trim())) {
        setSkillsTags([...skillsTags, skillsInput.trim()]);
      }
      setSkillsInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkillsTags(skillsTags.filter(skill => skill !== skillToRemove));
  };

  const handleCertificateKeyDown = (e) => {
    if (e.key === 'Enter' && certificateInput.trim()) {
      e.preventDefault();
      if (!certificateTags.includes(certificateInput.trim())) {
        setCertificateTags([...certificateTags, certificateInput.trim()]);
      }
      setCertificateInput('');
    }
  };

  const removeCertificate = (certToRemove) => {
    setCertificateTags(certificateTags.filter(cert => cert !== certToRemove));
  };

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
                
                <Flex direction="column" gap="0.5rem">
                  <Text fontWeight="bold">Research Interests *</Text>
                  {researchInterestTags.length > 0 && (
                    <Flex wrap="wrap" gap="0.5rem" marginBottom="0.5rem">
                      {researchInterestTags.map((tag, index) => (
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
                            onClick={() => removeTag(tag)}
                            style={{ padding: '0', minWidth: 'auto', color: tokens.colors.neutral[90], backgroundColor: '#E6D4F5', border: 'none' }}
                          >
                            ×
                          </Button>
                        </Flex>
                      ))}
                    </Flex>
                  )}
                  <TextField
                    name="researchInterestInput"
                    placeholder="Type and press Enter to add"
                    value={researchInterestInput}
                    onChange={(e) => setResearchInterestInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                </Flex>
                
                <Flex direction="column" gap="0.5rem">
                  <Text fontWeight="bold">Skills and Experience *</Text>
                  {skillsTags.length > 0 && (
                    <Flex wrap="wrap" gap="0.5rem" marginBottom="0.5rem">
                      {skillsTags.map((skill, index) => (
                        <Flex
                          key={index}
                          alignItems="center"
                          gap="0.5rem"
                          padding="0.25rem 0.75rem"
                          backgroundColor="#E6D4F5"
                          borderRadius="20px"
                        >
                          <Text fontSize="0.9rem">{skill}</Text>
                          <Button
                            size="small"
                            variation="link"
                            onClick={() => removeSkill(skill)}
                            style={{ padding: '0', minWidth: 'auto', color: tokens.colors.neutral[90], backgroundColor: '#E6D4F5', border: 'none' }}
                          >
                            ×
                          </Button>
                        </Flex>
                      ))}
                    </Flex>
                  )}
                  <TextField
                    name="skillsInput"
                    placeholder="Type and press Enter to add"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    onKeyDown={handleSkillsKeyDown}
                  />
                </Flex>
                
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
                
                <Flex direction="column" gap="0.5rem">
                  <Text fontWeight="bold">Certificates (Optional)</Text>
                  {certificateTags.length > 0 && (
                    <Flex wrap="wrap" gap="0.5rem" marginBottom="0.5rem">
                      {certificateTags.map((cert, index) => (
                        <Flex
                          key={index}
                          alignItems="center"
                          gap="0.5rem"
                          padding="0.25rem 0.75rem"
                          backgroundColor="#E6D4F5"
                          borderRadius="20px"
                        >
                          <Text fontSize="0.9rem">{cert}</Text>
                          <Button
                            size="small"
                            variation="link"
                            onClick={() => removeCertificate(cert)}
                            style={{ padding: '0', minWidth: 'auto', color: tokens.colors.neutral[90], backgroundColor: '#E6D4F5', border: 'none' }}
                          >
                            ×
                          </Button>
                        </Flex>
                      ))}
                    </Flex>
                  )}
                  <TextField
                    name="certificateInput"
                    placeholder="Type and press Enter to add"
                    value={certificateInput}
                    onChange={(e) => setCertificateInput(e.target.value)}
                    onKeyDown={handleCertificateKeyDown}
                  />
                </Flex>
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

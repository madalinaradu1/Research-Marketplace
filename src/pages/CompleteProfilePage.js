import React, { useState, useCallback} from 'react';
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
import { updateUser } from '../graphql/operations';
import TagSelector from '../components/TagSelector';
import { useTags } from '../contexts/TagContext';


const TagInput = ({
  label,
  tags,
  input,
  setInput,
  onKeyDown,
  onRemove,
  placeholder,
  required,
  labelProps
}) => (
  <Flex direction="column" gap="0.35rem">
    <Text {...labelProps}>{label} {required && '*'}</Text>
    {tags.length > 0 && (
      <Flex wrap="wrap" gap="0.5rem" marginBottom="0">
        {tags.map((tag, index) => (
          <span key={index} className="tag-chip">
            <span>{tag}</span>
            <button
              type="button"
              className="tag-chip-remove"
              onClick={() => onRemove(tag)}
              aria-label={`Remove ${tag}`}
            >
              <span className="tag-chip-remove-glyph" aria-hidden="true">×</span>
            </button>
          </span>
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

const COLLEGE_OPTIONS = [
  'College of the Arts and Sciences',
  'Collangelo College of Business',
  'College of Education',
  'College of Nursing and Health Care Professions',
  'College of Science, Engineering, and Technology',
  'College of Theology',
  'College of Doctoral Studies',
  'College of Health Sciences',
  'College of Graduate Studies'
];

const CompleteProfilePage = ({ user }) => {
  const { tokens } = useTheme();
  const { tagsById, resolveTagIds } = useTags();
  const fieldLabelProps = {
    fontSize: tokens.fontSizes.medium,
    fontWeight: tokens.fontWeights.medium,
    color: tokens.colors.font.primary
  };

  const email = (user?.email || '').toLowerCase().trim();
  const lockedRole = 
    user?.role || 
    (email.endsWith('@my.gcu.edu') ? 'Student'
    : email.endsWith('@gcu.edu') ? 'Faculty' : 'Student'); // Default to Student if email domain is unrecognized

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
    role: lockedRole,
    // Faculty-specific fields
    college: user?.college || ''
  });
  
  const [researchInterestTagIds, setResearchInterestTagIds] = useState(
    Array.isArray(user?.researchInterests) ? user.researchInterests : []
  );
  const [skillsTagIds, setSkillsTagIds] = useState(
    Array.isArray(user?.skills) ? user.skills : []
  );
  const [certificateTagIds, setCertificateTagIds] = useState(
    Array.isArray(user?.certificates) ? user.certificates : []
  );
  const [facultyResearchTagIds, setFacultyResearchTagIds] = useState(
  Array.isArray(user?.facultyResearchInterests) ? user.facultyResearchInterests : []
  );
  const [classesTaughtTags, setClassesTaughtTags] = useState(user?.classesTaught || []);
  const [classesTaughtInput, setClassesTaughtInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleGpaChange = (e) => {
        const value = e.target.value;

        if (value === '' || /^(?:[0-3](?:\.\d{0,2})?|4(?:\.0{0,2})?)$/.test(value)) {
          setFormState(prev => ({ ...prev, gpa: value }));
        }
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
      
      if (lockedRole === 'Student' && tagsById.size === 0) {
        setError('Tag catalog is still loading. Please wait and try again.');
        setIsSubmitting(false);
        return;
      }

      const researchInterests = resolveTagIds(researchInterestTagIds);
      const skills = resolveTagIds(skillsTagIds);
      const certificates = resolveTagIds(certificateTagIds);
      const facultyResearchInterests = resolveTagIds(facultyResearchTagIds);

      if (lockedRole === 'Student' && researchInterests.length === 0) {
        setError('Please select at least one research interest.');
        setIsSubmitting(false);
        return;
      }

      if (lockedRole === 'Student' && skills.length === 0) {
        setError('Please select at least one skill.');
        setIsSubmitting(false);
        return;
      }

      const gpaValue = Number.parseFloat(formState.gpa);

      if (
        lockedRole === 'Student' &&
        (!Number.isFinite(gpaValue) || gpaValue < 0 || gpaValue > 4)
      ) {
        setError('GPA must be between 0.00 and 4.00.');
        setIsSubmitting(false);
        return;
      }

      const input = {
        //id: currentUser.username,
        id: user?.id || currentUser.username,
        name: formState.name,
        email: currentUser.attributes.email,
        role: lockedRole,
        profileComplete: true,
        ...(lockedRole === 'Student' && {
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
        ...(lockedRole === 'Faculty' && {
          college: formState.college,
          classesTaught: classesTaughtTags,
          facultyResearchInterests
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
            
            <TextField
              name="role"
              label="Role"
              value={lockedRole}
              isReadOnly
            />

        
            {lockedRole === 'Student' && (
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
                  onChange={handleGpaChange}
                  required
                />
                
                <Flex direction="column" gap="0.5rem">
                  <Text {...fieldLabelProps}>Research Interests *</Text>
                  <TagSelector
                    selectedTagIds={researchInterestTagIds}
                    onChange={setResearchInterestTagIds}
                    placeholder="List research interests...(e.g., Machine Learning, Neuroscience)"
                    maxSelections={10}
                  />
                </Flex>

                <Flex direction="column" gap="0.5rem">
                  <Text {...fieldLabelProps}>Skills and Experience *</Text>
                  <TagSelector
                    selectedTagIds={skillsTagIds}
                    onChange={setSkillsTagIds}
                    placeholder="List skills and experience...(e.g., Python, Data Analysis)"
                    maxSelections={15}
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
                  <Text {...fieldLabelProps}>Certifications *</Text>
                  <TagSelector
                    selectedTagIds={certificateTagIds}
                    onChange={setCertificateTagIds}
                    placeholder="List certifications...(e.g., CompTIA Security+, Google Data Analyst)"
                    maxSelections={15}
                  />
                </Flex>
              </>
            )}
                     
            {/* Faculty-specific fields */}
            {lockedRole === 'Faculty' && (
              <>
                <SelectField
                  name="college"
                  label="College/Department *"
                  value={formState.college}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select College</option>
                  {COLLEGE_OPTIONS.map((college) => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </SelectField>

                <TagInput
                  label="Classes Taught"
                  tags={classesTaughtTags}
                  input={classesTaughtInput}
                  setInput={setClassesTaughtInput}
                  {...createTagHandlers(classesTaughtInput, classesTaughtTags, setClassesTaughtTags, setClassesTaughtInput)}
                  placeholder="Type and press Enter to add"
                  required
                  labelProps={fieldLabelProps}
                />

                <Flex direction="column" gap="0.5rem">
                  <Text {...fieldLabelProps}>Research Interests *</Text>
                  <TagSelector
                    selectedTagIds={facultyResearchTagIds}
                    onChange={setFacultyResearchTagIds}
                    placeholder="List research interests...(e.g., Machine Learning, Neuroscience)"
                    maxSelections={10}
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


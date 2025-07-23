import React, { useState, useEffect } from 'react';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { 
  Flex, 
  Heading, 
  Text, 
  TextField, 
  TextAreaField,
  SelectField,
  SwitchField,
  Button,
  Divider,
  Card,
  Badge,
  useTheme,
  View,
  Loader
} from '@aws-amplify/ui-react';
import { createApplication, updateApplication, getUser, listUsers } from '../graphql/operations';

const ApplicationWizard = ({ user, projectId, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [facultySearchResults, setFacultySearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [applicationData, setApplicationData] = useState({
    // Step 1
    term: '',
    facultySupervisorID: '',
    department: '',
    
    // Step 2
    location: '',
    directSupervisorName: '',
    directSupervisorEmail: '',
    paymentType: 'Volunteer',
    paymentAmount: '',
    creditHours: '',
    projectTitle: '',
    proposalText: '',
    proposalFileKey: '',
    
    // Step 3
    requiresTravel: false,
    travelDetails: '',
    
    // Application metadata
    status: 'Draft',
    statusDetail: '',
  });
  const [proposalFile, setProposalFile] = useState(null);
  
  const { tokens } = useTheme();
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle boolean field changes
  const handleBooleanChange = (name, value) => {
    setApplicationData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      setProposalFile(file);
    }
  };
  
  // Search for faculty by name or email
  const searchFaculty = async (query) => {
    if (!query || query.length < 3) {
      setFacultySearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const filter = {
        or: [
          { name: { contains: query } },
          { email: { contains: query } }
        ],
        role: { eq: 'Faculty' }
      };
      
      const result = await API.graphql(graphqlOperation(listUsers, { filter }));
      setFacultySearchResults(result.data.listUsers.items);
    } catch (err) {
      console.error('Error searching faculty:', err);
      setError('Failed to search faculty. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Select a faculty member
  const selectFaculty = (faculty) => {
    setApplicationData(prev => ({
      ...prev,
      facultySupervisorID: faculty.id,
      department: faculty.department || ''
    }));
    setFacultySearchResults([]);
  };
  
  // Handle next step
  const handleNext = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!applicationData.term || !applicationData.facultySupervisorID || !applicationData.department) {
        setError('Please complete all required fields');
        return;
      }
    } else if (currentStep === 2) {
      if (!applicationData.projectTitle || (!applicationData.proposalText && !proposalFile)) {
        setError('Please provide a project title and either upload a proposal or enter proposal text');
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
    setError(null);
  };
  
  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
    setError(null);
  };
  
  // Save as draft
  const saveDraft = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      let proposalFileKey = applicationData.proposalFileKey;
      
      // Upload proposal file if provided
      if (proposalFile) {
        const fileName = `proposals/${user.username}/${Date.now()}-${proposalFile.name}`;
        await Storage.put(fileName, proposalFile, {
          contentType: proposalFile.type
        });
        proposalFileKey = fileName;
      }
      
      const input = {
        studentID: user.username,
        projectID: projectId,
        ...applicationData,
        proposalFileKey,
        status: 'Draft'
      };
      
      await API.graphql(graphqlOperation(createApplication, { input }));
      setSuccess(true);
      setTimeout(() => {
        if (onComplete) onComplete('draft');
      }, 2000);
    } catch (err) {
      console.error('Error saving draft:', err);
      setError('Failed to save draft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Submit application
  const submitApplication = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      let proposalFileKey = applicationData.proposalFileKey;
      
      // Upload proposal file if provided
      if (proposalFile) {
        const fileName = `proposals/${user.username}/${Date.now()}-${proposalFile.name}`;
        await Storage.put(fileName, proposalFile, {
          contentType: proposalFile.type
        });
        proposalFileKey = fileName;
      }
      
      const input = {
        studentID: user.username,
        projectID: projectId,
        ...applicationData,
        proposalFileKey,
        status: 'Faculty Review',
        submittedToFacultyAt: new Date().toISOString()
      };
      
      await API.graphql(graphqlOperation(createApplication, { input }));
      setSuccess(true);
      setTimeout(() => {
        if (onComplete) onComplete('submitted');
      }, 2000);
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render step 1
  const renderStep1 = () => (
    <Card>
      <Heading level={3}>Step 1: Select Term and Faculty Supervisor</Heading>
      <Divider />
      <Flex direction="column" gap="1rem">
        <SelectField
          name="term"
          label="Term *"
          value={applicationData.term}
          onChange={handleChange}
          required
        >
          <option value="">Select a term</option>
          <option value="Fall 2023">Fall 2023</option>
          <option value="Spring 2024">Spring 2024</option>
          <option value="Summer 2024">Summer 2024</option>
        </SelectField>
        
        <Text>Faculty Supervisor *</Text>
        <Flex direction="column" gap="0.5rem">
          <TextField
            name="facultySearch"
            placeholder="Search by last name or email"
            onChange={(e) => searchFaculty(e.target.value)}
          />
          
          {isSearching && <Loader size="small" />}
          
          {facultySearchResults.length > 0 && (
            <Card>
              {facultySearchResults.map(faculty => (
                <Flex 
                  key={faculty.id} 
                  padding="0.5rem"
                  alignItems="center"
                  justifyContent="space-between"
                  onClick={() => selectFaculty(faculty)}
                  style={{ cursor: 'pointer', borderBottom: '1px solid #eee' }}
                >
                  <Text>{faculty.name}</Text>
                  <Text>{faculty.department || 'No department'}</Text>
                </Flex>
              ))}
            </Card>
          )}
          
          {applicationData.facultySupervisorID && (
            <Badge variation="success">Faculty supervisor selected</Badge>
          )}
        </Flex>
        
        <TextField
          name="department"
          label="Department *"
          value={applicationData.department}
          onChange={handleChange}
          required
        />
      </Flex>
    </Card>
  );
  
  // Render step 2
  const renderStep2 = () => (
    <Card>
      <Heading level={3}>Step 2: Project Details</Heading>
      <Divider />
      <Flex direction="column" gap="1rem">
        <TextField
          name="location"
          label="Location (Building & Room #)"
          value={applicationData.location}
          onChange={handleChange}
        />
        
        <TextField
          name="directSupervisorName"
          label="Direct Supervisor Name (if different from faculty supervisor)"
          value={applicationData.directSupervisorName}
          onChange={handleChange}
        />
        
        <TextField
          name="directSupervisorEmail"
          label="Direct Supervisor Email"
          value={applicationData.directSupervisorEmail}
          onChange={handleChange}
        />
        
        <SelectField
          name="paymentType"
          label="Payment Type"
          value={applicationData.paymentType}
          onChange={handleChange}
        >
          <option value="Pay">Pay</option>
          <option value="Credit">Credit</option>
          <option value="Volunteer">Volunteer</option>
        </SelectField>
        
        {applicationData.paymentType === 'Pay' && (
          <TextField
            name="paymentAmount"
            label="Payment Amount"
            type="number"
            value={applicationData.paymentAmount}
            onChange={handleChange}
          />
        )}
        
        {applicationData.paymentType === 'Credit' && (
          <TextField
            name="creditHours"
            label="Credit Hours"
            type="number"
            value={applicationData.creditHours}
            onChange={handleChange}
          />
        )}
        
        <TextField
          name="projectTitle"
          label="Project Title *"
          value={applicationData.projectTitle}
          onChange={handleChange}
          required
        />
        
        <View>
          <Text>Proposal *</Text>
          <Text fontSize="0.8rem" color="gray">Upload a PDF or enter text below</Text>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ marginTop: '0.5rem' }}
          />
        </View>
        
        <TextAreaField
          name="proposalText"
          label="Proposal Text"
          value={applicationData.proposalText}
          onChange={handleChange}
          rows={6}
        />
      </Flex>
    </Card>
  );
  
  // Render step 3
  const renderStep3 = () => (
    <Card>
      <Heading level={3}>Step 3: Travel & Review</Heading>
      <Divider />
      <Flex direction="column" gap="1rem">
        <SwitchField
          label="This project requires travel beyond the local area"
          checked={applicationData.requiresTravel}
          onChange={(checked) => handleBooleanChange('requiresTravel', checked)}
        />
        
        {applicationData.requiresTravel && (
          <TextAreaField
            name="travelDetails"
            label="Travel Details"
            value={applicationData.travelDetails}
            onChange={handleChange}
            rows={3}
          />
        )}
        
        <Divider />
        
        <Heading level={4}>Application Summary</Heading>
        <Text>Term: {applicationData.term}</Text>
        <Text>Department: {applicationData.department}</Text>
        <Text>Project Title: {applicationData.projectTitle}</Text>
        <Text>Payment Type: {applicationData.paymentType}</Text>
        
        <Text>
          By submitting this application, you confirm that all information provided is accurate.
          Your application will be sent to your faculty supervisor for review.
        </Text>
      </Flex>
    </Card>
  );
  
  // Render step navigation
  const renderStepNavigation = () => (
    <Flex justifyContent="space-between" marginTop="1rem">
      {currentStep > 1 && (
        <Button onClick={handlePrevious} variation="link">
          Previous
        </Button>
      )}
      
      <Flex gap="1rem">
        <Button onClick={saveDraft} isLoading={isSubmitting && !success}>
          Save as Draft
        </Button>
        
        {currentStep < 3 ? (
          <Button onClick={handleNext} variation="primary">
            Next
          </Button>
        ) : (
          <Button 
            onClick={submitApplication} 
            variation="primary"
            isLoading={isSubmitting && !success}
          >
            Submit to Faculty
          </Button>
        )}
      </Flex>
    </Flex>
  );
  
  return (
    <Flex direction="column" gap="1.5rem">
      <Heading level={2}>Research Opportunity Application</Heading>
      
      {/* Step indicators */}
      <Flex gap="1rem" justifyContent="center">
        {[1, 2, 3].map(step => (
          <Flex 
            key={step}
            direction="column" 
            alignItems="center"
            gap="0.25rem"
          >
            <View
              backgroundColor={step <= currentStep ? tokens.colors.primary[80] : tokens.colors.neutral[20]}
              color={step <= currentStep ? 'white' : 'black'}
              padding="0.5rem 1rem"
              borderRadius="50%"
            >
              {step}
            </View>
            <Text fontSize="0.8rem">
              {step === 1 ? 'Faculty & Term' : 
               step === 2 ? 'Project Details' : 'Review & Submit'}
            </Text>
          </Flex>
        ))}
      </Flex>
      
      {error && (
        <Text color="red" textAlign="center">{error}</Text>
      )}
      
      {success ? (
        <Card>
          <Flex direction="column" alignItems="center" gap="1rem">
            <Heading level={3} color="green">Application {applicationData.status === 'Draft' ? 'Saved' : 'Submitted'}!</Heading>
            <Text>
              {applicationData.status === 'Draft' 
                ? 'Your application has been saved as a draft. You can return to complete it later.'
                : 'Your application has been submitted to your faculty supervisor for review.'}
            </Text>
            <Loader />
          </Flex>
        </Card>
      ) : (
        <>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          
          {renderStepNavigation()}
        </>
      )}
    </Flex>
  );
};

export default ApplicationWizard;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API, graphqlOperation } from 'aws-amplify';
import {
  Flex,
  Heading,
  Text,
  Button,
  Card,
  TextAreaField,
  Loader,
  Badge,
  Divider,
  Alert
} from '@aws-amplify/ui-react';
import { getProject } from '../graphql/operations';
import { createApplication } from '../graphql/operations';

const ApplicationPage = ({ user }) => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statement, setStatement] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const result = await API.graphql(graphqlOperation(getProject, { id: projectId }));
      setProject(result.data.getProject);
    } catch (error) {
      console.error('Error fetching project:', error);
      setError('Project not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!statement.trim()) {
      setError('Please provide a personal statement');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const applicationInput = {
        studentID: user.id || user.username,
        projectID: projectId,
        statement: statement.trim(),
        status: 'Faculty Review'
      };

      await API.graphql(graphqlOperation(createApplication, { input: applicationInput }));
      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/applications');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }

  if (!project) {
    return (
      <Flex direction="column" padding="2rem" alignItems="center">
        <Heading level={3}>Project Not Found</Heading>
        <Text>The project you're looking for doesn't exist or has been removed.</Text>
        <Button onClick={() => navigate('/search')} marginTop="1rem">
          Back to Search
        </Button>
      </Flex>
    );
  }

  if (success) {
    return (
      <Flex direction="column" padding="2rem" alignItems="center" gap="1rem">
        <Alert variation="success">
          <Heading level={4}>Application Submitted Successfully!</Heading>
          <Text>Your application has been submitted and is now under faculty review.</Text>
        </Alert>
        <Text>Redirecting to your applications...</Text>
      </Flex>
    );
  }

  return (
    <Flex direction="column" padding="2rem" gap="2rem" maxWidth="800px" margin="0 auto">
      <Flex direction="row" alignItems="center" gap="1rem">
        <Button size="small" onClick={() => navigate('/search')}>
          ← Back to Search
        </Button>
        <Heading level={2}>Apply for Research Position</Heading>
      </Flex>

      {/* Project Information */}
      <Card>
        <Flex direction="column" gap="1rem">
          <Flex justifyContent="space-between" alignItems="flex-start">
            <Flex direction="column" gap="0.5rem" flex="1">
              <Heading level={3}>{project.title}</Heading>
              <Text fontSize="0.9rem" color="gray">
                {project.faculty?.name} • {project.department}
              </Text>
            </Flex>
            <Badge backgroundColor={project.isActive ? 'green' : 'gray'} color="white">
              {project.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </Flex>

          <Text>{project.description}</Text>

          {project.skillsRequired && project.skillsRequired.length > 0 && (
            <Flex direction="column" gap="0.5rem">
              <Text fontWeight="bold" fontSize="0.9rem">Skills Required:</Text>
              <Flex wrap="wrap" gap="0.5rem">
                {project.skillsRequired.map((skill, index) => (
                  <Badge key={index} backgroundColor="blue" color="white">
                    {skill}
                  </Badge>
                ))}
              </Flex>
            </Flex>
          )}

          <Flex gap="2rem">
            <Text fontSize="0.9rem">
              <strong>Duration:</strong> {project.duration}
            </Text>
            {project.applicationDeadline && (
              <Text fontSize="0.9rem">
                <strong>Deadline:</strong> {new Date(project.applicationDeadline).toLocaleDateString()}
              </Text>
            )}
          </Flex>

          {project.qualifications && (
            <Flex direction="column" gap="0.5rem">
              <Text fontWeight="bold" fontSize="0.9rem">Qualifications:</Text>
              <Text fontSize="0.9rem">{project.qualifications}</Text>
            </Flex>
          )}
        </Flex>
      </Card>

      <Divider />

      {/* Application Form */}
      <Card>
        <Flex direction="column" gap="1.5rem">
          <Heading level={4}>Your Application</Heading>
          
          <TextAreaField
            label="Personal Statement"
            placeholder="Please explain why you're interested in this research opportunity, your relevant experience, and what you hope to gain from this position..."
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
            rows={8}
            required
          />

          {project.requiresTranscript && (
            <Alert variation="info">
              <Text>
                <strong>Note:</strong> This position requires a transcript. 
                You can upload your transcript after submitting this application.
              </Text>
            </Alert>
          )}

          {error && (
            <Alert variation="error">
              <Text>{error}</Text>
            </Alert>
          )}

          <Flex gap="1rem">
            <Button 
              onClick={() => navigate('/search')}
              variation="link"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              variation="primary"
              isLoading={submitting}
              isDisabled={!statement.trim()}
            >
              Submit Application
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
};

export default ApplicationPage;
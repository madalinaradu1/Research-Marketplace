import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Flex, 
  Heading, 
  Text, 
  Button, 
  Card, 
  Divider,
  Loader
} from '@aws-amplify/ui-react';
import { getProject } from '../graphql/queries';
import { ApplicationWizard } from '../components';

const ProjectDetailsPage = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  
  useEffect(() => {
    fetchProject();
  }, [id]);
  
  const fetchProject = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await API.graphql(graphqlOperation(getProject, { id }));
      setProject(result.data.getProject);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Failed to load project details. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleApplicationComplete = (status) => {
    setIsApplying(false);
    if (status === 'submitted') {
      navigate('/dashboard');
    }
  };
  
  if (loading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }
  
  if (error || !project) {
    return (
      <Card padding="2rem">
        <Text>{error || 'Project not found'}</Text>
        <Button 
          onClick={() => navigate('/search')}
          marginTop="1rem"
        >
          Back to Search
        </Button>
      </Card>
    );
  }
  
  return (
    <Flex direction="column" padding="2rem" gap="2rem">
      {isApplying ? (
        <ApplicationWizard 
          user={user} 
          projectId={id} 
          onComplete={handleApplicationComplete} 
        />
      ) : (
        <>
          <Heading level={2}>{project.title}</Heading>
          
          <Card>
            <Flex direction="column" gap="1rem">
              <Text fontWeight="bold">Department: {project.department}</Text>
              <Divider />
              
              <Text fontWeight="bold">Description</Text>
              <Text>{project.description}</Text>
              <Divider />
              
              <Text fontWeight="bold">Skills Required</Text>
              <Flex wrap="wrap" gap="0.5rem">
                {project.skillsRequired?.map((skill, index) => (
                  <Card 
                    key={index}
                    backgroundColor="rgba(0, 0, 0, 0.05)"
                    padding="0.25rem 0.5rem"
                    borderRadius="1rem"
                  >
                    <Text fontSize="0.8rem">{skill}</Text>
                  </Card>
                ))}
              </Flex>
              <Divider />
              
              <Text fontWeight="bold">Duration: {project.duration}</Text>
              <Text fontWeight="bold">
                Application Deadline: {new Date(project.applicationDeadline).toLocaleDateString()}
              </Text>
              <Divider />
              
              <Text fontWeight="bold">Faculty</Text>
              <Text>{project.faculty?.name || 'Unknown'}</Text>
              <Text>{project.faculty?.email || ''}</Text>
              <Divider />
              
              <Button 
                variation="primary"
                onClick={() => setIsApplying(true)}
              >
                Apply Now
              </Button>
            </Flex>
          </Card>
        </>
      )}
    </Flex>
  );
};

export default ProjectDetailsPage;
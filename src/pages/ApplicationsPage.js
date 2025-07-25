import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { 
  Flex, 
  Heading, 
  Text, 
  Card, 
  Divider,
  Collection,
  Loader,
  Tabs,
  TabItem
} from '@aws-amplify/ui-react';
import { listApplications } from '../graphql/simplified-operations';
import { ApplicationStatus, ApplicationStatusGuide } from '../components';

const ApplicationsPage = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  
  useEffect(() => {
    fetchApplications();
  }, [user]);
  
  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = user.id || user.username;
      
      // Fetch all applications and filter client-side to avoid DynamoDB filter issues
      const result = await API.graphql(graphqlOperation(listApplications, { 
        limit: 100
      }));
      
      console.log('Application result:', result);
      
      if (result.data && result.data.listApplications) {
        // Filter applications client-side
        const userApplications = result.data.listApplications.items.filter(
          app => app.studentID === userId
        );
        setApplications(userApplications);
      } else {
        console.warn('No application data returned');
        setApplications([]);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      setError('Failed to load applications. Please try again.');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApplicationUpdate = () => {
    fetchApplications();
  };
  
  if (loading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }
  
  return (
    <Flex direction="column" padding="2rem" gap="2rem">
      <Heading level={2}>My Applications</Heading>
      
      {error && <Text color="red">{error}</Text>}
      
      <Tabs
        currentIndex={activeTabIndex}
        onChange={(index) => setActiveTabIndex(index)}
      >
        <TabItem title="Applications">
          {applications.length === 0 ? (
            <Card>
              <Text>You haven't submitted any applications yet.</Text>
            </Card>
          ) : (
            <Collection
              items={applications}
              type="list"
              gap="1rem"
              wrap="nowrap"
              direction="column"
            >
              {(application) => (
                <ApplicationStatus 
                  key={application.id}
                  application={application}
                  isStudent={true}
                  onUpdate={handleApplicationUpdate}
                />
              )}
            </Collection>
          )}
        </TabItem>
        
        <TabItem title="Status Guide">
          <ApplicationStatusGuide />
        </TabItem>
      </Tabs>
    </Flex>
  );
};

export default ApplicationsPage;
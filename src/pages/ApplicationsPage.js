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
import { listApplications } from '../graphql/queries';
import { ApplicationStatus, ApplicationStatusGuide } from '../components';

const ApplicationsPage = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('applications');
  
  useEffect(() => {
    fetchApplications();
  }, [user]);
  
  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filter = {
        studentID: { eq: user.username }
      };
      
      const result = await API.graphql(graphqlOperation(listApplications, { 
        filter,
        limit: 100
      }));
      
      setApplications(result.data.listApplications.items);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again.');
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
        currentIndex={activeTab === 'applications' ? 0 : 1}
        onChange={(index) => setActiveTab(index === 0 ? 'applications' : 'guide')}
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
import React, { useState } from 'react';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { 
  Flex, 
  Heading, 
  Tabs, 
  TabItem, 
  Card, 
  Button, 
  Text,
  View,
  Alert
} from '@aws-amplify/ui-react';

// Import Amplify Studio components
import { ProfileCard } from '../ui-components';

// Import GraphQL operations
import { updateUser } from '../graphql/mutations';
import { createDocument, deleteDocument } from '../graphql/mutations';

const ProfilePage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({ ...user });
  const [documents, setDocuments] = useState(user.documents?.items || []);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  // Handle profile update
  async function handleUpdateProfile() {
    try {
      const userInput = {
        id: user.id,
        name: updatedUser.name,
        major: updatedUser.major,
        year: updatedUser.year,
        interests: updatedUser.interests,
        bio: updatedUser.bio
      };
      
      await API.graphql(
        graphqlOperation(updateUser, { input: userInput })
      );
      
      setIsEditing(false);
      setMessage({ type: 'success', content: 'Profile updated successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', content: 'Error updating profile. Please try again.' });
    }
  }

  // Handle file upload
  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    setUploading(true);
    
    try {
      // Upload file to S3
      const fileName = `${Date.now()}-${file.name}`;
      const result = await Storage.put(
        `documents/${user.id}/${fileName}`,
        file,
        {
          contentType: file.type,
          metadata: {
            userId: user.id
          }
        }
      );
      
      // Save document metadata to DynamoDB
      const documentInput = {
        userId: user.id,
        name: file.name,
        type: file.type,
        key: result.key,
        size: file.size,
        uploadDate: new Date().toISOString()
      };
      
      const newDocument = await API.graphql(
        graphqlOperation(createDocument, { input: documentInput })
      );
      
      // Update local documents state
      setDocuments([...documents, newDocument.data.createDocument]);
      setMessage({ type: 'success', content: 'Document uploaded successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error uploading document:', error);
      setMessage({ type: 'error', content: 'Error uploading document. Please try again.' });
    }
    
    setUploading(false);
  }

  // Handle document deletion
  async function handleDeleteDocument(documentId, key) {
    try {
      // Delete from S3
      await Storage.remove(key);
      
      // Delete from DynamoDB
      await API.graphql(
        graphqlOperation(deleteDocument, { input: { id: documentId } })
      );
      
      // Update local documents state
      setDocuments(documents.filter(doc => doc.id !== documentId));
      setMessage({ type: 'success', content: 'Document deleted successfully!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error deleting document:', error);
      setMessage({ type: 'error', content: 'Error deleting document. Please try again.' });
    }
  }

  return (
    <Flex direction="column" padding="2rem" gap="2rem">
      <Heading level={2}>My Profile</Heading>
      
      {message && (
        <Alert variation={message.type}>
          {message.content}
        </Alert>
      )}
      
      <Tabs
        currentIndex={activeTab === 'profile' ? 0 : activeTab === 'documents' ? 1 : 2}
        onChange={(index) => setActiveTab(index === 0 ? 'profile' : index === 1 ? 'documents' : 'settings')}
      >
        <TabItem title="Profile">
          <Card>
            {isEditing ? (
              <Flex direction="column" gap="1rem">
                <ProfileCard
                  user={updatedUser}
                  overrides={{
                    SaveButton: {
                      onClick: handleUpdateProfile
                    },
                    NameField: {
                      onChange: (e) => setUpdatedUser({ ...updatedUser, name: e.target.value })
                    },
                    MajorField: {
                      onChange: (e) => setUpdatedUser({ ...updatedUser, major: e.target.value })
                    },
                    YearField: {
                      onChange: (e) => setUpdatedUser({ ...updatedUser, year: e.target.value })
                    },
                    InterestsField: {
                      onChange: (e) => setUpdatedUser({ ...updatedUser, interests: e.target.value.split(',').map(i => i.trim()) })
                    },
                    BioField: {
                      onChange: (e) => setUpdatedUser({ ...updatedUser, bio: e.target.value })
                    }
                  }}
                />
                <Button variation="link" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </Flex>
            ) : (
              <Flex direction="column" gap="1rem">
                <ProfileCard
                  user={user}
                  overrides={{
                    "Profile Form": { display: "none" },
                    SaveButton: { display: "none" }
                  }}
                />
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              </Flex>
            )}
          </Card>
        </TabItem>
        
        <TabItem title="Documents">
          <Card>
            <Flex direction="column" gap="1.5rem">
              <Heading level={4}>My Documents</Heading>
              
              <View as="form">
                <Flex direction="column" gap="1rem">
                  <Text>Upload a new document:</Text>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  {uploading && <Text>Uploading...</Text>}
                </Flex>
              </View>
              
              <Flex direction="column" gap="0.5rem">
                <Heading level={5}>Uploaded Documents</Heading>
                
                {documents.length === 0 ? (
                  <Text>No documents uploaded yet.</Text>
                ) : (
                  documents.map((doc) => (
                    <Flex
                      key={doc.id}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      padding="0.75rem"
                      backgroundColor="var(--amplify-colors-background-secondary)"
                      borderRadius="var(--amplify-radii-medium)"
                    >
                      <Text>{doc.name}</Text>
                      <Flex gap="0.5rem">
                        <Button
                          size="small"
                          onClick={async () => {
                            const url = await Storage.get(doc.key);
                            window.open(url, '_blank');
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variation="destructive"
                          onClick={() => handleDeleteDocument(doc.id, doc.key)}
                        >
                          Delete
                        </Button>
                      </Flex>
                    </Flex>
                  ))
                )}
              </Flex>
            </Flex>
          </Card>
        </TabItem>
        
        <TabItem title="Settings">
          <Card>
            <Flex direction="column" gap="1.5rem">
              <Heading level={4}>Account Settings</Heading>
              
              <Flex direction="column" gap="1rem">
                <Text>Email Notifications</Text>
                {/* Add notification settings here */}
              </Flex>
              
              <Flex direction="column" gap="1rem">
                <Text>Privacy Settings</Text>
                {/* Add privacy settings here */}
              </Flex>
            </Flex>
          </Card>
        </TabItem>
      </Tabs>
    </Flex>
  );
};

export default ProfilePage;
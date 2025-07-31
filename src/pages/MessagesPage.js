import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { 
  Flex, 
  Heading, 
  Text, 
  Button, 
  Card, 
  Divider,
  Collection,
  Loader,
  Tabs,
  TabItem,
  Badge,
  TextAreaField,
  View
} from '@aws-amplify/ui-react';
import { listUsers } from '../graphql/operations';
import { createNotification } from '../graphql/message-operations';

const MessagesPage = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = user.id || user.username;
      
      // For now, show a simple message that the full messaging system needs Message schema
      setMessages([]);
      setUsers([]);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Messaging system requires Message table schema to be added to GraphQL.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await API.graphql(graphqlOperation(updateMessage, { 
        input: { id: messageId, isRead: true }
      }));
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      ));
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;
    
    setIsReplying(true);
    try {
      const userId = user.id || user.username;
      const recipientId = selectedMessage.isIncoming ? selectedMessage.senderID : selectedMessage.recipientID;
      
      const messageInput = {
        senderID: userId,
        recipientID: recipientId,
        subject: `Re: ${selectedMessage.subject}`,
        content: replyText,
        isRead: false,
        projectID: selectedMessage.projectID,
        threadID: selectedMessage.threadID
      };
      
      await API.graphql(graphqlOperation(createMessage, { input: messageInput }));
      
      // Create notification
      const recipient = users.find(u => u.id === recipientId);
      const notificationInput = {
        userId: recipientId,
        type: 'MESSAGE_RECEIVED',
        title: 'New Reply',
        message: `You have a new reply from ${user.name}`,
        read: false,
        relatedItemId: selectedMessage.projectID,
        relatedItemType: 'PROJECT'
      };
      
      await API.graphql(graphqlOperation(createNotification, { input: notificationInput }));
      
      setReplyText('');
      setSelectedMessage(null);
      fetchData(); // Refresh messages
    } catch (err) {
      console.error('Error sending reply:', err);
      setError('Failed to send reply. Please try again.');
    } finally {
      setIsReplying(false);
    }
  };

  const getInboxMessages = () => messages.filter(msg => msg.isIncoming);
  const getSentMessages = () => messages.filter(msg => !msg.isIncoming);
  const getUnreadCount = () => messages.filter(msg => msg.isIncoming && !msg.isRead).length;

  if (loading) {
    return (
      <Flex justifyContent="center" padding="2rem">
        <Loader size="large" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" padding="2rem" gap="2rem">
      <Heading level={2}>Messages</Heading>
      
      {error && <Text color="red">{error}</Text>}
      
      <Card>
        <Heading level={4}>Messaging System Setup Required</Heading>
        <Text marginTop="1rem">
          To enable full messaging functionality, you need to add a Message type to your GraphQL schema.
          Currently, faculty can send notifications to students, but full messaging requires:
        </Text>
        <Text marginTop="1rem">
          • Message type in schema.graphql<br/>
          • Proper sender/recipient relationships<br/>
          • Message threading support<br/>
          • Read/unread status tracking
        </Text>
        <Text marginTop="1rem">
          For now, faculty can send messages to students via notifications in the Faculty Dashboard.
        </Text>
      </Card>
      
      <Tabs
        currentIndex={activeTabIndex}
        onChange={(index) => setActiveTabIndex(index)}
      >
        <TabItem title={
          <Flex alignItems="center" gap="0.5rem">
            <Text>Inbox</Text>
            {getUnreadCount() > 0 && (
              <Badge backgroundColor="red" color="white">
                {getUnreadCount()}
              </Badge>
            )}
          </Flex>
        }>
          {getInboxMessages().length === 0 ? (
            <Card>
              <Text>No messages in your inbox.</Text>
            </Card>
          ) : (
            <Collection
              items={getInboxMessages()}
              type="list"
              gap="1rem"
              wrap="nowrap"
              direction="column"
            >
              {(message) => (
                <Card 
                  key={message.id}
                  backgroundColor={message.isRead ? 'white' : '#f0f8ff'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (!message.isRead) {
                      markAsRead(message.id);
                    }
                  }}
                >
                  <Flex direction="column" gap="0.5rem">
                    <Flex justifyContent="space-between" alignItems="center">
                      <Text fontWeight={message.isRead ? 'normal' : 'bold'}>
                        From: {message.sender?.name || 'Unknown'}
                      </Text>
                      <Text fontSize="0.8rem">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </Text>
                    </Flex>
                    <Text fontWeight={message.isRead ? 'normal' : 'bold'}>
                      {message.subject}
                    </Text>
                    <Text fontSize="0.9rem" color="gray">
                      {message.content.substring(0, 100)}...
                    </Text>
                  </Flex>
                </Card>
              )}
            </Collection>
          )}
        </TabItem>
        
        <TabItem title="Sent">
          {getSentMessages().length === 0 ? (
            <Card>
              <Text>No sent messages.</Text>
            </Card>
          ) : (
            <Collection
              items={getSentMessages()}
              type="list"
              gap="1rem"
              wrap="nowrap"
              direction="column"
            >
              {(message) => (
                <Card 
                  key={message.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedMessage(message)}
                >
                  <Flex direction="column" gap="0.5rem">
                    <Flex justifyContent="space-between" alignItems="center">
                      <Text>To: {message.recipient?.name || 'Unknown'}</Text>
                      <Text fontSize="0.8rem">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </Text>
                    </Flex>
                    <Text fontWeight="bold">{message.subject}</Text>
                    <Text fontSize="0.9rem" color="gray">
                      {message.content.substring(0, 100)}...
                    </Text>
                  </Flex>
                </Card>
              )}
            </Collection>
          )}
        </TabItem>
      </Tabs>
      
      {/* Message Detail Modal */}
      {selectedMessage && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1000 }}
          onClick={() => setSelectedMessage(null)}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            height="100%"
            padding="2rem"
          >
            <Card
              maxWidth="700px"
              width="100%"
              maxHeight="80vh"
              style={{ overflow: 'auto' }}
              onClick={(e) => e.stopPropagation()}
            >
              <Flex direction="column" gap="1rem">
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading level={4}>Message Details</Heading>
                  <Button size="small" onClick={() => setSelectedMessage(null)}>Close</Button>
                </Flex>
                
                <Divider />
                
                <Flex direction="column" gap="0.5rem">
                  <Text><strong>From:</strong> {selectedMessage.sender?.name}</Text>
                  <Text><strong>To:</strong> {selectedMessage.recipient?.name}</Text>
                  <Text><strong>Subject:</strong> {selectedMessage.subject}</Text>
                  <Text><strong>Date:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}</Text>
                </Flex>
                
                <Divider />
                
                <Card variation="outlined" padding="1rem">
                  <Text whiteSpace="pre-wrap">{selectedMessage.content}</Text>
                </Card>
                
                <Divider />
                
                <TextAreaField
                  label="Reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                  placeholder="Type your reply here..."
                />
                
                <Flex gap="1rem">
                  <Button 
                    onClick={() => {
                      setSelectedMessage(null);
                      setReplyText('');
                    }}
                    variation="link"
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={sendReply}
                    variation="primary"
                    isLoading={isReplying}
                    isDisabled={!replyText.trim()}
                  >
                    Send Reply
                  </Button>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </View>
      )}
    </Flex>
  );
};

export default MessagesPage;
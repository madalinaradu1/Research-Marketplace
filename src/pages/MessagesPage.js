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
import { listMessages, updateMessage, createMessage, createNotification, getMessageThread } from '../graphql/message-operations';
import { sendEmailNotification } from '../utils/emailNotifications';

const MessagesPage = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [threadMessages, setThreadMessages] = useState([]);
  const [showThread, setShowThread] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = user.id || user.username;
      
      // Fetch all messages for this user
      console.log('Fetching messages...');
      const messageResult = await API.graphql(graphqlOperation(listMessages, { 
        limit: 100
      }));
      console.log('Message result:', JSON.stringify(messageResult, null, 2));
      
      if (messageResult.errors) {
        console.error('GraphQL errors in listMessages:', messageResult.errors);
      }
      
      // Fetch all users for name lookup
      const usersResult = await API.graphql(graphqlOperation(listUsers, { 
        limit: 100
      }));
      
      const allMessages = messageResult.data?.listMessages?.items || [];
      console.log('Items from listMessages:', messageResult.data?.listMessages);
      const allUsers = usersResult.data.listUsers.items;
      
      console.log('Raw messages from DB:', allMessages);
      console.log('Users:', allUsers);
      
      // Filter messages for current user (sent or received)
      console.log('Current user ID:', userId);
      console.log('All messages:', allMessages);
      
      const userMessages = allMessages
        .filter(msg => {
          const isSender = msg.senderID === userId;
          const isReceiver = msg.receiverID === userId;
          console.log(`Message ${msg.id}: sender=${msg.senderID}, receiver=${msg.receiverID}, isSender=${isSender}, isReceiver=${isReceiver}`);
          return isSender || isReceiver;
        })
        .map(msg => {
          const sender = allUsers.find(u => u.id === msg.senderID) || msg.sender;
          const receiver = allUsers.find(u => u.id === msg.receiverID) || msg.receiver;
          return {
            ...msg,
            sender,
            receiver,
            isIncoming: msg.receiverID === userId
          };
        })
        .sort((a, b) => new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt));
      
      setMessages(userMessages);
      setUsers(allUsers);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
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
      const recipientId = selectedMessage.isIncoming ? selectedMessage.senderID : selectedMessage.receiverID;
      
      const messageInput = {
        senderID: userId,
        receiverID: recipientId,
        subject: `Re: ${selectedMessage.subject}`,
        body: replyText,
        isRead: false,
        sentAt: new Date().toISOString()
      };
      
      console.log('Sending message with input:', messageInput);
      await API.graphql(graphqlOperation(createMessage, { input: messageInput }));
      console.log('Message sent successfully');
      
      // Create notification
      const recipient = users.find(u => u.id === recipientId);
      const notificationInput = {
        userID: recipientId,
        type: 'MESSAGE_RECEIVED',
        message: `You have a new reply from ${user.name}`,
        isRead: false
      };
      
      await API.graphql(graphqlOperation(createNotification, { input: notificationInput }));
      
      // Send email notification for reply
      try {
        const recipient = users.find(u => u.id === recipientId);
        await sendEmailNotification(
          recipient?.email,
          recipient?.name,
          user.name,
          `Re: ${selectedMessage.subject}`,
          replyText,
          selectedMessage.projectID ? 'Research Project' : 'Direct Message'
        );
        console.log('Reply email notification sent successfully');
      } catch (emailError) {
        console.log('Reply email notification prepared (SES integration pending):', emailError);
      }
      
      setReplyText('');
      setSelectedMessage(null);
      fetchData(); // Refresh messages
    } catch (err) {
      console.error('Error sending reply:', err);
      if (err.errors) {
        err.errors.forEach((error, index) => {
          console.error(`GraphQL Error ${index + 1}:`, error.message);
          console.error('Error details:', error);
        });
      }
      setError('Failed to send reply. Please try again.');
    } finally {
      setIsReplying(false);
    }
  };

  const getInboxMessages = () => messages.filter(msg => msg.isIncoming);
  const getSentMessages = () => messages.filter(msg => !msg.isIncoming);
  const getUnreadCount = () => messages.filter(msg => msg.isIncoming && !msg.isRead).length;
  
  const viewThread = async (message) => {
    if (!message.threadID) {
      setSelectedMessage(message);
      return;
    }
    
    try {
      const threadResult = await API.graphql(graphqlOperation(getMessageThread, { 
        threadID: message.threadID 
      }));
      
      const threadMsgs = threadResult.data.listMessages.items
        .sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
      
      setThreadMessages(threadMsgs);
      setSelectedMessage(message);
      setShowThread(true);
    } catch (err) {
      console.error('Error fetching thread:', err);
      setSelectedMessage(message);
    }
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
      <Heading level={2}>Messages</Heading>
      
      {error && <Text color="red">{error}</Text>}
      
      <Card variation="elevated">
        <Heading level={4}>Message Summary</Heading>
        <Flex wrap="wrap" gap="1rem" marginTop="1rem">
          <Card variation="outlined" padding="1rem" flex="1">
            <Heading level={5} color="blue">{getUnreadCount()}</Heading>
            <Text>Unread Messages</Text>
          </Card>
          <Card variation="outlined" padding="1rem" flex="1">
            <Heading level={5}>{messages.length}</Heading>
            <Text>Total Messages</Text>
          </Card>
        </Flex>
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
                      {(message.body || message.content || '').substring(0, 100)}...
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
                      <Text>To: {message.receiver?.name || message.recipient?.name || 'Unknown'}</Text>
                      <Text fontSize="0.8rem">
                        {new Date(message.sentAt || message.createdAt).toLocaleDateString()}
                      </Text>
                    </Flex>
                    <Text fontWeight="bold">{message.subject}</Text>
                    <Text fontSize="0.9rem" color="gray">
                      {(message.body || message.content || '').substring(0, 100)}...
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
                  <Text whiteSpace="pre-wrap">{selectedMessage.body || selectedMessage.content || 'No content'}</Text>
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
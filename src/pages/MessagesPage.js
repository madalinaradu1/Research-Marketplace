import React, { useState, useEffect } from 'react';
import { API, graphqlOperation, Auth } from 'aws-amplify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
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
  TextField,
  SelectField,
  View
} from '@aws-amplify/ui-react';
import { listUsers, listApplications, listProjects } from '../graphql/operations';
import { listMessages, updateMessage, createMessage, createNotification, getMessageThread } from '../graphql/message-operations';
import { sendEmailNotification } from '../utils/emailNotifications';

// Clean HTML content to remove excessive spacing
const cleanHtmlContent = (html) => {
  if (!html) return '';
  return html
    .replace(/<p><br><\/p>/g, '') // Remove empty paragraphs with breaks
    .replace(/<p>\s*<\/p>/g, '') // Remove empty paragraphs
    .replace(/<br\s*\/?>/g, ' ') // Replace breaks with spaces
    .replace(/<\/p>\s*<p>/g, '</p><p>') // Remove extra spacing between paragraphs
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
};

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
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [availableRecipients, setAvailableRecipients] = useState([]);
  const [newMessage, setNewMessage] = useState({ recipient: '', subject: '', body: '' });
  const [isSendingNew, setIsSendingNew] = useState(false);
  const [archivedMessages, setArchivedMessages] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

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
        });
      
      // Group messages by consistent thread ID between two users
      const threadGroups = {};
      userMessages.forEach(msg => {
        const threadId = msg.threadID || (msg.senderID < msg.receiverID ? `${msg.senderID}-${msg.receiverID}` : `${msg.receiverID}-${msg.senderID}`);
        if (!threadGroups[threadId]) {
          threadGroups[threadId] = [];
        }
        // Ensure message has threadID set
        msg.threadID = threadId;
        threadGroups[threadId].push(msg);
      });
      
      // Convert to array of conversations, showing latest message first
      const conversations = Object.values(threadGroups)
        .map(thread => {
          const sortedThread = thread.sort((a, b) => new Date(a.sentAt || a.createdAt) - new Date(b.sentAt || b.createdAt));
          const latestMessage = sortedThread[sortedThread.length - 1];
          const threadId = sortedThread[0].threadID;
          return {
            ...latestMessage,
            threadID: threadId,
            thread: sortedThread,
            threadId: threadId,
            hasUnread: sortedThread.some(msg => msg.receiverID === userId && !msg.isRead && msg.senderID !== userId),
            isIncoming: true
          };
        })
        .sort((a, b) => new Date(b.sentAt || b.createdAt) - new Date(a.sentAt || a.createdAt));
      
      setMessages(conversations);
      setUsers(allUsers);
      
      // Load archived messages from localStorage
      const archived = JSON.parse(localStorage.getItem(`archived_messages_${userId}`) || '[]');
      setArchivedMessages(archived);
      
      // Fetch available recipients based on user role
      await fetchAvailableRecipients(userId, allUsers);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAvailableRecipients = async (userId, allUsers) => {
    try {
      if (user.role === 'Coordinator') {
        // Coordinators can message all faculty members
        const facultyUsers = allUsers.filter(u => u.role === 'Faculty');
        setAvailableRecipients(facultyUsers);
      } else if (user.role === 'Faculty') {
        // Faculty can message students with approved applications
        const currentUser = await Auth.currentAuthenticatedUser();
        const facultyId = currentUser.username;
        
        const projectResult = await API.graphql(graphqlOperation(listProjects, { 
          filter: { facultyID: { eq: facultyId } },
          limit: 100
        }));
        
        const facultyProjects = projectResult.data.listProjects.items;
        const projectIds = facultyProjects.map(p => p.id);
        
        if (projectIds.length > 0) {
          const applicationResult = await API.graphql(graphqlOperation(listApplications, { 
            limit: 100
          }));
          
          const approvedStudentIds = applicationResult.data.listApplications.items
            .filter(app => projectIds.includes(app.projectID) && app.status === 'Approved')
            .map(app => app.studentID);
          
          const recipients = allUsers.filter(u => approvedStudentIds.includes(u.id));
          setAvailableRecipients(recipients);
        }
      } else {
        // Students can message faculty who approved their applications
        const applicationResult = await API.graphql(graphqlOperation(listApplications, { 
          limit: 100
        }));
        
        const studentApplications = applicationResult.data.listApplications.items
          .filter(app => app.studentID === userId && app.status === 'Approved');
        
        const projectIds = studentApplications.map(app => app.projectID);
        
        if (projectIds.length > 0) {
          const projectResult = await API.graphql(graphqlOperation(listProjects, { 
            limit: 100
          }));
          
          const facultyIds = projectResult.data.listProjects.items
            .filter(p => projectIds.includes(p.id))
            .map(p => p.facultyID);
          
          const recipients = allUsers.filter(u => facultyIds.includes(u.id));
          setAvailableRecipients(recipients);
        }
      }
    } catch (err) {
      console.error('Error fetching available recipients:', err);
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
      const recipientId = selectedMessage.senderID === userId ? selectedMessage.receiverID : selectedMessage.senderID;
      
      // Always use the thread ID from the selected message or its thread
      let threadID = selectedMessage.threadID;
      if (!threadID && selectedMessage.thread && selectedMessage.thread.length > 0) {
        threadID = selectedMessage.thread[0].threadID;
      }
      if (!threadID) {
        threadID = userId < recipientId ? `${userId}-${recipientId}` : `${recipientId}-${userId}`;
      }
      
      const messageInput = {
        senderID: userId,
        receiverID: recipientId,
        subject: selectedMessage.subject.startsWith('Re:') ? selectedMessage.subject : `Re: ${selectedMessage.subject}`,
        body: replyText,
        isRead: false,
        threadID: threadID
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

  const getInboxMessages = () => messages.filter(msg => !archivedMessages.includes(msg.id));
  const getSentMessages = () => [];
  const getArchivedMessages = () => messages.filter(msg => archivedMessages.includes(msg.id));
  const getUnreadCount = () => getInboxMessages().filter(msg => msg.hasUnread).length;
  
  const archiveMessage = (messageId) => {
    const userId = user.id || user.username;
    const newArchived = [...archivedMessages, messageId];
    setArchivedMessages(newArchived);
    localStorage.setItem(`archived_messages_${userId}`, JSON.stringify(newArchived));
    setShowDeleteConfirm(false);
    setMessageToDelete(null);
  };
  
  const confirmDelete = (message) => {
    setMessageToDelete(message);
    setShowDeleteConfirm(true);
  };
  
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
      <Flex justifyContent="space-between" alignItems="center">
        <Heading level={2}>Messages</Heading>
        <Button 
          backgroundColor="white"
          color="black"
          border="1px solid black"
          size="small"
          onClick={() => setShowNewMessage(true)}
          isDisabled={availableRecipients.length === 0}
        >
          Send New Message
        </Button>
      </Flex>
      
      {error && <Text color="red">{error}</Text>}
      
      {availableRecipients.length === 0 && user.role !== 'Coordinator' && (
        <Card backgroundColor="#fff3cd" padding="1rem">
          <Text color="#856404">
            {user.role === 'Faculty' 
              ? 'You can send messages to students once their applications are approved.' 
              : 'You can send messages to faculty once your applications are approved.'}
          </Text>
        </Card>
      )}
      

      
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
                  backgroundColor={message.hasUnread ? '#f0f8ff' : 'white'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedMessage(message);
                    // Mark all unread messages in thread as read
                    message.thread?.forEach(msg => {
                      if (msg.isIncoming && !msg.isRead) {
                        markAsRead(msg.id);
                      }
                    });
                  }}
                >
                  <Flex direction="column" gap="0.5rem">
                    <Flex justifyContent="space-between" alignItems="center">
                      <Text fontWeight={message.hasUnread ? 'bold' : 'normal'}>
                        {message.senderID === (user.id || user.username) ? (message.receiver?.name || 'Deleted User') : (message.sender?.name || 'Deleted User')}
                      </Text>
                      <Flex alignItems="center" gap="0.5rem">
                        <Text fontSize="0.8rem">
                          {new Date(message.sentAt || message.createdAt).toLocaleDateString()}
                        </Text>

                        <Text
                          fontSize="1.2rem"
                          color="gray"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(message);
                          }}
                          style={{ cursor: 'pointer', alignSelf: 'flex-end', userSelect: 'none' }}
                        >
                          ×
                        </Text>
                      </Flex>
                    </Flex>
                    <Text fontSize="0.9rem" color="gray">
                      {(message.body || message.content || '').replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </Text>
                  </Flex>
                </Card>
              )}
            </Collection>
          )}
        </TabItem>
        
        <TabItem title="Archive">
          {getArchivedMessages().length === 0 ? (
            <Card>
              <Text>No archived messages.</Text>
            </Card>
          ) : (
            <Collection
              items={getArchivedMessages()}
              type="list"
              gap="1rem"
              wrap="nowrap"
              direction="column"
            >
              {(message) => (
                <Card 
                  key={message.id}
                  backgroundColor="white"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedMessage(message)}
                >
                  <Flex direction="column" gap="0.5rem">
                    <Flex justifyContent="space-between" alignItems="center">
                      <Text>
                        {message.senderID === (user.id || user.username) ? `To: ${message.receiver?.name || 'Deleted User'}` : `From: ${message.sender?.name || 'Deleted User'}`}
                      </Text>
                      <Text fontSize="0.8rem">
                        {new Date(message.sentAt || message.createdAt).toLocaleDateString()}
                      </Text>
                    </Flex>
                    <Text>{message.subject}</Text>
                    <Text fontSize="0.9rem" color="gray">
                      {(message.body || message.content || '').replace(/<[^>]*>/g, '').substring(0, 100)}...
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
              maxHeight="100vh"
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
                  <Text><strong>Subject:</strong> {selectedMessage.subject}</Text>
                  <Text><strong>{selectedMessage.senderID === (user.id || user.username) ? 'To:' : 'From:'}</strong> {selectedMessage.senderID === (user.id || user.username) ? (selectedMessage.receiver?.name || 'Deleted User') : (selectedMessage.sender?.name || 'Deleted User')}</Text>
                </Flex>
                
                <Divider />
                
                {/* Show full conversation thread */}
                <Flex 
                  direction="column" 
                  gap="1rem" 
                  maxHeight="300px" 
                  style={{ overflowY: 'auto' }}
                  ref={(el) => {
                    if (el) {
                      el.scrollTop = el.scrollHeight;
                    }
                  }}
                >
                  {(selectedMessage.thread || [selectedMessage]).map((msg, index) => (
                    <div key={msg.id || index} style={{ padding: '1rem 0', borderBottom: index < (selectedMessage.thread || [selectedMessage]).length - 1 ? '1px solid #eee' : 'none' }}>
                      <Flex direction="column" gap="0.5rem">
                        <Flex justifyContent="space-between" alignItems="center">
                          <Text fontSize="0.9rem" fontWeight="bold">
                            {msg.senderID === (user.id || user.username) ? user.name : (msg.sender?.name || 'Deleted User')}
                          </Text>
                          <Text fontSize="0.8rem" color="gray">
                            {new Date(msg.sentAt || msg.createdAt).toLocaleString()}
                          </Text>
                        </Flex>
                        <div dangerouslySetInnerHTML={{ __html: cleanHtmlContent(msg.body || msg.content) || 'No content' }} />
                      </Flex>
                    </div>
                  ))}
                </Flex>
                
                <Divider />
                
                <div>
                  <Text fontWeight="bold">Reply</Text>
                  <div style={{ height: '120px' }}>
                    <ReactQuill
                      value={replyText}
                      onChange={(value) => {
                        setReplyText(value);
                        // Auto-save reply draft
                        try {
                          const draftKey = `reply_draft_${user.id || user.username}_${selectedMessage.id}`;
                          localStorage.setItem(draftKey, value);
                        } catch (e) {
                          console.error('Error saving reply draft:', e);
                        }
                      }}
                      placeholder="Type your reply here..."
                      modules={{
                        toolbar: [
                          ['bold', 'italic', 'underline'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['clean']
                        ]
                      }}
                      style={{ height: '80px' }}
                    />
                  </div>
                  
                  <Flex gap="1rem" marginTop="1rem">
                  <Button 
                    onClick={() => {
                      setSelectedMessage(null);
                      setReplyText('');
                    }}
                    backgroundColor="white"
                    color="black"
                    border="1px solid black"
                    size="small"
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={sendReply}
                    backgroundColor="white"
                    color="black"
                    border="1px solid black"
                    size="small"
                    isLoading={isReplying}
                  >
                    Send
                  </Button>
                  </Flex>
                </div>
              </Flex>
            </Card>
          </Flex>
        </View>
      )}
      
      {/* New Message Modal */}
      {showNewMessage && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 1000 }}
          onClick={() => setShowNewMessage(false)}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            height="100%"
            padding="2rem"
          >
            <Card
              maxWidth="600px"
              width="100%"
              onClick={(e) => e.stopPropagation()}
            >
              <Flex direction="column" gap="1rem">
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading level={4}>Send New Message</Heading>
                  <Button size="small" onClick={() => setShowNewMessage(false)}>Close</Button>
                </Flex>
                
                <Divider />
                
                <SelectField
                  label={`Select ${user.role === 'Faculty' ? 'Student' : 'Faculty Member'}`}
                  value={newMessage.recipient}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, recipient: e.target.value }))}
                  required
                >
                  <option value="">Choose recipient...</option>
                  {availableRecipients.map(recipient => (
                    <option key={recipient.id} value={recipient.id}>
                      {recipient.name} ({recipient.email})
                    </option>
                  ))}
                </SelectField>
                
                <TextField
                  label="Subject"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                  required
                />
                
                <div>
                  <Text fontWeight="bold">Message *</Text>
                  <div style={{ height: '300px' }}>
                    <ReactQuill
                      value={newMessage.body}
                      onChange={(value) => {
                        setNewMessage(prev => ({ ...prev, body: value }));
                        // Auto-save new message draft
                        try {
                          const draftKey = `new_message_draft_${user.id || user.username}`;
                          const draftData = { ...newMessage, body: value };
                          localStorage.setItem(draftKey, JSON.stringify(draftData));
                        } catch (e) {
                          console.error('Error saving new message draft:', e);
                        }
                      }}
                      placeholder="Type your message here..."
                      modules={{
                        toolbar: [
                          ['bold', 'italic', 'underline'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['clean']
                        ]
                      }}
                      style={{ height: '250px' }}
                    />
                  </div>
                  
                  <Flex gap="1rem" marginTop="1rem">
                    <Button 
                      onClick={() => {
                        setShowNewMessage(false);
                        setNewMessage({ recipient: '', subject: '', body: '' });
                      }}
                      backgroundColor="white"
                      color="black"
                      border="1px solid black"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={async () => {
                        if (!newMessage.recipient || !newMessage.subject || !newMessage.body) return;
                        
                        setIsSendingNew(true);
                        try {
                          const userId = user.id || user.username;
                          const recipient = availableRecipients.find(r => r.id === newMessage.recipient);
                          
                          // Get all messages to check for existing thread
                          const allMessagesResult = await API.graphql(graphqlOperation(listMessages, { limit: 100 }));
                          const allMessages = allMessagesResult.data?.listMessages?.items || [];
                          
                          // Check for existing thread between these two users
                          const existingThread = allMessages.find(msg => 
                            (msg.senderID === userId && msg.receiverID === newMessage.recipient) ||
                            (msg.senderID === newMessage.recipient && msg.receiverID === userId)
                          );
                          
                          let threadID;
                          if (existingThread) {
                            threadID = existingThread.threadID;
                          } else {
                            // Create consistent thread ID using string comparison
                            threadID = userId < newMessage.recipient ? `${userId}-${newMessage.recipient}` : `${newMessage.recipient}-${userId}`;
                          }
                          
                          const messageInput = {
                            senderID: userId,
                            receiverID: newMessage.recipient,
                            subject: newMessage.subject,
                            body: newMessage.body,
                            isRead: false,
                            sentAt: new Date().toISOString(),
                            threadID: threadID
                          };
                          
                          await API.graphql(graphqlOperation(createMessage, { input: messageInput }));
                          
                          // Create notification
                          const notificationInput = {
                            userID: newMessage.recipient,
                            type: 'MESSAGE_RECEIVED',
                            message: `You have a new message from ${user.name}`,
                            isRead: false
                          };
                          
                          await API.graphql(graphqlOperation(createNotification, { input: notificationInput }));
                          
                          // Send email notification
                          try {
                            await sendEmailNotification(
                              recipient?.email,
                              recipient?.name,
                              user.name,
                              newMessage.subject,
                              newMessage.body,
                              'Research Project'
                            );
                          } catch (emailError) {
                            console.log('Email notification prepared (SES integration pending):', emailError);
                          }
                          
                          setShowNewMessage(false);
                          setNewMessage({ recipient: '', subject: '', body: '' });
                          fetchData(); // Refresh messages
                        } catch (err) {
                          console.error('Error sending message:', err);
                          setError('Failed to send message. Please try again.');
                        } finally {
                          setIsSendingNew(false);
                        }
                      }}
                      backgroundColor="white"
                      color="black"
                      border="1px solid black"
                      isLoading={isSendingNew}
                    >
                      Send
                    </Button>
                  </Flex>
                </div>
              </Flex>
            </Card>
          </Flex>
        </View>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && messageToDelete && (
        <View
          position="fixed"
          top="0"
          left="0"
          width="100vw"
          height="100vh"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 2000 }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <Flex
            justifyContent="center"
            alignItems="center"
            height="100%"
            padding="2rem"
          >
            <Card
              maxWidth="400px"
              width="100%"
              onClick={(e) => e.stopPropagation()}
            >
              <Flex direction="column" gap="1rem">
                <Heading level={4}>Archive Message</Heading>
                <Text>Are you sure you want to archive this message? It will be moved to your Archive folder.</Text>
                <Flex gap="1rem" justifyContent="flex-end">
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    backgroundColor="white"
                    color="black"
                    border="1px solid black"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => archiveMessage(messageToDelete.id)}
                    backgroundColor="white"
                    color="black"
                    border="1px solid black"
                  >
                    Yes
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
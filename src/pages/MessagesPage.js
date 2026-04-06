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
  Loader,
  Badge,
  TextField,
  SelectField,
  View
} from '@aws-amplify/ui-react';
import { listUsers, listApplications, listProjects } from '../graphql/operations';
import { listMessages, createMessage, getMessageThread, updateMessage, deleteMessage } from '../graphql/message-operations';
import { sendEmailNotification } from '../utils/emailNotifications';
import { useNavigate } from 'react-router-dom';
import buttonStyles from '../styles/dashboardButtons.module.css';


// Clean HTML content to remove excessive spacing
const cleanHtmlContent = (html) => {
  if (!html) return '';
  return html
    .replace(/<p><br><\/p>/g, '')
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/<br\s*\/?>/g, ' ')
    .replace(/<\/p>\s*<p>/g, '</p><p>')
    .replace(/\s+/g, ' ')
    .trim();
};
// Color for heading
const getConversationColor = (conversationId) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  // Use conversation ID to consistently get same color
  const index = conversationId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};


const MessagesPage = ({ user }) => {
  const primaryActionButtonClassName = `${buttonStyles.actionButton} ${buttonStyles.actionButtonPrimary} ${buttonStyles.actionButtonCompact}`;
  const secondaryActionButtonClassName = `${buttonStyles.actionButton} ${buttonStyles.actionButtonGhost} ${buttonStyles.actionButtonCompact}`;
  const iconActionButtonClassName = `${buttonStyles.actionButton} ${buttonStyles.actionButtonGhost} ${buttonStyles.actionButtonCompact} ${buttonStyles.actionButtonIcon}`;
  const [locallyReadMessages, setLocallyReadMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [availableRecipients, setAvailableRecipients] = useState([]);
  const [newMessage, setNewMessage] = useState({ recipient: '', subject: '', body: '' });
  const [isSendingNew, setIsSendingNew] = useState(false);
  const [messageScrollRef, setMessageScrollRef] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormatting, setShowFormatting] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [showArchivedConversations, setShowArchivedConversations] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(null);
  const [hasArchivedMessages, setHasArchivedMessages] = useState(false);
  const [isArchivedConversation, setIsArchivedConversation] = useState(false);



  useEffect(() => {
    fetchData();
  }, [user]);
  
  // Scroll to bottom when conversation changes
  useEffect(() => {
    if (selectedConversation && messageScrollRef) {
      setTimeout(() => {
        messageScrollRef.scrollTop = messageScrollRef.scrollHeight;
      }, 100);
    }
  }, [selectedConversation, messageScrollRef]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = user.id || user.username;
      
      // Fetch all messages for this user
      const messageResult = await API.graphql(graphqlOperation(listMessages, { 
        limit: 100
      }));
      
      if (messageResult.errors) {
        console.error('GraphQL errors in listMessages:', messageResult.errors);
      }
      
      // Fetch all users for name lookup
      const usersResult = await API.graphql(graphqlOperation(listUsers, { 
        limit: 100
      }));
      
      const allMessages = messageResult.data?.listMessages?.items || [];
      const allUsers = usersResult.data.listUsers.items;
      
      // Filter messages for current user (sent or received)
      const userMessages = allMessages
        .filter(msg => {
          const isSender = msg.senderID === userId;
          const isReceiver = msg.receiverID === userId;
          
          // Filter out announcement messages only for the sender
          if (isSender && msg.subject && msg.subject.includes('[Announcement to')) {
            return false;
          }
          
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
        msg.threadID = threadId;
        threadGroups[threadId].push(msg);
      });
      
      const readMessages = JSON.parse(localStorage.getItem(`read_messages_${userId}`) || '[]');
      setLocallyReadMessages(readMessages); 

      // Convert to array of conversations, showing latest message first
      const conversations = Object.values(threadGroups)
        .map(thread => {
          const sortedThread = thread.sort((a, b) => new Date(a.sentAt || a.createdAt) - new Date(b.sentAt || b.createdAt));
          const latestMessage = sortedThread[sortedThread.length - 1];
          const threadId = sortedThread[0].threadID;
          
          // Get the other person in the conversation
          const otherPersonId = latestMessage.senderID === userId ? latestMessage.receiverID : latestMessage.senderID;
          const otherPerson = allUsers.find(u => u.id === otherPersonId) || { name: 'Deleted User' };
          
          return {
            id: threadId,
            threadID: threadId,
            thread: sortedThread,
            latestMessage,
            otherPerson,
            hasUnread: sortedThread.some(msg => {
              const isLocallyRead = readMessages.includes(msg.id);
              return msg.receiverID === userId && !msg.isRead && !isLocallyRead && msg.senderID !== userId;
            }),
            lastMessageTime: new Date(latestMessage.sentAt || latestMessage.createdAt)
          };
        })
        .sort((a, b) => b.lastMessageTime - a.lastMessageTime);
      
      // Separate active and archived conversations
let activeConversations, archivedConversations;

if (user.role === 'Student') {
  activeConversations = conversations.filter(conversation => 
    !conversation.thread.some(msg => msg.body && msg.body.startsWith('[ARCHIVED]'))
  );
  archivedConversations = conversations.filter(conversation => 
    conversation.thread.some(msg => msg.body && msg.body.startsWith('[ARCHIVED]'))
  );
} else {
  // Admin/Faculty only see non-archived conversations
  activeConversations = conversations.filter(conversation => 
    !conversation.thread.some(msg => msg.body && msg.body.startsWith('[ARCHIVED]'))
  );
  archivedConversations = [];
}

// Show archived conversations if student clicked "Past Conversations"
const displayedConversations = (user.role === 'Student' && showArchivedConversations) 
  ? archivedConversations 
  : activeConversations;

    setMessages(displayedConversations);

    setMessages(displayedConversations);

      // Check for archived messages for students
    if (user.role === 'Student') {
  setHasArchivedMessages(archivedConversations.length > 0);
}

      setUsers(allUsers);
      
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
      if (user.role === 'Admin') {
        const allOtherUsers = allUsers.filter(u => u.id !== userId);
        setAvailableRecipients(allOtherUsers);
      } else if (user.role === 'Coordinator') {
        const facultyUsers = allUsers.filter(u => u.role === 'Faculty');
        setAvailableRecipients(facultyUsers);
      } else if (user.role === 'Faculty') {
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
      const userId = user.id || user.username;
      
      const readMessages = JSON.parse(localStorage.getItem(`read_messages_${userId}`) || '[]');
      if (!readMessages.includes(messageId)) {
        readMessages.push(messageId);
        localStorage.setItem(`read_messages_${userId}`, JSON.stringify(readMessages));
        setLocallyReadMessages(readMessages);
        
        // Update messages state to trigger re-render
        setMessages(prev => prev.map(conversation => {
          const updatedThread = conversation.thread.map(msg => 
            msg.id === messageId ? { ...msg, isRead: true } : msg
          );
          const hasUnread = updatedThread.some(msg => {
            const isLocallyRead = readMessages.includes(msg.id);
            return msg.receiverID === userId && !msg.isRead && !isLocallyRead && msg.senderID !== userId;
          });
          return { ...conversation, thread: updatedThread, hasUnread };
        }));
      }
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selectedConversation) return;
    
    setIsReplying(true);
    try {
      const userId = user.id || user.username;
      const recipientId = selectedConversation.otherPerson.id;
      
      const messageInput = {
        senderID: userId,
        receiverID: recipientId,
        subject: selectedConversation.latestMessage.subject.startsWith('Re:') ? 
          selectedConversation.latestMessage.subject : 
          `Re: ${selectedConversation.latestMessage.subject}`,
        body: replyText,
        isRead: false,
        sentAt: new Date().toISOString()
      };
      
      await API.graphql(graphqlOperation(createMessage, { input: messageInput }));
      
      // Send email notification for reply
      try {
        const recipient = users.find(u => u.id === recipientId);
        await sendEmailNotification(
          recipient?.email,
          recipient?.name,
          user.name,
          `Re: ${selectedConversation.latestMessage.subject}`,
          replyText,
          'Direct Message'
        );
      } catch (emailError) {
        console.log('Reply email notification prepared (SES integration pending):', emailError);
      }
      
      setReplyText('');

      // Add the new message to the current conversation
const newMessage = {
  id: Date.now().toString(), // Temporary ID
  senderID: userId,
  receiverID: recipientId,
  subject: messageInput.subject,
  body: replyText,
  sentAt: new Date().toISOString(),
  isRead: false
};

// Update the selected conversation with the new message
setSelectedConversation(prev => ({
  ...prev,
  thread: [...prev.thread, newMessage],
  latestMessage: newMessage,
  lastMessageTime: new Date()
}));

// Update the messages list
setMessages(prev => prev.map(conversation => 
  conversation.id === selectedConversation.id 
    ? {
        ...conversation,
        thread: [...conversation.thread, newMessage],
        latestMessage: newMessage,
        lastMessageTime: new Date()
      }
    : conversation
).sort((a, b) => b.lastMessageTime - a.lastMessageTime));

    } catch (err) {
      console.error('Error sending reply:', err);
      setError('Failed to send reply. Please try again.');
    } finally {
      setIsReplying(false);
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
  
    // Check if this conversation is archived
    const isArchived = conversation.thread.some(msg => 
      msg.body && msg.body.startsWith('[ARCHIVED]')
    );
    setIsArchivedConversation(isArchived);
  
   // Mark all unread messages in this conversation as read
   conversation.thread.forEach(msg => {
     if (msg.receiverID === (user.id || user.username) && !msg.isRead) {
       markAsRead(msg.id);
     }
   });
 };


  const deleteMessageHandler = async (messageId) => {
  try {
    await API.graphql(graphqlOperation(deleteMessage, { 
      input: { id: messageId } 
    }));
    
    // Update local state
    setSelectedConversation(prev => ({
      ...prev,
      thread: prev.thread.filter(msg => msg.id !== messageId)
    }));
    
    setMessages(prev => prev.map(conversation => 
      conversation.id === selectedConversation.id 
        ? {
            ...conversation,
            thread: conversation.thread.filter(msg => msg.id !== messageId)
          }
        : conversation
    ));
  } catch (err) {
    console.error('Error deleting message:', err);
    setError('Failed to delete message.');
  }
};

const startEdit = (message) => {
  setEditingMessage(message.id);
  setEditText(message.body);
};

const saveEdit = async (messageId) => {
  try {
    await API.graphql(graphqlOperation(updateMessage, {
      input: { 
        id: messageId, 
        body: editText 
      }
    }));
    
    // Update local state
    setSelectedConversation(prev => ({
      ...prev,
      thread: prev.thread.map(msg => 
        msg.id === messageId ? { ...msg, body: editText } : msg
      )
    }));
    
    setMessages(prev => prev.map(conversation => 
      conversation.id === selectedConversation.id 
        ? {
            ...conversation,
            thread: conversation.thread.map(msg => 
              msg.id === messageId ? { ...msg, body: editText } : msg
            )
          }
        : conversation
    ));
    
    setEditingMessage(null);
    setEditText('');
  } catch (err) {
    console.error('Error updating message:', err);
    setError('Failed to update message.');
  }
};
  const archiveConversation = async (conversationId) => {
  try {
    const conversation = messages.find(c => c.id === conversationId);
    if (!conversation) return;

    const userId = user.id || user.username;
    
    // Only update messages sent by the current user
    for (const msg of conversation.thread) {
      if (msg.senderID === userId) {
        await API.graphql(graphqlOperation(updateMessage, {
          input: { 
            id: msg.id, 
            body: msg.body.startsWith('[ARCHIVED]') ? msg.body : `[ARCHIVED] ${msg.body}`
          }
        }));
      }
    }

    setMessages(prev => prev.filter(c => c.id !== conversationId));
    setSelectedConversation(null);
    setShowDeleteConfirmation(null);
  } catch (err) {
    console.error('Error archiving conversation:', err);
    setError('Failed to archive conversation.');
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
    <View width="100%" minHeight="120vh" backgroundColor="#f5f5f5" padding="0 2rem">
            {/* Header */}
      <Card backgroundColor="white" padding="1.5rem" marginBottom="1.5rem" marginLeft="-6rem">
        <Flex justifyContent="space-between" alignItems="center">
          <Flex direction="column" gap="0.5rem">
            <Heading level={2} color="#2d3748">Messages</Heading>
            <Text color="#4a5568">Communicate with students and faculty</Text>
          </Flex>
          {(user.role === 'Admin' || user.role === 'Faculty') && (
            <Button 
              className={primaryActionButtonClassName}
              size="small"
              onClick={() => setShowNewMessage(true)}
              isDisabled={availableRecipients.length === 0}
            >
              ✉️ New Message
            </Button>
          )}
        </Flex>
      </Card>
      
      {error && (
        <Card backgroundColor="#fed7d7" padding="1rem" border="1px solid #feb2b2" margin="1rem">
          <Text color="#c53030">{error}</Text>
        </Card>
      )}
      
{/* Main Split Layout - Unified Card */}
<Card 
  backgroundColor="white" 
  marginLeft="-6rem" 
  borderRadius="12px"
  padding="0"
  style={{ 
    height: "calc(120vh - 140px)",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    overflow: "hidden"
  }}
>
  <Flex height="100%">
    {/* Left Sidebar - Conversations List (30%) */}
    <View 
          width={{ base: '100%', large: '30%' }} 
          borderRight="1px solid #e2e8f0"
          display={{ base: selectedConversation ? 'none' : 'block', large: 'block' }}
        >
          <Flex direction="column" height="100%">
      <View backgroundColor="white" padding="0 1rem" style={{ height: '1.8rem', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
       <Heading level={4} color="#2d3748">Conversations</Heading>
       {user.role === 'Student' && (
        <Button
          size="small"
          backgroundColor="transparent"
          color="#6b7280"
          onClick={() => navigate('/old-messages')}
          style={{
           fontSize: '16px',
           padding: '2px 4px',
           border: 'none',
           minWidth: 'auto',
           minHeight: 'auto'
         }}
       >
         📁
       </Button>
     )}
   </View>



{/* Search Bar */}
<View padding="0.5rem 1rem" margin="0 6px" backgroundColor="white">
  <TextField
    placeholder="🔍 Search conversations..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    size="small"
    style={{
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      backgroundColor: '#f9fafb',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      fontSize: '14px'
    }}
  />
</View>

            <View flex="1" style={{ overflowY: 'auto' }}>
              {messages.length === 0 ? (
                <Flex direction="column" alignItems="center" gap="1rem" padding="2rem">
                  <Text fontSize="3rem">💬</Text>
                  <Text fontSize="1.1rem" color="#4a5568">No conversations yet</Text>
                  <Text fontSize="0.9rem" color="#718096" textAlign="center">
                    {user.role === 'Student' 
                      ? 'Faculty or admins will message you when needed'
                      : 'Start a conversation by clicking "New Message"'}
                  </Text>
                </Flex>
              ) : (
                <Flex direction="column">
               {messages
  .filter(conversation => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const personName = (conversation.otherPerson.name || '').toLowerCase();
    const messageContent = conversation.thread
      .map(msg => (msg.body || '').replace(/<[^>]*>/g, ''))
      .join(' ')
      .toLowerCase();
    return personName.includes(searchLower) || messageContent.includes(searchLower);
  })
  .map((conversation) => (
    // ... rest of the existing conversation mapping code stays the same

 <Card
  key={conversation.id}
  backgroundColor={selectedConversation?.id === conversation.id ? '#e6f3ff' : 
                 conversation.hasUnread ? '#f0f9ff' : 'white'}
  padding="0"
  borderRadius="0"
  border="none"
  borderBottom="1px solid #e2e8f0"
  style={{ cursor: 'pointer' }}
  margin="0 18px 0 6px"
  onClick={() => selectConversation(conversation)}
>

    <View backgroundColor={getConversationColor(conversation.id)} height="4px" />
    <View padding="1rem">
      <Flex direction="column" gap="0.5rem">
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center" gap="0.5rem">
            <Text fontWeight="600" color="#2d3748">
              {conversation.otherPerson.name || 'Unknown User'}
            </Text>
            {conversation.hasUnread && (
              <Badge backgroundColor="#4299e1" color="white" fontSize="0.7rem">
                New
              </Badge>
            )}
          </Flex>
          <Text fontSize="0.75rem" color="#718096">
            {conversation.lastMessageTime.toLocaleDateString()}
          </Text>
        </Flex>

                  <Flex justifyContent="space-between" alignItems="center">
                      <Text fontSize="0.8rem" color="#718096" style={{ 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap',
                            flex: 1,
                            marginRight: '8px'
                          }}>
                            {(conversation.latestMessage.body || '').replace(/<[^>]*>/g, '').substring(0, 60)}...
                          </Text>
                          
                          {(user.role === 'Admin' || user.role === 'Faculty') && (
                            <Button
                              size="small"
                              backgroundColor="transparent"
                              color="#dc2626"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteConfirmation(conversation.id);
                              }}
                              style={{
                                padding: '2px',
                                fontSize: '14px',
                                minWidth: 'auto',
                                minHeight: 'auto',
                                opacity: '0.7'
                              }}
                            >
                              🗑️
                            </Button>
                          )}
                        </Flex>

                      </Flex>

                    </View>
                  </Card>
                ))}
                </Flex>

              )}
            </View>
          </Flex>
        </View>
            
        {/* Right Panel - Chat View (70%) */}
        <View 
          width={{ base: '100%', large: '70%' }} 
          display={{ base: selectedConversation ? 'block' : 'none', large: 'block' }}
        >
          {selectedConversation ? (
            <Flex direction="column" height="100%">
               {/* Chat Header */}
                <View backgroundColor="white" padding="0 1rem" borderBottom="1px solid #e2e8f0" style={{ height: '1.8rem', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                <Flex justifyContent="space-between" alignItems="center">
                  <Flex alignItems="center" gap="1rem">
                    <Button
                      size="small"
                      backgroundColor="transparent"
                      color="#4a5568"
                      onClick={() => setSelectedConversation(null)}
                      display={{ base: 'block', large: 'none' }}
                    >
                      ← Back
                    </Button>
                      <Flex direction="column">
                      <Text fontWeight="600" fontSize="1rem" color="#2d3748">
                        {selectedConversation.otherPerson.name || 'Unknown User'}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
               </View>

              {/* Messages Area */}
              <View 
                flex="1" 
                padding="1rem" 
                style={{ overflowY: 'auto' }}
                ref={setMessageScrollRef}
              >
                <Flex direction="column" gap="1rem">
                 {selectedConversation.thread.map((msg, index) => (
  <Flex
    key={msg.id || index}
    justifyContent={msg.senderID === (user.id || user.username) ? 'flex-end' : 'flex-start'}
  >
    <div
      style={{
        position: 'relative',
        padding: '0.1rem 0.8rem',
        maxWidth: '70%',
        borderRadius: '1rem',
        background: msg.senderID === (user.id || user.username) 
          ? 'linear-gradient(135deg, #fef3c7, #fde68a)' 
          : 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
        borderBottomRightRadius: msg.senderID === (user.id || user.username) ? '0.25rem' : '1rem',
        borderBottomLeftRadius: msg.senderID === (user.id || user.username) ? '1rem' : '0.25rem',
      }}
      onMouseEnter={() => setHoveredMessage(msg.id)}
      onMouseLeave={() => setHoveredMessage(null)}
    >
      {/* Three-dot menu - only show for user's own messages */}
{msg.senderID === (user.id || user.username) && hoveredMessage === msg.id && (
  <div
    style={{
      position: 'absolute',
      right: '8px',
      top: '8px',
      background: 'transparent',
      borderRadius: '4px',
      border: 'none',
      zIndex: 10
    }}
  >
         <Button
           size="small"
           backgroundColor="transparent"
           color="#666"
           style={{ 
            padding: '2px', 
            fontSize: '16px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            opacity: '0.3',
            minWidth: 'auto',
            minHeight: 'auto'
           }}

            onClick={(e) => {
              e.stopPropagation();
              const rect = e.target.getBoundingClientRect();
              const menu = document.createElement('div');
              menu.style.cssText = `
                position: fixed;
                top: ${rect.bottom + 5}px;
                left: ${rect.left - 60}px;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 1000;
                min-width: 80px;
              `;
              menu.innerHTML = `
                <div style="padding: 8px 0;">
                  <button onclick="this.parentElement.parentElement.remove(); window.editMessage('${msg.id}')" 
                          style="width: 100%; padding: 8px 16px; border: none; background: none; text-align: left; cursor: pointer; font-size: 14px;">
                    Edit
                  </button>
                  <button onclick="this.parentElement.parentElement.remove(); window.deleteMessage('${msg.id}')" 
                          style="width: 100%; padding: 8px 16px; border: none; background: none; text-align: left; cursor: pointer; color: #dc2626; font-size: 14px;">
                    Delete
                  </button>
                </div>
              `;
              document.body.appendChild(menu);
              
              // Global functions for menu actions
              window.editMessage = (id) => startEdit(msg);
              window.deleteMessage = (id) => deleteMessageHandler(id);
              
              // Close menu when clicking outside
              setTimeout(() => {
                const closeMenu = (e) => {
                  if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                  }
                };
                document.addEventListener('click', closeMenu);
              }, 100);
            }}
          >
            ⋮
          </Button>
        </div>
      )}

      <Flex direction="column" gap="0rem">
        {editingMessage === msg.id ? (
          <div style={{ padding: '8px 0' }}>
            <ReactQuill
              value={editText}
              onChange={setEditText}
              style={{ minHeight: '60px', background: 'white', borderRadius: '4px' }}
            />
            <Flex gap="8px" marginTop="8px">
              <Button size="small" onClick={() => saveEdit(msg.id)} backgroundColor="#4299e1" color="white">
                Save
              </Button>
              <Button size="small" onClick={() => setEditingMessage(null)} backgroundColor="#e2e8f0" color="#666">
                Cancel
              </Button>
            </Flex>
          </div>
        ) : (
          <>
            <div 
              style={{ 
                color: msg.senderID === (user.id || user.username) ? '#ffffff !important' : '#2d3748',
                fontSize: '0.9rem',
                lineHeight: '1',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }} 
              dangerouslySetInnerHTML={{ 
                __html: cleanHtmlContent(msg.body || msg.content) || 'No content' 
              }} 
            />
            <Text 
              fontSize="0.7rem" 
              color={msg.senderID === (user.id || user.username) ? 'rgba(255,255,255,0.8)' : '#718096'}
              textAlign="right"
            >
              {new Date(msg.sentAt || msg.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
               })}
            </Text>
          </>
        )}
      </Flex>
    </div>
  </Flex>
))}
                </Flex>
              </View>
             
              {/* Reply Input */}
<View backgroundColor="white" padding="1rem 0.5rem 0.5rem 1rem" borderTop="1px solid #e2e8f0">
  <Flex direction="column" gap="0.5rem">
        <div style={{ 
      border: '2px solid #e2e8f0', 
      borderRadius: '12px', 
      overflow: 'hidden',
      transition: 'border-color 0.2s ease',
      ':focus-within': { borderColor: '#4299e1' }
    }}>
      <ReactQuill
  key={showFormatting ? 'with-toolbar' : 'without-toolbar'}
  value={replyText}
  onChange={setReplyText}
  placeholder="Type your reply..."
  modules={{
    toolbar: showFormatting ? [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ] : false
  }}
  style={{ 
  minHeight: showFormatting ? '100px' : '40px',
  maxHeight: '200px',
  border: 'none',
  overflow: 'auto'
}}
/>

    </div>

    <Flex justifyContent="space-between" alignItems="center">
      <Button 
        onClick={() => setShowFormatting(!showFormatting)}
        backgroundColor="transparent"
        color="#6b7280"
        size="small"
        style={{ 
          fontSize: '14px',
          fontWeight: 'bold',
          padding: '4px 8px',
          border: '1px solid #e5e7eb',
          borderRadius: '6px'
        }}
      >
        Aa
      </Button>
      <Button 
       onClick={sendReply}
       backgroundColor="#4f46e5"
       color="white"
       size="small"
       isLoading={isReplying}
       isDisabled={!replyText.trim() || isArchivedConversation}
       style={{
         borderRadius: '8px',
         padding: '8px 16px',
         fontWeight: '600'
     }}
   >
  {isArchivedConversation ? 'Chat Ended' : 'Send'}
</Button>

    </Flex>
  </Flex>
</View>
         </Flex>
          ) : (
            <Flex direction="column" alignItems="center" justifyContent="center" height="100%" gap="1rem">
              <Text fontSize="3rem">💬</Text>
              <Text fontSize="1.2rem" color="#4a5568">Select a conversation to start messaging</Text>
              <Text fontSize="0.9rem" color="#718096" textAlign="center">
                Choose a conversation from the left sidebar to view and reply to messages
              </Text>
            </Flex>
          )}
        </View>
      </Flex>
    </Card>


      {/* New Message Modal - Only for Admin/Faculty */}
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
            padding="1rem"
          >
            <Card
              maxWidth="600px"
              width="90%"
              backgroundColor="white"
              onClick={(e) => e.stopPropagation()}
            >
              <Flex direction="column" gap="1.5rem" padding="2rem">
                <Flex justifyContent="space-between" alignItems="center">
                  <Heading level={3} color="#2d3748">Send New Message</Heading>
                  <Button
                    size="small"
                    data-close-button="true"
                    className={iconActionButtonClassName}
                    aria-label="Close new message modal"
                    onClick={() => setShowNewMessage(false)}
                  >
                    <span className="closeButtonGlyph" aria-hidden="true">&times;</span>
                  </Button>
                </Flex>
                
                <Flex direction="column" gap="1rem">
                  <SelectField
                    label={`Select ${user.role === 'Admin' ? 'User' : 'Student'}`}
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
                  
                  <div style={{ height: '120px' }}>
                    <Text fontSize="0.9rem" fontWeight="600" color="#374151" marginBottom="0.5rem">Message</Text>
                    <ReactQuill
                      value={newMessage.body}
                      onChange={(value) => setNewMessage(prev => ({ ...prev, body: value }))}
                      placeholder="Type your message here..."
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
                </Flex>
                
                <Flex gap="1rem" justifyContent="flex-end" marginTop="1rem">
                  <Button 
                    className={secondaryActionButtonClassName}
                    onClick={() => {
                      setShowNewMessage(false);
                      setNewMessage({ recipient: '', subject: '', body: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className={primaryActionButtonClassName}
                    onClick={async () => {
                      if (!newMessage.recipient || !newMessage.subject || !newMessage.body) return;
                      
                      setIsSendingNew(true);
                      try {
                        const userId = user.id || user.username;
                        const recipient = availableRecipients.find(r => r.id === newMessage.recipient);
                        
                        const messageInput = {
                          senderID: userId,
                          receiverID: newMessage.recipient,
                          subject: newMessage.subject,
                          body: newMessage.body,
                          isRead: false,
                          sentAt: new Date().toISOString(),
                        };
                        
                        await API.graphql(graphqlOperation(createMessage, { input: messageInput }));
                        
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
                    isLoading={isSendingNew}
                    isDisabled={!newMessage.recipient || !newMessage.subject || !newMessage.body}
                  >
                    Send Message
                  </Button>
                </Flex>
              </Flex>
            </Card>
          </Flex>
        </View>
      )}
       {showDeleteConfirmation && (
      <View
        position="fixed"
        top="0"
        left="0"
        width="100vw"
        height="100vh"
        backgroundColor="rgba(0, 0, 0, 0.5)"
        style={{ zIndex: 1000 }}
        onClick={() => setShowDeleteConfirmation(null)}
      >
        <Flex
          justifyContent="center"
          alignItems="center"
          height="100%"
          padding="1rem"
        >
          <Card
            maxWidth="400px"
            width="90%"
            backgroundColor="white"
            onClick={(e) => e.stopPropagation()}
          >
            <Flex direction="column" gap="1rem" padding="1.5rem">
              <Heading level={4} color="#2d3748">Delete Conversation</Heading>
              <Text color="#4a5568">
                Are you sure you want to delete this conversation? This will archive it for the student but remove it from your view.
              </Text>
              <Flex gap="1rem" justifyContent="flex-end">
                <Button 
                  onClick={() => setShowDeleteConfirmation(null)}
                  backgroundColor="white"
                  color="#4a5568"
                  border="1px solid #e2e8f0"
                >
                  Cancel
                </Button>
                <Button 
                onClick={() => {
                   console.log('Delete button clicked!');
                   console.log('Conversation ID:', showDeleteConfirmation);
                   archiveConversation(showDeleteConfirmation);
                    }}
                  backgroundColor="#dc2626"
                  color="white"
                >
                  Delete
                 </Button>

              </Flex>
            </Flex>
          </Card>
        </Flex>
      </View>
    )}
    </View>
  );
};

export default MessagesPage;

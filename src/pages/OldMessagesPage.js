import React, { useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { 
  Flex, 
  Heading, 
  Text, 
  Button, 
  Card, 
  Loader,
  Badge,
  TextField,
  View
} from '@aws-amplify/ui-react';
import { listUsers } from '../graphql/operations';
import { listMessages } from '../graphql/message-operations';
import { useNavigate } from 'react-router-dom';
import RichTextContent from '../components/common/RichTextContent';
import { richTextToPlainText } from '../utils/richText';
import buttonStyles from '../styles/dashboardButtons.module.css';

const getMessagePreview = (html = '', maxLength = 60) => {
  const text = richTextToPlainText(html);

  if (!text) {
    return 'No content';
  }

  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// Color for heading
const getConversationColor = (conversationId) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  const index = conversationId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};


const OldMessagesPage = ({ user }) => {
  const primaryActionButtonClassName = `${buttonStyles.actionButton} ${buttonStyles.actionButtonPrimary} ${buttonStyles.actionButtonCompact}`;
  const secondaryActionButtonClassName = `${buttonStyles.actionButton} ${buttonStyles.actionButtonGhost} ${buttonStyles.actionButtonCompact}`;
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = user.id || user.username;
      
      const messageResult = await API.graphql(graphqlOperation(listMessages, { 
        limit: 100
      }));
      
      const usersResult = await API.graphql(graphqlOperation(listUsers, { 
        limit: 100
      }));
      
      const allMessages = messageResult.data?.listMessages?.items || [];
      const allUsers = usersResult.data.listUsers.items;
      
      const userMessages = allMessages
        .filter(msg => {
          const isSender = msg.senderID === userId;
          const isReceiver = msg.receiverID === userId;
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
      
      const threadGroups = {};
      userMessages.forEach(msg => {
        const threadId = msg.threadID || (msg.senderID < msg.receiverID ? `${msg.senderID}-${msg.receiverID}` : `${msg.receiverID}-${msg.senderID}`);
        if (!threadGroups[threadId]) {
          threadGroups[threadId] = [];
        }
        msg.threadID = threadId;
        threadGroups[threadId].push(msg);
      });

      const conversations = Object.values(threadGroups)
        .map(thread => {
          const sortedThread = thread.sort((a, b) => new Date(a.sentAt || a.createdAt) - new Date(b.sentAt || b.createdAt));
          const latestMessage = sortedThread[sortedThread.length - 1];
          const threadId = sortedThread[0].threadID;
          
          const otherPersonId = latestMessage.senderID === userId ? latestMessage.receiverID : latestMessage.senderID;
          const otherPerson = allUsers.find(u => u.id === otherPersonId) || { name: 'Deleted User' };
          
          return {
            id: threadId,
            threadID: threadId,
            thread: sortedThread,
            latestMessage,
            otherPerson,
            lastMessageTime: new Date(latestMessage.sentAt || latestMessage.createdAt)
          };
        })
        .filter(conversation => 
          conversation.thread.some(msg => msg.body && msg.body.startsWith('[ARCHIVED]'))
        )
        .sort((a, b) => b.lastMessageTime - a.lastMessageTime);

      setMessages(conversations);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
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
            <Heading level={2} color="#2d3748">Old Messages</Heading>
            <Text color="#4a5568">View your past conversations</Text>
          </Flex>
          <Button
            type="button"
            data-dashboard-button="true"
            className={primaryActionButtonClassName}
            onClick={() => navigate('/messages')}
          >
            <span aria-hidden="true">&larr;</span> Back to Messages
          </Button>
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
              <View backgroundColor="white" padding="0 1rem" style={{ height: '1.8rem', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                <Heading level={4} color="#2d3748">Past Conversations</Heading>
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
                    <Text fontSize="3rem">📁</Text>
                    <Text fontSize="1.1rem" color="#4a5568">No old conversations</Text>
                    <Text fontSize="0.9rem" color="#718096" textAlign="center">
                      Your archived conversations will appear here
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
                          .map(msg => richTextToPlainText(msg.body || msg.content || ''))
                          .join(' ')
                          .toLowerCase();
                        return personName.includes(searchLower) || messageContent.includes(searchLower);
                      })
                      .map((conversation) => (
                        <Card
                          key={conversation.id}
                          backgroundColor={selectedConversation?.id === conversation.id ? '#e6f3ff' : 'white'}
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
                                  <Badge backgroundColor="#9ca3af" color="white" fontSize="0.7rem">
                                    Archived
                                  </Badge>
                                </Flex>
                                <Text fontSize="0.75rem" color="#718096">
                                  {conversation.lastMessageTime.toLocaleDateString()}
                                </Text>
                              </Flex>
                              <Text fontSize="0.8rem" color="#718096" style={{ 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis', 
                                whiteSpace: 'nowrap'
                              }}>
                                {getMessagePreview(conversation.latestMessage.body || conversation.latestMessage.content || '')}
                              </Text>
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
                        type="button"
                        data-dashboard-button="true"
                        className={secondaryActionButtonClassName}
                        onClick={() => setSelectedConversation(null)}
                        display={{ base: 'block', large: 'none' }}
                      >
                        <span aria-hidden="true">&larr;</span> Back
                      </Button>
                      <Flex direction="column">
                        <Text fontWeight="600" fontSize="1rem" color="#2d3748">
                          {selectedConversation.otherPerson.name || 'Unknown User'} (Archived)
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
                >
                  <Flex direction="column" gap="1rem">
                    {selectedConversation.thread.map((msg, index) => (
                      <Flex
                        key={msg.id || index}
                        justifyContent={msg.senderID === (user.id || user.username) ? 'flex-end' : 'flex-start'}
                      >
                        <div
                          style={{
                            padding: '0.1rem 0.8rem',
                            maxWidth: '70%',
                            borderRadius: '1rem',
                            background: msg.senderID === (user.id || user.username) 
                              ? 'linear-gradient(135deg, #fef3c7, #fde68a)' 
                              : 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                            borderBottomRightRadius: msg.senderID === (user.id || user.username) ? '0.25rem' : '1rem',
                            borderBottomLeftRadius: msg.senderID === (user.id || user.username) ? '1rem' : '0.25rem',
                          }}
                        >
                          <Flex direction="column" gap="0rem">
                            <RichTextContent
                              html={msg.body || msg.content}
                              fallback={<span>No content</span>}
                              style={{ 
                                color: msg.senderID === (user.id || user.username) ? '#ffffff !important' : '#2d3748',
                                fontSize: '0.9rem',
                                lineHeight: '1'
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
                          </Flex>
                        </div>
                      </Flex>
                    ))}
                  </Flex>
                </View>
               
                {/* Read-only notice */}
                <View backgroundColor="#f9fafb" padding="1rem" borderTop="1px solid #e2e8f0">
                  <Text fontSize="0.9rem" color="#6b7280" textAlign="center">
                    This conversation is archived and read-only
                  </Text>
                </View>
              </Flex>
            ) : (
              <Flex direction="column" alignItems="center" justifyContent="center" height="100%" gap="1rem">
                <Text fontSize="3rem">📁</Text>
                <Text fontSize="1.2rem" color="#4a5568">Select a conversation to view</Text>
                <Text fontSize="0.9rem" color="#718096" textAlign="center">
                  Choose an archived conversation from the left sidebar to view its messages
                </Text>
              </Flex>
            )}
          </View>
        </Flex>
      </Card>
    </View>
  );
};

export default OldMessagesPage;

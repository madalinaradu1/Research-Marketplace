import React, { useState, useEffect, useRef } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { Flex, Text, Button, TextField, View, Loader } from '@aws-amplify/ui-react';
import { createConversation, listConversations, createMessage, listMessages, onCreateMessage } from '../graphql/conversation-operations';

const ChatDrawer = ({ isOpen, onClose, postId, facultyId, studentId, studentName, currentUserId }) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      initConversation();
    }
  }, [isOpen, postId, facultyId, studentId]);

  useEffect(() => {
    if (conversation?.id) {
      const subscription = API.graphql(
        graphqlOperation(onCreateMessage, { conversationId: conversation.id })
      ).subscribe({
        next: ({ value }) => {
          const newMsg = value.data.onCreateMessage;
          setMessages(prev => [...prev, newMsg]);
        },
        error: (error) => console.warn('Subscription error:', error)
      });

      return () => subscription.unsubscribe();
    }
  }, [conversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initConversation = async () => {
    setLoading(true);
    try {
      const conversationId = `${postId}-${facultyId}-${studentId}`;
      
      // Try to get existing conversation
      const filter = {
        and: [
          { postId: { eq: postId } },
          { facultyId: { eq: facultyId } },
          { studentId: { eq: studentId } }
        ]
      };
      
      const result = await API.graphql(graphqlOperation(listConversations, { filter, limit: 1 }));
      let conv = result.data.listConversations.items[0];

      // Create if doesn't exist
      if (!conv) {
        const createResult = await API.graphql(
          graphqlOperation(createConversation, {
            input: { id: conversationId, postId, facultyId, studentId, lastMessageAt: new Date().toISOString() }
          })
        );
        conv = createResult.data.createConversation;
      }

      setConversation(conv);

      // Load messages
      const msgResult = await API.graphql(
        graphqlOperation(listMessages, {
          filter: { conversationId: { eq: conv.id } },
          limit: 100
        })
      );
      setMessages(msgResult.data.listMessages.items.sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      ));
    } catch (error) {
      console.error('Error initializing conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !conversation) return;

    setSending(true);
    try {
      await API.graphql(
        graphqlOperation(createMessage, {
          input: {
            conversationId: conversation.id,
            senderId: currentUserId,
            body: newMessage.trim(),
            createdAt: new Date().toISOString()
          }
        })
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <View
      position="fixed"
      top="0"
      right="0"
      width="400px"
      height="100vh"
      backgroundColor="#1a1a1a"
      style={{
        zIndex: 2000,
        boxShadow: '-4px 0 12px rgba(0,0,0,0.3)',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease'
      }}
    >
      <Flex direction="column" height="100%">
        {/* Header */}
        <Flex
          padding="1rem"
          backgroundColor="#2d2d2d"
          justifyContent="space-between"
          alignItems="center"
          style={{ borderBottom: '1px solid #404040' }}
        >
          <Flex direction="column">
            <Text color="white" fontWeight="600" fontSize="1.1rem">
              {studentName}
            </Text>
            <Text color="#9CA3AF" fontSize="0.85rem">
              Post Conversation
            </Text>
          </Flex>
          <Button
            size="small"
            backgroundColor="transparent"
            color="#9CA3AF"
            border="none"
            data-close-button="true"
            onClick={onClose}
            style={{ fontSize: '1.5rem', padding: '0.25rem' }}
          >
            <span className="closeButtonGlyph" aria-hidden="true">&times;</span>
          </Button>
        </Flex>

        {/* Messages */}
        <Flex
          direction="column"
          flex="1"
          padding="1rem"
          style={{ overflowY: 'auto', gap: '1rem' }}
        >
          {loading ? (
            <Flex justifyContent="center" alignItems="center" height="100%">
              <Loader />
            </Flex>
          ) : messages.length === 0 ? (
            <Flex direction="column" alignItems="center" justifyContent="center" height="100%" gap="0.5rem">
              <Text color="#6B7280" fontSize="0.95rem">No messages yet</Text>
              <Text color="#4B5563" fontSize="0.85rem">Start the conversation!</Text>
            </Flex>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.senderId === currentUserId;
              return (
                <Flex
                  key={msg.id}
                  justifyContent={isOwn ? 'flex-end' : 'flex-start'}
                >
                  <View
                    backgroundColor={isOwn ? '#3B82F6' : '#374151'}
                    padding="0.75rem 1rem"
                    borderRadius="12px"
                    maxWidth="75%"
                  >
                    <Text color="white" fontSize="0.95rem" style={{ wordBreak: 'break-word' }}>
                      {msg.body}
                    </Text>
                    <Text color="#D1D5DB" fontSize="0.75rem" marginTop="0.25rem">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </Flex>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </Flex>

        {/* Input */}
        <Flex
          padding="1rem"
          backgroundColor="#2d2d2d"
          gap="0.5rem"
          style={{ borderTop: '1px solid #404040' }}
        >
          <TextField
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            style={{
              flex: 1,
              backgroundColor: '#1a1a1a',
              border: '1px solid #404040',
              color: 'white',
              borderRadius: '8px'
            }}
          />
          <Button
            onClick={handleSend}
            isLoading={sending}
            disabled={!newMessage.trim()}
            backgroundColor="#3B82F6"
            color="white"
            style={{ borderRadius: '8px', minWidth: '80px' }}
          >
            Send
          </Button>
        </Flex>
      </Flex>
    </View>
  );
};

export default ChatDrawer;

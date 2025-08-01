import React, { createContext, useContext, useState, useEffect } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { listMessages } from '../graphql/message-operations';

const MessageContext = createContext();

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

export const MessageProvider = ({ children, user }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!user) return;
    
    try {
      const userId = user.id || user.username;
      const messageResult = await API.graphql(graphqlOperation(listMessages, { 
        limit: 100
      }));
      
      const allMessages = messageResult.data?.listMessages?.items || [];
      const unreadMessages = allMessages.filter(msg => 
        msg.receiverID === userId && !msg.isRead
      );
      
      setUnreadCount(unreadMessages.length);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAllAsViewed = () => {
    setUnreadCount(0);
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <MessageContext.Provider value={{
      unreadCount,
      fetchUnreadCount,
      markAllAsViewed
    }}>
      {children}
    </MessageContext.Provider>
  );
};
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API, graphqlOperation } from 'aws-amplify';
import { listMessages } from '../graphql/message-operations';
import {
  Flex,
  Image,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  useTheme,
  View,
  SearchField
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';
import { isUserAdmin } from '../utils/isUserAdmin';

const Header = ({ user, signOut }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tokens = {
    colors: {
      primary: { 80: '#3a5a8f' },
      neutral: { 80: '#424242' },
      white: '#ffffff'
    },
    space: {
      small: '0.5rem',
      medium: '1rem'
    },
    fontSizes: {
      small: '0.875rem',
      large: '1.25rem'
    },
    fontWeights: {
      normal: '400',
      bold: '700'
    }
  }} = useTheme() || {};
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Check if the current path matches the given path
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Handle sign out
  const handleSignOut = () => {
    signOut();
    navigate('/');
  };
  
  const fetchUnreadCount = async () => {
    if (!user || !user.id) return;
    
    try {
      const userId = user.id || user.username;
      if (!userId) return;
      
      const messageResult = await API.graphql(graphqlOperation(listMessages, { 
        limit: 100
      }));
      
      const allMessages = messageResult.data?.listMessages?.items || [];
      const unreadMessages = allMessages.filter(msg => 
        msg.receiverID === userId && !msg.isRead
      );
      
      setUnreadCount(unreadMessages.length);
    } catch (error) {
      // Only log error if it's not a "No current user" error
      if (!error.message?.includes('No current user')) {
        console.error('Error fetching unread count:', error);
      }
      setUnreadCount(0);
    }
  };
  
  useEffect(() => {
    if (user && user.id) {
      fetchUnreadCount();
      
      // Poll for new messages every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);
  
  useEffect(() => {
    // Clear unread count when visiting messages page
    if (location.pathname === '/messages') {
      setUnreadCount(0);
    }
  }, [location.pathname]);

  return (
    <>
      <style>
        {`
          .header-search-field input {
            color: white !important;
            border: 1px solid white !important;
          }
          .header-search-field input::placeholder {
            color: white !important;
            opacity: 0.8;
          }
          .header-search-field input:focus {
            border: 1px solid white !important;
            outline: none !important;
            box-shadow: none !important;
          }
          .header-search-field button {
            background-color: white !important;
            color: gray !important;
          }
          .header-search-field button:hover {
            background-color: white !important;
            color: gray !important;
            outline: none !important;
            box-shadow: none !important;
          }
          .header-search-field button:focus {
            outline: none !important;
            box-shadow: none !important;
          }
          .header-search-field svg {
            fill: gray !important;
            stroke: gray !important;
          }
        `}
      </style>
      <Flex
        as="header"
        direction="column"
        backgroundColor="#552b9a"
        boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
        position="sticky"
        top="0"
        style={{ zIndex: 100 }}
      >
      {/* Top banner with logo and title */}
      <Flex
        direction="row"
        alignItems="flex-end"
        justifyContent="flex-start"
        padding="0.05rem 0.25rem 0.1rem"
        gap={tokens.space.small}
        minHeight="20px"
      >
        <Link to="/dashboard" style={{ textDecoration: 'none', position: 'relative', zIndex: 10, outline: 'none' }}>
          <Flex direction="row" alignItems="flex-end" gap={tokens.space.small} marginTop="25px" marginBottom="-10px">
            <Image
              alt="GCU Logo"
              src="/GCU_WHITE.png"
              height="50px"
              objectFit="contain"
              marginBottom="0px"
              marginTop="15px"
              paddingLeft="20px"
            />
            <Flex direction="column" gap="0">
              <Text
                fontSize={tokens.fontSizes.medium}
                fontWeight={tokens.fontWeights.bold}
                color="white"
              >
                Undergraduate Research
              </Text>
              <Text
                fontSize={tokens.fontSizes.medium}
                fontWeight={tokens.fontWeights.bold}
                color="white"
              >
                Opportunity Program
              </Text>
              <Text
                fontSize={tokens.fontSizes.medium}
                color="white"
              >
                Grand Canyon University
              </Text>
            </Flex>
          </Flex>
        </Link>
      </Flex>
      
      {/* Navigation bar */}
      <Flex
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        padding="0 0.25rem"
        marginTop="-3.5rem"
      >
      {/* Navigation spacer */}
      <View />

      {/* Desktop Navigation */}
      <Flex
        direction="row"
        alignItems="center"
        gap={tokens.space.medium}
        display={{ base: 'none', xl: 'flex' }}
        padding="1.5rem 2rem"
      >
        <Link to="/dashboard" style={{ textDecoration: isActive('/dashboard') ? 'underline white' : 'none' }}>
          <Text
            color={isActive('/dashboard') ? "white" : "rgba(255,255,255,0.8)"}
            fontWeight={isActive('/dashboard') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
          >
            Dashboard
          </Text>
        </Link>

        <Link to="/activity" style={{ textDecoration: isActive('/activity') ? 'underline white' : 'none' }}>
          <Text
            color={isActive('/activity') ? "white" : "rgba(255,255,255,0.8)"}
            fontWeight={isActive('/activity') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
          >
            My Activity
          </Text>
        </Link>
        <Link to="/messages" style={{ position: 'relative', textDecoration: isActive('/messages') ? 'underline white' : 'none' }}>
          <Text
            color={isActive('/messages') ? "white" : "rgba(255,255,255,0.8)"}
            fontWeight={isActive('/messages') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
          >
            Messages
          </Text>
          {unreadCount > 0 && (
            <View
              position="absolute"
              top="-8px"
              right="-8px"
              width="16px"
              height="16px"
              borderRadius="50%"
              backgroundColor="red"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="10px" color="white" fontWeight="bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </Link>
        <Link to="/community" style={{ textDecoration: isActive('/community') ? 'underline white' : 'none' }}>
          <Text
            color={isActive('/community') ? "white" : "rgba(255,255,255,0.8)"}
            fontWeight={isActive('/community') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
          >
            Community
          </Text>
        </Link>




        <SearchField
          placeholder="Search research opportunities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            }
          }}
          onSubmit={() => navigate(`/search?q=${encodeURIComponent(searchTerm)}`)}
          width="300px"
          size="small"
          style={{
            '--amplify-components-field-border-color': 'white',
            '--amplify-components-field-color': 'white',
            '--amplify-components-field-background-color': 'transparent',
            '--amplify-components-field-focus-border-color': 'white',
            '--amplify-components-field-focus-box-shadow': 'none',
            '--amplify-components-searchfield-button-color': 'white',
            '--amplify-components-button-color': 'white',
            '--amplify-components-button-primary-color': 'white',
            color: 'white',
            border: '1px solid white',
            outline: 'none'
          }}
          className="header-search-field"
        />
        <View style={{ position: 'relative' }}>
          <Button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            onMouseEnter={() => setIsMenuOpen(true)}
            backgroundColor="white" 
            color="#552b9a"
            size="small"
            style={{
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              padding: '0',
              outline: 'none',
              boxShadow: 'none'
            }}
          >
            👤
          </Button>
          
          {isMenuOpen && (
            <Flex 
              direction="column" 
              gap="0.5rem" 
              backgroundColor="white" 
              padding="0.5rem" 
              style={{ 
                position: 'absolute', 
                top: '100%', 
                right: '0', 
                minWidth: '250px', 
                zIndex: 1001, 
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                border: '1px solid #ccc'
              }}
              onMouseLeave={() => setIsMenuOpen(false)}
            >
              <Flex direction="row" alignItems="center" gap="1rem">
                <View
                  style={{
                    width: '60px',
                    height: '60px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '30px'
                  }}
                >
                  👤
                </View>
                <Flex direction="column" gap="0.5rem" flex="1">
                  <Text fontSize="0.9rem" fontWeight="bold" color="black">
                    Hello, {user?.email ? user.email.split('@')[0] : user?.username || 'User'}
                  </Text>
                  <Button onClick={() => { navigate('/profile'); setIsMenuOpen(false); }} backgroundColor="white" color="black" border="none" size="small" justifyContent="flex-start">Edit Profile</Button>
                  <Button onClick={() => { handleSignOut(); setIsMenuOpen(false); }} backgroundColor="white" color="black" border="none" size="small" justifyContent="flex-start">Sign Out</Button>
                </Flex>
              </Flex>
            </Flex>
          )}
        </View>
      </Flex>
      </Flex>

      {/* Mobile Navigation */}
      <Flex justifyContent="flex-end" display={{ base: 'flex', xl: 'none' }} padding="1rem 2rem">
        <View style={{ position: 'relative' }}>
          <Button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Navigation Menu"
            backgroundColor="white"
            color="black"
            border="1px solid white"
            style={{ alignSelf: 'flex-start', marginTop: '-0.5rem' }}
          >
            <Flex direction="column" gap="4px">
              <View height="2px" width="24px" backgroundColor="black" />
              <View height="2px" width="24px" backgroundColor="black" />
              <View height="2px" width="24px" backgroundColor="black" />
            </Flex>
          </Button>
          
          {isMenuOpen && (
            <Flex 
              direction="column" 
              gap="0.5rem" 
              backgroundColor="white" 
              padding="1rem" 
              style={{ 
                position: 'absolute', 
                top: '100%', 
                right: '0', 
                minWidth: '200px', 
                zIndex: 1001, 
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                border: '1px solid #ccc'
              }}
            >
              <Button onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }} backgroundColor="white" color="black" border="none" justifyContent="flex-start">Dashboard</Button>
              <Button onClick={() => { navigate('/search'); setIsMenuOpen(false); }} backgroundColor="white" color="black" border="none" justifyContent="flex-start">Search</Button>
              <Button onClick={() => { navigate('/activity'); setIsMenuOpen(false); }} backgroundColor="white" color="black" border="none" justifyContent="flex-start">My Activity</Button>
              <Button onClick={() => { navigate('/messages'); setIsMenuOpen(false); }} backgroundColor="white" color="black" border="none" justifyContent="flex-start">Messages</Button>
              <Button onClick={() => { navigate('/community'); setIsMenuOpen(false); }} backgroundColor="white" color="black" border="none" justifyContent="flex-start">Community</Button>

              {user?.role === 'Student' && (
                <Button onClick={() => { navigate('/profile'); setIsMenuOpen(false); }} backgroundColor="white" color="black" border="none" justifyContent="flex-start">Profile</Button>
              )}

              <Button onClick={() => { handleSignOut(); setIsMenuOpen(false); }} backgroundColor="white" color="black" border="none" justifyContent="flex-start">Sign Out</Button>
            </Flex>
          )}
        </View>
      </Flex>
      </Flex>
    </>
  );
};

export default Header;
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
          <Flex direction="row" alignItems="flex-end" gap={tokens.space.small}>
            <Image
              alt="GCU Logo"
              src="/GCU_WHITE.png"
              height="50px"
              objectFit="contain"
              marginBottom="10px"
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
        display={{ base: 'none', medium: 'flex' }}
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

        {user?.role === 'Student' && (
          <Link to="/profile" style={{ textDecoration: isActive('/profile') ? 'underline white' : 'none' }}>
            <Text
              color={isActive('/profile') ? "white" : "rgba(255,255,255,0.8)"}
              fontWeight={isActive('/profile') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
            >
              Profile
            </Text>
          </Link>
        )}


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
        <Button 
          onClick={handleSignOut} 
          backgroundColor="white" 
          color="#552b9a"
          size="small"
          style={{
            transition: 'transform 0.2s ease',
            outline: 'none',
            boxShadow: 'none'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.backgroundColor = 'white';
            e.target.style.outline = 'none';
            e.target.style.boxShadow = 'none';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.backgroundColor = 'white';
            e.target.style.outline = 'none';
            e.target.style.boxShadow = 'none';
          }}
          onFocus={(e) => {
            e.target.style.outline = 'none';
            e.target.style.boxShadow = 'none';
          }}
        >
          Sign Out
        </Button>
      </Flex>
      </Flex>

      {/* Mobile Navigation */}
      <View display={{ base: 'block', medium: 'none' }}>
        <Menu
          isOpen={isMenuOpen}
          onOpenChange={(open) => setIsMenuOpen(open)}
        >
          <MenuButton
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Navigation Menu"
          >
            <Flex direction="column" gap="4px">
              <View height="2px" width="24px" backgroundColor={tokens.colors.primary[80]} />
              <View height="2px" width="24px" backgroundColor={tokens.colors.primary[80]} />
              <View height="2px" width="24px" backgroundColor={tokens.colors.primary[80]} />
            </Flex>
          </MenuButton>
          <View>
            <MenuItem onClick={() => navigate('/dashboard')}>Dashboard</MenuItem>
            <MenuItem onClick={() => navigate('/search')}>Search</MenuItem>
            <MenuItem onClick={() => navigate('/activity')}>My Activity</MenuItem>
            <MenuItem onClick={() => navigate('/messages')}>Messages</MenuItem>
            <MenuItem onClick={() => navigate('/community')}>Community</MenuItem>

            {user?.role === 'Student' && (
              <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
            )}

            <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
          </View>
        </Menu>
      </View>
      </Flex>
    </>
  );
};

export default Header;
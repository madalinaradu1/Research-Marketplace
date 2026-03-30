import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { API, graphqlOperation } from 'aws-amplify';
import { listMessages } from '../graphql/message-operations';
import {
  Flex,
  Image,
  Text,
  Button,
  useTheme,
  View,
  SearchField
} from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';

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
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const accessibilityCloseTimeoutRef = useRef(null);
  const profileCloseTimeoutRef = useRef(null);

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
    
    // Load locally read messages from localStorage
    const readMessages = JSON.parse(localStorage.getItem(`read_messages_${userId}`) || '[]');
    
    const unreadMessages = allMessages.filter(msg => {
      const isLocallyRead = readMessages.includes(msg.id);
      return msg.receiverID === userId && !msg.isRead && !isLocallyRead;
    });
    
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

  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : user?.username || 'User');

  const clearCloseTimeout = (timeoutRef) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const openAccessibilityMenu = () => {
    clearCloseTimeout(accessibilityCloseTimeoutRef);
    setIsAccessibilityOpen(true);
  };

  const scheduleAccessibilityClose = () => {
    clearCloseTimeout(accessibilityCloseTimeoutRef);
    accessibilityCloseTimeoutRef.current = setTimeout(() => {
      setIsAccessibilityOpen(false);
      accessibilityCloseTimeoutRef.current = null;
    }, 10);
  };

  const openProfileMenu = () => {
    clearCloseTimeout(profileCloseTimeoutRef);
    setIsMenuOpen(true);
  };

  const scheduleProfileClose = () => {
    clearCloseTimeout(profileCloseTimeoutRef);
    profileCloseTimeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
      profileCloseTimeoutRef.current = null;
    }, 10);
  };

  // Restore saved accessibility preferences on mount
  useEffect(() => {
    if (localStorage.getItem('fontSize') === 'large') document.documentElement.classList.add('large-font');
    if (localStorage.getItem('highContrast') === 'on') document.documentElement.classList.add('high-contrast');
    if (localStorage.getItem('dyslexiaFont') === 'on') document.documentElement.classList.add('dyslexia-font');
    if (localStorage.getItem('reducedMotion') === 'on') document.documentElement.classList.add('reduced-motion');
    if (localStorage.getItem('linkSpacing') === 'on') document.documentElement.classList.add('link-spacing');
  }, []);

  useEffect(() => {
    return () => {
      clearCloseTimeout(accessibilityCloseTimeoutRef);
      clearCloseTimeout(profileCloseTimeoutRef);
    };
  }, []);

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
            background-color: transparent !important;
            color: white !important;
            border: none !important;
          }
          .header-search-field button[type="submit"] {
            border: 1px solid white !important;
          }
          .header-search-field button:hover {
            background-color: transparent !important;
            color: white !important;
            outline: none !important;
            box-shadow: none !important;
            border: none !important;
          }
          .header-search-field button[type="submit"]:hover {
            border: 1px solid white !important;
          }
          .header-search-field button:focus {
            outline: none !important;
            box-shadow: none !important;
          }
          .header-search-field button:focus-visible {
            outline: none !important;
            box-shadow: none !important;
          }
          .header-search-field svg {
            fill: white !important;
          } 
          .accessibility-button,
          .accessibility-button:hover,
          .accessibility-button:focus {
             color: white !important;
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
        {/* Hide navigation for Students with incomplete profiles */}
        {!(user?.role === 'Student' && !user?.profileComplete) && (
          <>
            <Link to="/dashboard" style={{ textDecoration: isActive('/dashboard') ? 'underline white' : 'none' }}>
              <Text
                color={isActive('/dashboard') ? "white" : "rgba(255,255,255,0.8)"}
                fontWeight={isActive('/dashboard') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
              >
                Dashboard
              </Text>
            </Link>

            {user?.role !== 'Coordinator' && user?.role !== 'Admin' && (
              <Link to="/activity" style={{ textDecoration: isActive('/activity') ? 'underline white' : 'none' }}>
                <Text
                  color={isActive('/activity') ? "white" : "rgba(255,255,255,0.8)"}
                  fontWeight={isActive('/activity') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
                >
                  My Activity
                </Text>
              </Link>
            )}
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
          </>
        )}
        





        <SearchField
          placeholder="Search research opportunities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
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
        
        {/* Accessibility Dropdown */}
        <View 
          className="halo-menu-anchor"
          style={{ position: 'relative' }}
          onMouseEnter={openAccessibilityMenu}
          onMouseLeave={scheduleAccessibilityClose}
        >
          <button
            type="button"
            className="halo-nav-icon halo-accessibility-trigger"
            aria-label="Accessibility options"
            aria-haspopup="true"
            aria-expanded={isAccessibilityOpen}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="4.5" r="2.5"/>
              <path d="M12 7v5"/>
              <path d="M8 11h8"/>
              <path d="M10 22l2-8 2 8"/>
            </svg>
          </button>
          
          {isAccessibilityOpen && (
            <div className="halo-dropdown">
              <div className="halo-dropdown-header">Accessibility</div>
              <button
                type="button"
                className="halo-dropdown-item"
                onClick={() => {
                  document.documentElement.classList.toggle('large-font');
                  localStorage.setItem('fontSize', document.documentElement.classList.contains('large-font') ? 'large' : 'normal');
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>
                </svg>
                Large Text
                {document.documentElement.classList.contains('large-font') && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
              <button
                type="button"
                className="halo-dropdown-item"
                onClick={() => {
                  document.documentElement.classList.toggle('high-contrast');
                  localStorage.setItem('highContrast', document.documentElement.classList.contains('high-contrast') ? 'on' : 'off');
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor"/>
                </svg>
                High Contrast
                {document.documentElement.classList.contains('high-contrast') && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
              <button
                type="button"
                className="halo-dropdown-item"
                onClick={() => {
                  document.documentElement.classList.toggle('dyslexia-font');
                  localStorage.setItem('dyslexiaFont', document.documentElement.classList.contains('dyslexia-font') ? 'on' : 'off');
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 20h16"/><path d="M7 4l5 16"/><path d="M17 4l-5 16"/>
                </svg>
                Dyslexia-Friendly
                {document.documentElement.classList.contains('dyslexia-font') && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
              <button
                type="button"
                className="halo-dropdown-item"
                onClick={() => {
                  document.documentElement.classList.toggle('reduced-motion');
                  localStorage.setItem('reducedMotion', document.documentElement.classList.contains('reduced-motion') ? 'on' : 'off');
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="4" y1="4" x2="20" y2="20"/>
                </svg>
                Reduce Motion
                {document.documentElement.classList.contains('reduced-motion') && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
              <button
                type="button"
                className="halo-dropdown-item"
                onClick={() => {
                  document.documentElement.classList.toggle('link-spacing');
                  localStorage.setItem('linkSpacing', document.documentElement.classList.contains('link-spacing') ? 'on' : 'off');
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10H3"/><path d="M21 6H3"/><path d="M21 14H3"/><path d="M21 18H3"/>
                </svg>
                Link Spacing
                {document.documentElement.classList.contains('link-spacing') && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            </div>
          )}
        </View>
        
        <View
          className="halo-menu-anchor"
          style={{ position: 'relative' }}
          onMouseEnter={() => clearCloseTimeout(profileCloseTimeoutRef)}
          onMouseLeave={scheduleProfileClose}
        >
          <button
            type="button"
            className="halo-nav-icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            onMouseEnter={openProfileMenu}
            aria-label="Profile menu"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="3.25" />
              <path d="M5 19a7 7 0 0 1 14 0" />
            </svg>
          </button>

          {isMenuOpen && (
            <Flex
              direction="column"
              className="halo-dropdown halo-profile-dropdown"
              style={{
                position: 'absolute',
                zIndex: 1001
              }}
            >
              <Flex direction="column" alignItems="stretch" gap="0.5rem">
                <Flex direction="column" gap="0" flex="1">
                  <div className="halo-dropdown-header">Profile</div>
                  <div className="halo-profile-greeting">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="8" r="3.25" />
                      <path d="M5 19a7 7 0 0 1 14 0" />
                    </svg>
                    <span>{displayName}</span>
                  </div>
                  {user?.role === 'Student' && (
                    <Button className="halo-dropdown-item halo-profile-action" onClick={() => { navigate('/profile'); setIsMenuOpen(false); }} backgroundColor="white" color="black" border="none" size="small" justifyContent="flex-start">Edit profile</Button>
                  )}
                  <Button className="halo-dropdown-item halo-profile-action" onClick={() => { handleSignOut(); setIsMenuOpen(false); }} backgroundColor="white" color="black" border="none" size="small" justifyContent="flex-start">Sign out</Button>
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
            backgroundColor="#552b9a"
            color="white"
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
              {user?.role !== 'Coordinator' && user?.role !== 'Admin' && (
                <Button onClick={() => { navigate('/activity'); setIsMenuOpen(false); }} backgroundColor="white" color="black" border="none" justifyContent="flex-start">My Activity</Button>
              )}
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

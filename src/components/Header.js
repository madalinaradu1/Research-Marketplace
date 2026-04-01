import React, { useState, useEffect } from 'react';
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
  SearchField,
  Divider
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
    space: { small: '0.5rem', medium: '1rem' },
    fontSizes: { small: '0.875rem', large: '1.25rem' },
    fontWeights: { normal: '400', bold: '700' }
  }} = useTheme() || {};

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('header')) {
        setIsMenuOpen(false);
        setIsAccessibilityOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const fetchUnreadCount = async () => {
    if (!user || !user.id) return;
    try {
      const userId = user.id || user.username;
      if (!userId) return;
      const messageResult = await API.graphql(graphqlOperation(listMessages, { limit: 100 }));
      const allMessages = messageResult.data?.listMessages?.items || [];
      const readMessages = JSON.parse(localStorage.getItem(`read_messages_${userId}`) || '[]');
      const unreadMessages = allMessages.filter(msg =>
        msg.receiverID === userId && !msg.isRead && !readMessages.includes(msg.id)
      );
      setUnreadCount(unreadMessages.length);
    } catch (error) {
      if (!error.message?.includes('No current user')) {
        console.error('Error fetching unread count:', error);
      }
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    const level = parseInt(localStorage.getItem('fontSizeLevel') || '0');
    if (level > 0) document.documentElement.classList.add(`font-level-${level}`);
    // Remove any leftover dark mode class
    document.documentElement.classList.remove('dark-mode');
    localStorage.removeItem('darkMode');
  }, []);

  useEffect(() => {
    if (user && user.id) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (location.pathname === '/messages') setUnreadCount(0);
  }, [location.pathname]);

  return (
    <>
      <style>{`
        .header-search-field {
          border: 1px solid rgba(0,0,0,0.3) !important;
          border-radius: 4px !important;
          overflow: hidden !important;
        }
        .header-search-field .amplify-field-group {
          border: none !important;
          box-shadow: none !important;
        }
        .header-search-field .amplify-field-group__outer-end {
          border: none !important;
        }
        .header-search-field input {
          color: black !important;
          background-color: transparent !important;
          border: none !important;
          outline: none !important;
        }
        .header-search-field input::placeholder {
          color: rgba(0,0,0,0.5) !important;
          opacity: 1;
        }
        .header-search-field input:focus {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .header-search-field button {
          background-color: transparent !important;
          color: black !important;
          border: none !important;
        }
        .header-search-field button:hover,
        .header-search-field button:focus {
          background-color: transparent !important;
          box-shadow: none !important;
          border: none !important;
          outline: none !important;
        }
        .header-search-field svg {
          fill: black !important;
        }
        .accessibility-button,
        .accessibility-button:hover,
        .accessibility-button:focus {
          color: white !important;
        }
      `}</style>

      <Flex
        as="header"
        direction="column"
        backgroundColor="#F0F0F0"
        boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
        position="sticky"
        top="0"
        style={{ zIndex: 100 }}
      >
        {/* Top banner */}
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
                <Text fontSize={tokens.fontSizes.medium} fontWeight={tokens.fontWeights.bold} color="black">
                  Undergraduate Research
                </Text>
                <Text fontSize={tokens.fontSizes.medium} fontWeight={tokens.fontWeights.bold} color="black">
                  Opportunity Program
                </Text>
                <Text fontSize={tokens.fontSizes.medium} color="black">
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
          <View />

          {/* Desktop Navigation */}
          <Flex
            direction="row"
            alignItems="center"
            gap={tokens.space.medium}
            display={{ base: 'none', xl: 'flex' }}
            padding="1.5rem 2rem"
          >
            {!(user?.role === 'Student' && !user?.profileComplete) && (
              <>
                <Link to="/dashboard" style={{ textDecoration: isActive('/dashboard') ? 'underline white' : 'none' }}>
                  <Text
                    color={isActive('/dashboard') ? 'black' : 'rgba(0,0,0,0.7)'}
                    fontWeight={isActive('/dashboard') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
                  >
                    Dashboard
                  </Text>
                </Link>

                {user?.role !== 'Coordinator' && user?.role !== 'Admin' && (
                  <Link to="/activity" style={{ textDecoration: isActive('/activity') ? 'underline white' : 'none' }}>
                    <Text
                      color={isActive('/activity') ? 'black' : 'rgba(0,0,0,0.7)'}
                      fontWeight={isActive('/activity') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
                    >
                      My Activity
                    </Text>
                  </Link>
                )}

                {user?.role !== 'Coordinator' && user?.role !== 'Admin' && (
                  <Link to="/messages" style={{ position: 'relative', textDecoration: isActive('/messages') ? 'underline white' : 'none' }}>
                    <Text
                      color={isActive('/messages') ? 'black' : 'rgba(0,0,0,0.7)'}
                      fontWeight={isActive('/messages') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
                    >
                      Messages
                    </Text>
                    {unreadCount > 0 && (
                      <View position="absolute" top="-8px" right="-8px" width="16px" height="16px"
                        borderRadius="50%" backgroundColor="red" display="flex"
                        alignItems="center" justifyContent="center"
                      >
                        <Text fontSize="10px" color="white" fontWeight="bold">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Text>
                      </View>
                    )}
                  </Link>
                )}

                <Link to="/community" style={{ textDecoration: isActive('/community') ? 'underline white' : 'none' }}>
                  <Text
                    color={isActive('/community') ? 'black' : 'rgba(0,0,0,0.7)'}
                    fontWeight={isActive('/community') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
                  >
                    Community
                  </Text>
                </Link>
              </>
            )}

            <div style={{ border: '1px solid rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
              <SearchField
                placeholder="Search research opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.slice(0, 50))}
                onClear={() => setSearchTerm('')}
                onKeyPress={(e) => { if (e.key === 'Enter') navigate(`/search?q=${encodeURIComponent(searchTerm)}`); }}
                onSubmit={() => navigate(`/search?q=${encodeURIComponent(searchTerm)}`)}
                width="300px"
                size="small"
                style={{
                  '--amplify-components-field-border-color': 'transparent',
                  '--amplify-components-field-color': 'black',
                  '--amplify-components-field-background-color': 'transparent',
                  '--amplify-components-field-focus-border-color': 'transparent',
                  '--amplify-components-field-focus-box-shadow': 'none',
                  '--amplify-components-searchfield-button-color': 'black',
                  '--amplify-components-button-color': 'black',
                  color: 'black',
                  border: 'none',
                  backgroundColor: 'transparent',
                  outline: 'none',
                  transition: 'none'
                }}
                className="header-search-field"
              />
            </div>

            {/* Accessibility Dropdown */}
            <View style={{ position: 'relative' }} onClick={() => { setIsAccessibilityOpen(!isAccessibilityOpen); setIsMenuOpen(false); }}>
              <div className="accessibility-icon" style={{
                backgroundColor: 'white', color: '#552b9a', borderRadius: '8px',
                width: '40px', height: '40px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', border: '1px solid white', fontSize: '16px',
                fontWeight: 'bold', cursor: 'pointer'
              }}>
                🚹
              </div>

              {isAccessibilityOpen && (
                <Flex direction="column" gap="0.5rem" backgroundColor="white" padding="0.5rem"
                  style={{ position: 'absolute', top: '100%', right: '0', minWidth: '200px',
                    zIndex: 1001, boxShadow: '0 4px 8px rgba(0,0,0,0.3)', border: '1px solid #ccc' }}
                >
                  <Text fontSize="0.9rem" fontWeight="bold" color="black" padding="0.5rem">Accessibility</Text>
                  <Button
                    onClick={() => {
                      const html = document.documentElement;
                      const current = parseInt(localStorage.getItem('fontSizeLevel') || '0');
                      const next = (current + 1) % 4;
                      html.classList.remove('font-level-1', 'font-level-2', 'font-level-3', 'large-font');
                      if (next > 0) html.classList.add(`font-level-${next}`);
                      localStorage.setItem('fontSizeLevel', next.toString());
                      localStorage.removeItem('fontSize');
                    }}
                    backgroundColor="white" color="black" border="none" size="small" justifyContent="flex-start"
                  >
                    {(() => {
                      const level = parseInt(localStorage.getItem('fontSizeLevel') || '0');
                      return ['Large Text', '✓ Large Text (1/3)', '✓ Large Text (2/3)', '✓ Large Text (3/3)'][level];
                    })()}
                  </Button>
                  <Divider />
                  <Button
                    onClick={() => {
                      document.documentElement.classList.remove('font-level-1', 'font-level-2', 'font-level-3', 'large-font');
                      localStorage.removeItem('fontSizeLevel');
                      localStorage.removeItem('fontSize');
                    }}
                    backgroundColor="white" color="black" border="none" size="small" justifyContent="flex-start"
                  >
                    ↺ Reset to Default
                  </Button>
                </Flex>
              )}
            </View>

            {/* User Menu */}
            <View style={{ position: 'relative' }}>
              <Button
                className="user-icon-button"
                onClick={() => { setIsMenuOpen(!isMenuOpen); setIsAccessibilityOpen(false); }}
                backgroundColor="white" color="black" size="small"
                style={{ borderRadius: '8px', width: '40px', height: '40px', padding: '0', outline: 'none', boxShadow: 'none', border: '1px solid white' }}
              >
                👤
              </Button>

              {isMenuOpen && (
                <Flex direction="column" gap="0.5rem" backgroundColor="white" padding="0.5rem"
                  style={{ position: 'absolute', top: '100%', right: '0', minWidth: '250px',
                    zIndex: 1001, boxShadow: '0 4px 8px rgba(0,0,0,0.3)', border: '1px solid #ccc' }}
                >
                  <Flex direction="row" alignItems="center" gap="1rem">
                    <View style={{ width: '60px', height: '60px', backgroundColor: 'white', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>
                      👤
                    </View>
                    <Flex direction="column" gap="0.5rem" flex="1">
                      <Text fontSize="0.9rem" fontWeight="bold" color="black">
                        Hello, {user?.name || (user?.email ? user.email.split('@')[0] : user?.username || 'User')}
                      </Text>
                      {user?.role === 'Student' && (
                        <Button onClick={() => { navigate('/profile'); setIsMenuOpen(false); }} backgroundColor="white" color="black" border="none" size="small" justifyContent="flex-start">Edit Profile</Button>
                      )}
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
              backgroundColor="#F0F0F0" color="black" border="1px solid #ccc"
              style={{ alignSelf: 'flex-start', marginTop: '-0.5rem' }}
            >
              <Flex direction="column" gap="4px">
                <View height="2px" width="24px" backgroundColor="black" />
                <View height="2px" width="24px" backgroundColor="black" />
                <View height="2px" width="24px" backgroundColor="black" />
              </Flex>
            </Button>

            {isMenuOpen && (
              <Flex direction="column" gap="0.5rem" backgroundColor="white" padding="1rem"
                style={{ position: 'absolute', top: '100%', right: '0', minWidth: '200px',
                  zIndex: 1001, boxShadow: '0 4px 8px rgba(0,0,0,0.3)', border: '1px solid #ccc' }}
              >
                <Button onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }} backgroundColor="white" color="black" border="none" justifyContent="flex-start">Dashboard</Button>
                <Button onClick={() => { navigate('/search'); setIsMenuOpen(false); }} backgroundColor="white" color="black" border="none" justifyContent="flex-start">Search</Button>
                {user?.role !== 'Coordinator' && user?.role !== 'Admin' && (
                  <Button onClick={() => { navigate('/activity'); setIsMenuOpen(false); }} backgroundColor="white" color="black" border="none" justifyContent="flex-start">My Activity</Button>
                )}
                {user?.role !== 'Coordinator' && user?.role !== 'Admin' && (
                  <Button onClick={() => { navigate('/messages'); setIsMenuOpen(false); }} backgroundColor="white" color="black" border="none" justifyContent="flex-start">Messages</Button>
                )}
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

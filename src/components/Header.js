import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Flex,
  Image,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  useTheme,
  View
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

  // Check if the current path matches the given path
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Handle sign out
  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
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
        <Link to="/dashboard" style={{ textDecoration: 'none', position: 'relative', zIndex: 10 }}>
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
        <Link to="/dashboard">
          <Text
            color={isActive('/dashboard') ? "white" : "rgba(255,255,255,0.8)"}
            fontWeight={isActive('/dashboard') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
          >
            Dashboard
          </Text>
        </Link>
        <Link to="/search">
          <Text
            color={isActive('/search') ? "white" : "rgba(255,255,255,0.8)"}
            fontWeight={isActive('/search') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
          >
            Search
          </Text>
        </Link>
        <Link to="/activity">
          <Text
            color={isActive('/activity') ? "white" : "rgba(255,255,255,0.8)"}
            fontWeight={isActive('/activity') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
          >
            My Activity
          </Text>
        </Link>
        <Link to="/messages" style={{ position: 'relative' }}>
          <Text
            color={isActive('/messages') ? "white" : "rgba(255,255,255,0.8)"}
            fontWeight={isActive('/messages') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
          >
            Messages
          </Text>
          {/* Unread message badge - placeholder for now */}
          <View
            position="absolute"
            top="-8px"
            right="-8px"
            width="16px"
            height="16px"
            borderRadius="50%"
            backgroundColor="red"
            style={{ display: 'none' }} // Will be controlled by unread count
          />
        </Link>
        {(user?.role === 'Student' || user?.role === 'Faculty') && (
          <Link to="/applications">
            <Text
              color={isActive('/applications') ? "white" : "rgba(255,255,255,0.8)"}
              fontWeight={isActive('/applications') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
            >
              Applications
            </Text>
          </Link>
        )}
        {user?.role === 'Student' && (
          <Link to="/profile">
            <Text
              color={isActive('/profile') ? "white" : "rgba(255,255,255,0.8)"}
              fontWeight={isActive('/profile') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
            >
              Profile
            </Text>
          </Link>
        )}
        {isUserAdmin(user, user) && (
          <Link to="/admin">
            <Text
              color={isActive('/admin') ? "white" : "rgba(255,255,255,0.8)"}
              fontWeight={isActive('/admin') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
            >
              Admin
            </Text>
          </Link>
        )}
        <Button onClick={handleSignOut} variation="primary">
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
            {(user?.role === 'Student' || user?.role === 'Faculty') && (
              <MenuItem onClick={() => navigate('/applications')}>Applications</MenuItem>
            )}
            {user?.role === 'Student' && (
              <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
            )}
            {isUserAdmin(user, user) && (
              <MenuItem onClick={() => navigate('/admin')}>Admin</MenuItem>
            )}
            <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
          </View>
        </Menu>
      </View>
    </Flex>
  );
};

export default Header;
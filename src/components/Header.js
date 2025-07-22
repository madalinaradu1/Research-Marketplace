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
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      padding={tokens.space.medium}
      backgroundColor={tokens.colors.white}
      boxShadow="0 2px 4px rgba(0, 0, 0, 0.1)"
      position="sticky"
      top="0"
      style={{ zIndex: 100 }}
    >
      {/* Logo and Title */}
      <Flex direction="row" alignItems="center" gap={tokens.space.small}>
        <Link to="/dashboard">
          <Image
            alt="URAF Logo"
            src="/logo192.png"
            height="40px"
            width="40px"
            objectFit="contain"
          />
        </Link>
        <Flex direction="column">
          <Text
            fontSize={tokens.fontSizes.large}
            fontWeight={tokens.fontWeights.bold}
            color={tokens.colors.primary[80]}
          >
            Undergraduate Research
          </Text>
          <Text
            fontSize={tokens.fontSizes.small}
            color={tokens.colors.neutral[80]}
          >
            Grand Canyon University
          </Text>
        </Flex>
      </Flex>

      {/* Desktop Navigation */}
      <Flex
        direction="row"
        alignItems="center"
        gap={tokens.space.medium}
        display={{ base: 'none', medium: 'flex' }}
      >
        <Link to="/dashboard">
          <Text
            color={isActive('/dashboard') ? tokens.colors.primary[80] : tokens.colors.neutral[80]}
            fontWeight={isActive('/dashboard') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
          >
            Dashboard
          </Text>
        </Link>
        <Link to="/search">
          <Text
            color={isActive('/search') ? tokens.colors.primary[80] : tokens.colors.neutral[80]}
            fontWeight={isActive('/search') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
          >
            Search
          </Text>
        </Link>
        <Link to="/activity">
          <Text
            color={isActive('/activity') ? tokens.colors.primary[80] : tokens.colors.neutral[80]}
            fontWeight={isActive('/activity') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
          >
            My Activity
          </Text>
        </Link>
        <Link to="/profile">
          <Text
            color={isActive('/profile') ? tokens.colors.primary[80] : tokens.colors.neutral[80]}
            fontWeight={isActive('/profile') ? tokens.fontWeights.bold : tokens.fontWeights.normal}
          >
            Profile
          </Text>
        </Link>
        {isUserAdmin(user, user) && (
          <Link to="/admin">
            <Text
              color={isActive('/admin') ? tokens.colors.primary[80] : tokens.colors.neutral[80]}
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
            <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
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
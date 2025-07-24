import React from 'react';
import { Link } from 'react-router-dom';
import {
  Flex,
  Divider,
  Text,
  Grid,
  useTheme,
  View,
  Image
} from '@aws-amplify/ui-react';

const Footer = () => {
  const { tokens } = useTheme();
  
  return (
    <View as="footer" backgroundColor="#D7D7D7" color={tokens.colors.neutral[90]}>
      <Flex
        direction="column"
        padding={tokens.space.xl}
        maxWidth="1200px"
        marginLeft="auto"
        marginRight="auto"
      >
        {/* Footer Header with Logo */}
        <Flex
          direction="row"
          alignItems="center"
          justifyContent="center"
          gap={tokens.space.medium}
          marginBottom={tokens.space.large}
        >
          <Image
            alt="FYP Logo"
            src="/FYP.png"
            height="40px"
            objectFit="contain"
          />
        </Flex>
        
        {/* Footer Content */}
        <Grid
          templateColumns={{ base: '1fr', medium: '1fr 1fr 1fr' }}
          gap={tokens.space.large}
        >
          {/* Contact Information */}
          <Flex direction="column" gap={tokens.space.small}>
            <Text
              fontSize={tokens.fontSizes.large}
              fontWeight={tokens.fontWeights.bold}
              marginBottom={tokens.space.small}
            >
              Contact Us
            </Text>
            <Text>Undergraduate Research and Fellowships</Text>
            <Text>Grand Canyon University</Text>
            <Text>Email: uraf@gcu.edu</Text>
            <Text>Phone: (555) 123-4567</Text>
            <Text>Office: Research Building, Room 305</Text>
          </Flex>
          
          {/* Quick Links */}
          <Flex direction="column" gap={tokens.space.small}>
            <Text
              fontSize={tokens.fontSizes.large}
              fontWeight={tokens.fontWeights.bold}
              marginBottom={tokens.space.small}
            >
              Quick Links
            </Text>
            <Link to="/search">
              <Text color={tokens.colors.white}>Find Opportunities</Text>
            </Link>
            <Link to="/resources">
              <Text color={tokens.colors.white}>Resources</Text>
            </Link>
            <Link to="/events">
              <Text color={tokens.colors.white}>Events</Text>
            </Link>
            <Link to="/faq">
              <Text color={tokens.colors.white}>FAQ</Text>
            </Link>
            <Link to="/about">
              <Text color={tokens.colors.white}>About URAF</Text>
            </Link>
          </Flex>
          
          {/* Follow Us */}
          <Flex direction="column" gap={tokens.space.small}>
            <Text
              fontSize={tokens.fontSizes.large}
              fontWeight={tokens.fontWeights.bold}
              marginBottom={tokens.space.small}
            >
              Follow Us
            </Text>
            <Flex direction="row" gap={tokens.space.medium}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <Text color={tokens.colors.white}>Facebook</Text>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <Text color={tokens.colors.white}>Twitter</Text>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <Text color={tokens.colors.white}>Instagram</Text>
              </a>
            </Flex>
            <Text marginTop={tokens.space.medium}>
              Subscribe to our newsletter for updates on research opportunities and events.
            </Text>
          </Flex>
        </Grid>
        
        <Divider
          marginTop={tokens.space.large}
          marginBottom={tokens.space.large}
          backgroundColor={tokens.colors.neutral[60]}
        />
        
        {/* Copyright */}
        <Flex
          direction={{ base: 'column', medium: 'row' }}
          justifyContent="space-between"
          alignItems={{ base: 'flex-start', medium: 'center' }}
          gap={tokens.space.small}
        >
          <Flex direction="row" alignItems="center" gap={tokens.space.medium}>
            <Text>&copy; {new Date().getFullYear()} Grand Canyon University. All rights reserved.</Text>
          </Flex>
          <Flex direction="row" gap={tokens.space.medium}>
            <Link to="/privacy">
              <Text color={tokens.colors.neutral[90]}>Privacy Policy</Text>
            </Link>
            <Link to="/terms">
              <Text color={tokens.colors.neutral[90]}>Terms of Use</Text>
            </Link>
            <Link to="/accessibility">
              <Text color={tokens.colors.neutral[90]}>Accessibility</Text>
            </Link>
          </Flex>
        </Flex>
      </Flex>
    </View>
  );
};

export default Footer;
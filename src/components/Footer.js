import React from 'react';
import { Link } from 'react-router-dom';
import { Flex, Text, Grid, View, Image } from '@aws-amplify/ui-react';

const Footer = () => {
  return (
    <View as="footer" backgroundColor="#522398" color="white">
      <Flex direction="column" padding="3rem 2rem" maxWidth="1400px" margin="0 auto">
        
        {/* Top Section */}
        <Grid templateColumns={{ base: '1fr', medium: '1fr 2fr 1fr' }} gap="2rem" marginBottom="3rem">
          
          {/* Left - Logo and Contact */}
          <Flex direction="column" gap="1.5rem">
            <Image alt="GCU Logo" src="/GCU_WHITE.png" height="60px" objectFit="contain" />
            <button style={{ backgroundColor: 'white', color: '#522398', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer' }}>
              1-855-GCU-LOPE
            </button>
            <button style={{ backgroundColor: 'white', color: '#522398', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer' }}>
              💬 Live Chat
            </button>
            <Text fontSize="0.9rem">3300 West Camelback Road - Phoenix, AZ 85017</Text>
            <Text fontSize="0.8rem">Grand Canyon University © 2026 All Rights Reserved</Text>
          </Flex>

          {/* Middle - Links */}
          <Grid templateColumns="1fr 1fr" gap="2rem">
            <Flex direction="column" gap="0.75rem">
              <Text fontWeight="bold" marginBottom="0.5rem">Popular</Text>
              <a href="https://www.gcu.edu/degree-programs" style={{ color: 'white', textDecoration: 'underline' }}>Majors & Programs</a>
              <a href="https://www.gcu.edu/admissions" style={{ color: 'white', textDecoration: 'underline' }}>Admission</a>
              <a href="https://www.gcu.edu/tuition-and-financial-aid" style={{ color: 'white', textDecoration: 'underline' }}>Financial Resources</a>
              <a href="https://www.gcu.edu/academics/calendar" style={{ color: 'white', textDecoration: 'underline' }}>Academic Calendar</a>
              <a href="https://www.gcu.edu/academics/academic-policies.php" style={{ color: 'white', textDecoration: 'underline' }}>Academic Catalog & Policies</a>
              <a href="https://www.gcu.edu/why-gcu/online-learning" style={{ color: 'white', textDecoration: 'underline' }}>Online Learning</a>
              <a href="https://www.gcu.edu/why-gcu" style={{ color: 'white', textDecoration: 'underline' }}>Why GCU</a>
            </Flex>
            
            <Flex direction="column" gap="0.75rem">
  <Text fontWeight="bold" marginBottom="0.5rem">Resources</Text>
  <a href="https://www.gcu.edu/about/contact" style={{ color: 'white', textDecoration: 'underline' }}>Contact Us</a>
  <a href="https://www.gcu.edu/careers" style={{ color: 'white', textDecoration: 'underline' }}>Careers</a>
  <a href="https://www.gcu.edu/academics/academic-policies/title-ix.php" style={{ color: 'white', textDecoration: 'underline' }}>Title IX</a>
  <a href="https://www.gcu.edu/about/media-and-branding" style={{ color: 'white', textDecoration: 'underline' }}>Media & Licensing</a>
  <a href="https://www.gcu.edu/academics/academic-policies.php#h-consumer-information" style={{ color: 'white', textDecoration: 'underline' }}>Consumer Information</a>
  <a href="https://www.gcu.edu/financial-disclosures" style={{ color: 'white', textDecoration: 'underline' }}>Financial Disclosures</a>
  <a href="https://www.gcu.edu/privacy-policy" style={{ color: 'white', textDecoration: 'underline' }}>Privacy Policy</a>
  <a href="https://www.gcu.edu/tuition/cost-attendance" style={{ color: 'white', textDecoration: 'underline' }}>Cost of Attendance</a>
</Flex>

          </Grid>

          {/* Right - Find Your Purpose */}
          <Flex direction="column" alignItems="center" justifyContent="center" gap="1rem">
            <Text fontSize="2rem" fontWeight="bold" fontStyle="italic" textAlign="center">FIND YOUR PURPOSE</Text>
            <Image alt="Lope" src="/FYP.png" height="150px" objectFit="contain" />
            <Flex direction="row" gap="1rem">
              <a href="https://www.facebook.com/GrandCanyonU/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontSize: '1.5rem' }}>f</a>
              <a href="https://x.com/gcu" target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontSize: '1.5rem' }}>𝕏</a>
              <a href="https://www.linkedin.com/school/grand-canyon-university/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontSize: '1.5rem' }}>in</a>
              <a href="https://www.instagram.com/gcu/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontSize: '1.5rem' }}>📷</a>
              <a href="https://www.youtube.com/user/gcu" target="_blank" rel="noopener noreferrer" style={{ color: 'white', fontSize: '1.5rem' }}>▶</a>
            </Flex>
          </Flex>
        </Grid>

        {/* Bottom Links */}
        <Flex direction="row" gap="1rem" justifyContent="center" flexWrap="wrap" fontSize="0.9rem" borderTop="1px solid rgba(255,255,255,0.3)" paddingTop="1.5rem">
  <a href="https://students.gcu.edu/" style={{ color: 'white' }}>Current Students</a>
  <Text>|</Text>
  <a href="https://alumni.gcu.edu/" style={{ color: 'white' }}>Alumni</a>
  <Text>|</Text>
  <a href="https://gculopes.com/" style={{ color: 'white' }}>Athletics</a>
  <Text>|</Text>
  <a href="https://www.gcuarena.com/" style={{ color: 'white' }}>Arena</a>
  <Text>|</Text>
  <a href="https://news.gcu.edu/" style={{ color: 'white' }}>GCU News</a>
  <Text>|</Text>
  <a href="https://lopeshops.gcu.edu/" style={{ color: 'white' }}>Lope Shops</a>
  <Text>|</Text>
  <a href="https://gcbc.gcu.edu/" style={{ color: 'white' }}>GCBC</a>
  <Text>|</Text>
  <a href="https://www.canyonpromotions.com/" style={{ color: 'white' }}>Canyon Promotions</a>
  <Text>|</Text>
  <a href="https://gcugolf.com/lope-house-restaurant/" style={{ color: 'white' }}>Lope House</a>
  <Text>|</Text>
  <a href="https://gcugolf.com/" style={{ color: 'white' }}>GCU Golf</a>
</Flex>
      </Flex>
    </View>
  );
};

export default Footer;
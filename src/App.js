import React, { useEffect, useState } from 'react';
import { Amplify, Auth, API, graphqlOperation, Storage } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Amplify Studio components
import { 
  ApplicationForm, 
  ProfileCard, 
  ResearchOpportunityCard,
  studioTheme
} from './ui-components';

// Import custom components
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import OpportunityDetails from './pages/OpportunityDetails';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import ActivityPage from './pages/ActivityPage';

// Import GraphQL operations
import { getUser } from './graphql/queries';
import { createUser, updateUser } from './graphql/mutations';

// Import AWS configuration
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

function App({ signOut, user }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data when component mounts
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      // Get current authenticated user
      const userInfo = await Auth.currentAuthenticatedUser();
      
      // Try to get user from database
      try {
        const userData = await API.graphql(
          graphqlOperation(getUser, { id: userInfo.username })
        );
        
        if (userData.data.getUser) {
          setUserData(userData.data.getUser);
        } else {
          // Create new user if not found
          const newUser = {
            id: userInfo.username,
            username: userInfo.username,
            email: userInfo.attributes.email,
            name: userInfo.attributes.name || userInfo.username,
            type: 'STUDENT',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          const createUserData = await API.graphql(
            graphqlOperation(createUser, { input: newUser })
          );
          
          setUserData(createUserData.data.createUser);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error getting authenticated user:', error);
      setLoading(false);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Header user={userData} signOut={signOut} />
        
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard user={userData} />} />
            <Route path="/search" element={<SearchPage user={userData} />} />
            <Route path="/opportunity/:id" element={<OpportunityDetails user={userData} />} />
            <Route path="/profile" element={<ProfilePage user={userData} />} />
            <Route path="/activity" element={<ActivityPage user={userData} />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default withAuthenticator(App);
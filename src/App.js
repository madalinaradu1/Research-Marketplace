import React, { useEffect, useState } from 'react';
import { Amplify, Hub, Auth, API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator, ThemeProvider } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { theme } from './theme';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import components
import Header from './components/Header';
import Footer from './components/Footer';

// Import pages
import { Dashboard } from './pages';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ApplicationsPage from './pages/ApplicationsPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import ActivityPage from './pages/ActivityPage';
import OpportunityDetails from './pages/OpportunityDetails';
import CompleteProfilePage from './pages/CompleteProfilePage';
import AdminPage from './pages/AdminPage';

// Import utilities
import { createUserAfterSignUp, checkUserExists } from './utils/userManagement';
import { testApiAccess } from './utils/testApi';
import { syncUserGroupsToRole } from './utils/syncUserGroups';
import { debugAuth } from './utils/debugAuth';
import { isUserAdmin } from './utils/isUserAdmin';

// Import AWS configuration
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

function App({ signOut, user }) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileRefreshTrigger, setProfileRefreshTrigger] = useState(0);
  
  // Function to refresh user profile
  const refreshUserProfile = () => {
    setProfileRefreshTrigger(prev => prev + 1);
  };
  
  useEffect(() => {
    // Test API access
    testApiAccess();
    
    // Debug authentication
    debugAuth();
    
    // Set up listener for auth events
    const listener = Hub.listen('auth', async (data) => {
      const { payload } = data;
      
      if (payload.event === 'signUp') {
        console.log('User signed up:', payload.data);
        // User creation will happen after confirmation
      }
      
      if (payload.event === 'signIn') {
        try {
          const userData = await Auth.currentAuthenticatedUser();
          const userExists = await checkUserExists(userData.username);
          
          if (!userExists) {
            console.log('Creating new user record after sign in');
            await createUserAfterSignUp(userData);
          }
        } catch (error) {
          console.error('Error handling sign in:', error);
        }
      }
    });
    
    // Check if we need to create a user record for the current user
    const checkCurrentUser = async () => {
      try {
        const userData = await Auth.currentAuthenticatedUser();
        const userExists = await checkUserExists(userData.username);
        
        if (!userExists) {
          console.log('Creating user record for current user');
          await createUserAfterSignUp(userData);
        }
      } catch (error) {
        console.error('Error checking current user:', error);
      }
    };
    
    checkCurrentUser();
    
    // Fetch user profile data
    const fetchUserProfile = async () => {
      try {
        const { getUser } = await import('./graphql/operations');
        const userData = await Auth.currentAuthenticatedUser();
        
        // Sync user's Cognito groups with their role in DynamoDB
        await syncUserGroupsToRole(userData.username);
        
        const result = await API.graphql(graphqlOperation(getUser, { id: userData.username }));
        setUserProfile(result.data.getUser);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
    
    // Clean up listener
    return () => {
      Hub.remove('auth', listener);
    };
  }, [profileRefreshTrigger]); // Re-run when profileRefreshTrigger changes
  
  // Redirect to complete profile if needed
  // Skip for admin users or if profile is already complete
  // Check if user is admin using utility function
  const isAdmin = isUserAdmin(user, userProfile);
  const shouldCompleteProfile = !isAdmin && userProfile && userProfile.profileComplete === false;
  
  console.log('User profile:', userProfile);
  console.log('Is admin:', isAdmin);
  
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div className="app">
        <Header user={user} signOut={signOut} />
        
        <main>
          <Routes>
            <Route path="/" element={shouldCompleteProfile ? 
              <Navigate to="/complete-profile" /> : 
              <Navigate to="/dashboard" />} />
            <Route path="/complete-profile" element={<CompleteProfilePage user={userProfile || user} />} />
            <Route path="/dashboard" element={shouldCompleteProfile ? 
              <Navigate to="/complete-profile" /> : 
              <Dashboard user={userProfile || user} />} />
            <Route path="/search" element={shouldCompleteProfile ? 
              <Navigate to="/complete-profile" /> : 
              <SearchPage user={userProfile || user} />} />
            <Route path="/profile" element={<ProfilePage user={userProfile || user} refreshProfile={refreshUserProfile} />} />
            <Route path="/activity" element={shouldCompleteProfile ? 
              <Navigate to="/complete-profile" /> : 
              <ActivityPage user={userProfile || user} />} />
            <Route path="/opportunity/:id" element={shouldCompleteProfile ? 
              <Navigate to="/complete-profile" /> : 
              <ProjectDetailsPage user={userProfile || user} />} />
            <Route path="/applications" element={shouldCompleteProfile ? 
              <Navigate to="/complete-profile" /> : 
              <ApplicationsPage user={userProfile || user} />} />
            <Route path="/admin" element={isAdmin ? 
              <AdminPage /> : 
              <Navigate to="/dashboard" />} />
          </Routes>
        </main>
        
        <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default withAuthenticator(App);
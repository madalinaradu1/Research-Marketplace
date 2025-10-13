import React, { useEffect, useState } from 'react';
import { Amplify, Hub, Auth, API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator, ThemeProvider } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { theme } from './theme';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import './styles/globalStyles.css';

// Import components
// import MFASetup from './components/MFASetup';
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
import AdminDashboard from './pages/AdminDashboard';
import MessagesPage from './pages/MessagesPage';
import ApplicationPage from './pages/ApplicationPage';
import StudentPostsPage from './pages/StudentPostsPage';

// Import utilities
import { createUserAfterSignUp, checkUserExists } from './utils/userManagement';
import { getUser, listUsers } from './graphql/operations';
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
  const [lastActivity, setLastActivity] = useState(Date.now());
  // const [mfaComplete, setMfaComplete] = useState(false);
  
  // Function to refresh user profile
  const refreshUserProfile = () => {
    setProfileRefreshTrigger(prev => prev + 1);
  };
  
  useEffect(() => {
    // Check for email link access and clean URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('from') === 'email') {
      // Clear the URL parameter immediately
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      // Don't force logout - let normal authentication flow handle it
    }
    
    // Check session timeout (2 hours = 7200000 ms)
    const checkSessionTimeout = () => {
      const now = Date.now();
      const sessionTimeout = 2 * 60 * 60 * 1000; // 2 hours
      if (now - lastActivity > sessionTimeout) {
        signOut();
        return;
      }
    };
    
    // Set up activity tracking
    const updateActivity = () => setLastActivity(Date.now());
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });
    
    // Check session timeout every minute
    const timeoutInterval = setInterval(checkSessionTimeout, 60000);
    
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
          const userExists = await checkUserExists(userData.attributes.email);
          
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
        const userExists = await checkUserExists(userData.attributes.email);
        
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
      console.log('fetchUserProfile called');
      try {
        // getUser is already imported at the top
        const userData = await Auth.currentAuthenticatedUser();
        
        // Sync user's Cognito groups with their role in DynamoDB
        await syncUserGroupsToRole(userData.username);
        
        let userProfile = null;
        
        console.log('Fetching user profile for UUID:', userData.username);
        console.log('User email:', userData.attributes.email);
        
        try {
          const result = await API.graphql(graphqlOperation(getUser, { id: userData.username }));
          userProfile = result.data.getUser;
          console.log('UUID lookup successful:', userProfile);
        } catch (uuidError) {
          console.log('UUID lookup failed:', uuidError.message);
          console.log('Trying email search for:', userData.attributes.email);
          
          // If UUID lookup fails, search by email
          const emailFilter = { email: { eq: userData.attributes.email } };
          console.log('Email filter:', emailFilter);
          
          const emailResult = await API.graphql(graphqlOperation(listUsers, { filter: emailFilter, limit: 1 }));
          console.log('Email search result:', emailResult.data.listUsers);
          
          if (emailResult.data.listUsers.items.length > 0) {
            userProfile = emailResult.data.listUsers.items[0];
            console.log('Found user by email:', userProfile);
          } else {
            console.log('No user found by email search');
          }
        }
        
        console.log('Final user profile:', userProfile);
        console.log('User profile role:', userProfile?.role);
        console.log('Is admin check:', isUserAdmin(user, userProfile));
        
        // If user doesn't exist, try to find existing user by email
        if (!userProfile) {
          console.log('User profile missing, searching by email');
          const foundUser = await createUserAfterSignUp(userData);
          console.log('createUserAfterSignUp returned:', foundUser);
          
          if (foundUser) {
            setUserProfile(foundUser);
          } else {
            console.log('No user found - user must be created by admin first');
            // Don't create user automatically - redirect to error or contact admin
            setUserProfile(null);
          }
        } else {
          setUserProfile(userProfile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
    
    // Clean up listeners
    return () => {
      Hub.remove('auth', listener);
      clearInterval(timeoutInterval);
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [profileRefreshTrigger]); // Re-run when profileRefreshTrigger changes
  
  // Redirect to complete profile if needed
  // Skip for admin users, faculty users, or if profile is already complete
  // Check if user is admin using utility function
  const isAdmin = isUserAdmin(user, userProfile);
  const isFaculty = userProfile?.role === 'Faculty';
  const isCoordinator = userProfile?.role === 'Coordinator';
  const shouldCompleteProfile = !isAdmin && !isFaculty && !isCoordinator && userProfile && userProfile.profileComplete === false;
  

  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!userProfile) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Account Not Found</h2>
        <p>Your account has not been set up yet. Please contact an administrator to create your account.</p>
        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '1rem' }}>Debug: Check browser console for detailed logs</p>
        <button onClick={signOut} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Sign Out</button>
      </div>
    );
  }

  // MFA disabled due to auth deployment issues
  // if (!mfaComplete) {
  //   return <MFASetup user={user} onComplete={() => setMfaComplete(true)} />;
  // }

  return (
    <ThemeProvider theme={theme}>
        <Router>
          <div className="app">
          <Header user={userProfile || user} signOut={signOut} />

        
        <main>
          <Routes>
            <Route path="/" element={shouldCompleteProfile ? 
              <Navigate to="/complete-profile" /> : 
              <Navigate to="/dashboard" />} />
            <Route path="/complete-profile" element={
              (userProfile || user)?.role === 'Student' ? 
                <CompleteProfilePage user={userProfile || user} /> : 
                <Navigate to="/dashboard" replace />
            } />
            <Route path="/dashboard" element={
              new URLSearchParams(window.location.search).get('from') === 'email' ? 
              <Navigate to="/dashboard" replace /> :
              shouldCompleteProfile ? 
              <Navigate to="/complete-profile" /> : 
              <Dashboard user={userProfile || user} />} />
            <Route path="/search" element={shouldCompleteProfile ? 
              <Navigate to="/complete-profile" /> : 
              <SearchPage user={userProfile || user} />} />
            <Route path="/profile" element={userProfile?.role === 'Student' ? 
              <ProfilePage user={userProfile || user} refreshProfile={refreshUserProfile} /> : 
              <Navigate to="/dashboard" />} />
            <Route path="/activity" element={shouldCompleteProfile ? 
              <Navigate to="/complete-profile" /> : 
              <ActivityPage user={userProfile || user} />} />
            <Route path="/opportunity/:id" element={shouldCompleteProfile ? 
              <Navigate to="/complete-profile" /> : 
              <ProjectDetailsPage user={userProfile || user} />} />
            <Route path="/applications" element={shouldCompleteProfile ? 
              <Navigate to="/complete-profile" /> : 
              <ApplicationsPage user={userProfile || user} />} />
            <Route path="/messages" element={shouldCompleteProfile ? 
              <Navigate to="/complete-profile" /> : 
              <MessagesPage user={userProfile || user} />} />
            <Route path="/apply/:projectId" element={shouldCompleteProfile ? 
              <Navigate to="/complete-profile" /> : 
              <ApplicationPage user={userProfile || user} />} />

            <Route path="/community" element={shouldCompleteProfile ? 
              <Navigate to="/complete-profile" /> : 
              <StudentPostsPage user={userProfile || user} />} />
            <Route path="/admin" element={isAdmin ? 
              <AdminDashboard user={userProfile || user} /> : 
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
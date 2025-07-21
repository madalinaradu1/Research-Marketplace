import React from 'react';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import components
import Header from './components/Header';
import Footer from './components/Footer';

// Import pages
import Dashboard from './pages/Dashboard';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import ActivityPage from './pages/ActivityPage';
import OpportunityDetails from './pages/OpportunityDetails';

// Import AWS configuration
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

function App({ signOut, user }) {
  return (
    <Router>
      <div className="app">
        <Header user={user} signOut={signOut} />
        
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/search" element={<SearchPage user={user} />} />
            <Route path="/profile" element={<ProfilePage user={user} />} />
            <Route path="/activity" element={<ActivityPage user={user} />} />
            <Route path="/opportunity/:id" element={<OpportunityDetails user={user} />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default withAuthenticator(App);
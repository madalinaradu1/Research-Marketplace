import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Amplify } from 'aws-amplify';
import { AmplifyProvider } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsconfig from './aws-exports';
import { TagProvider } from './contexts/TagContext';
import { theme } from './theme';


// Configure Amplify
Amplify.configure(awsconfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AmplifyProvider theme={theme}>
      <TagProvider>
        <App />
      </TagProvider>
    </AmplifyProvider>
  </React.StrictMode>
);
import { Auth } from 'aws-amplify';

/**
 * Debug function to log user authentication details
 */
export async function debugAuth() {
  try {
    console.log('Debugging Auth...');
    
    // Get current authenticated user
    const currentUser = await Auth.currentAuthenticatedUser();
    
    console.log('User:', {
      username: currentUser.username,
      attributes: currentUser.attributes
    });
    
    // Get user's session
    const session = currentUser.signInUserSession;
    
    console.log('Access Token Payload:', session.accessToken.payload);
    console.log('ID Token Payload:', session.idToken.payload);
    
    // Check for cognito:groups
    const groups = session.accessToken.payload['cognito:groups'] || [];
    console.log('Cognito Groups:', groups);
    
    return {
      user: currentUser,
      groups: groups
    };
  } catch (error) {
    console.error('Error debugging auth:', error);
    return null;
  }
}
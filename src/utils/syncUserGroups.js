import { Auth, API, graphqlOperation } from 'aws-amplify';
import { updateUser } from '../graphql/operations';

/**
 * Synchronizes a user's Cognito groups with their role in DynamoDB
 * @param {string} userId - The user ID to update (optional, uses current user if not provided)
 * @returns {Promise} - Promise representing the updated user
 */
export async function syncUserGroupsToRole(userId = null) {
  try {
    // Get current user if userId not provided
    const currentUser = await Auth.currentAuthenticatedUser();
    const targetUserId = userId || currentUser.username;
    
    // Get user's Cognito groups
    const groups = currentUser.signInUserSession.accessToken.payload['cognito:groups'] || [];
    console.log('User groups:', groups);
    
    // Determine role based on highest privilege group
    let role = 'Student'; // Default role
    
    if (groups.includes('Admin')) {
      role = 'Admin';
    } else if (groups.includes('Coordinator')) {
      role = 'Coordinator';
    } else if (groups.includes('Faculty')) {
      role = 'Faculty';
    }
    
    console.log(`Setting user ${targetUserId} role to ${role}`);
    
    // Update user in DynamoDB
    const input = {
      id: targetUserId,
      role: role
    };
    
    const result = await API.graphql(graphqlOperation(updateUser, { input }));
    console.log('User role updated:', result.data.updateUser);
    return result.data.updateUser;
  } catch (error) {
    console.error('Error syncing user groups to role:', error);
    throw error;
  }
}
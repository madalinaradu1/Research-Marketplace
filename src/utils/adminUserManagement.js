import { API, graphqlOperation, Auth } from 'aws-amplify';
import { deleteUser } from '../graphql/operations';

/**
 * Comprehensive user deletion that removes user from both Cognito and DynamoDB
 */
export const deleteUserCompletely = async (userId, userEmail) => {
  try {
    console.log(`Starting complete deletion for user: ${userId} (${userEmail})`);
    
    let cognitoDeleted = false;
    let databaseDeleted = false;
    
    // Step 1: Delete from Cognito using Lambda function
    try {
      console.log('Attempting Cognito user deletion...');
      
      const cognitoResponse = await API.post('adminapi', '/delete-user', {
        body: { userId }
      });
      
      cognitoDeleted = cognitoResponse.success;
      console.log('Cognito deletion completed successfully');
      
    } catch (cognitoError) {
      console.error('Error deleting from Cognito:', cognitoError);
      cognitoDeleted = false;
    }
    
    // Step 2: Delete from DynamoDB
    try {
      await API.graphql(graphqlOperation(deleteUser, { input: { id: userId } }));
      databaseDeleted = true;
      console.log('User deleted from DynamoDB successfully');
    } catch (dbError) {
      console.error('Error deleting from DynamoDB:', dbError);
      throw new Error('Failed to delete user from database');
    }
    
    return {
      success: true,
      databaseDeleted,
      cognitoDeleted,
      message: cognitoDeleted ? 
        'User deleted from both Cognito and database successfully.' :
        'User deleted from database. Cognito deletion requires manual action.'
    };
    
  } catch (error) {
    console.error('Error in complete user deletion:', error);
    throw error;
  }
};

/**
 * Bulk user deletion
 */
export const bulkDeleteUsers = async (userIds, users) => {
  const results = [];
  
  for (const userId of userIds) {
    const user = users.find(u => u.id === userId);
    try {
      const result = await deleteUserCompletely(userId, user?.email || 'unknown');
      results.push({ userId, success: true, result });
    } catch (error) {
      results.push({ userId, success: false, error: error.message });
    }
  }
  
  return results;
};

/**
 * Check if user can be safely deleted
 */
export const canDeleteUser = (userId, currentUserId) => {
  // Prevent self-deletion
  if (userId === currentUserId) {
    return { canDelete: false, reason: 'Cannot delete your own account' };
  }
  
  // Add other business rules here
  // e.g., prevent deleting users with active applications
  
  return { canDelete: true };
};

/**
 * Get user deletion impact (what will be affected)
 */
export const getUserDeletionImpact = async (userId) => {
  try {
    // This would check for related data that will be affected
    const impact = {
      applications: 0, // Count of user's applications
      projects: 0,     // Count of user's projects (if faculty)
      messages: 0,     // Count of user's messages
      posts: 0         // Count of user's community posts
    };
    
    // In a real implementation, you would query for related data
    // const applications = await API.graphql(graphqlOperation(listApplicationsByUser, { userId }));
    // impact.applications = applications.data.listApplications.items.length;
    
    return impact;
  } catch (error) {
    console.error('Error getting deletion impact:', error);
    return null;
  }
};

export default {
  deleteUserCompletely,
  bulkDeleteUsers,
  canDeleteUser,
  getUserDeletionImpact
};
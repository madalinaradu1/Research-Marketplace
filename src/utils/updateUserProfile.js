import { API, graphqlOperation } from 'aws-amplify';
import { updateUser } from '../graphql/operations';

/**
 * Updates a user's profile completion status
 * @param {string} userId - The user ID to update
 * @param {boolean} isComplete - Whether the profile is complete
 * @returns {Promise} - Promise representing the updated user
 */
export async function updateProfileCompletion(userId, isComplete = true) {
  try {
    const input = {
      id: userId,
      profileComplete: isComplete
    };
    
    const result = await API.graphql(graphqlOperation(updateUser, { input }));
    console.log(`User ${userId} profile completion updated to ${isComplete}:`, result.data.updateUser);
    return result.data.updateUser;
  } catch (error) {
    console.error('Error updating profile completion:', error);
    throw error;
  }
}
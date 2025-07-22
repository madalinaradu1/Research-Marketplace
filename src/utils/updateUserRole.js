import { API, graphqlOperation } from 'aws-amplify';
import { updateUser } from '../graphql/mutations';

/**
 * Updates a user's role in the database
 * @param {string} userId - The user ID to update
 * @param {string} role - The new role (Admin, Faculty, Coordinator, Student)
 * @returns {Promise} - Promise representing the updated user
 */
export async function updateUserRole(userId, role) {
  try {
    const input = {
      id: userId,
      role: role
    };
    
    const result = await API.graphql(graphqlOperation(updateUser, { input }));
    console.log(`User ${userId} role updated to ${role}:`, result.data.updateUser);
    return result.data.updateUser;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}
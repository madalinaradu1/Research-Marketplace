import { API, graphqlOperation } from 'aws-amplify';
import { createUser, getUser } from '../graphql/operations';

/**
 * Creates a User record in DynamoDB after a user signs up with Cognito
 * @param {Object} userData - The user data from Cognito
 * @returns {Promise} - Promise representing the created user
 */
export async function createUserAfterSignUp(userData) {
  const { username, attributes } = userData;
  
  try {
    const userInput = {
      id: username, // Use Cognito username as ID
      name: attributes.name || `${attributes.given_name || ''} ${attributes.family_name || ''}`.trim(),
      email: attributes.email,
      role: 'Student', // Default role
      profileComplete: true // Set to true by default
    };
    
    // Check if user already exists
    try {
      const userExists = await checkUserExists(username);
      
      if (userExists) {
        console.log('User already exists, skipping creation');
        return null;
      }
      
      const result = await API.graphql(graphqlOperation(createUser, { input: userInput }));
      console.log('User record created successfully:', result.data.createUser);
      return result.data.createUser;
    } catch (graphQLError) {
      // If there's a conflict (user already exists), don't throw an error
      if (graphQLError.errors && graphQLError.errors[0].errorType === 'DynamoDB:ConditionalCheckFailedException') {
        console.log('User already exists (conditional check failed)');
        return null;
      }
      throw graphQLError;
    }
  } catch (error) {
    console.error('Error creating user record:', error);
    // Don't throw the error, just return null to prevent app crashes
    return null;
  }
}

/**
 * Checks if a user record exists in DynamoDB
 * @param {string} userId - The user ID to check
 * @returns {Promise<boolean>} - Whether the user exists
 */
export async function checkUserExists(userId) {
  try {
    const result = await API.graphql(graphqlOperation(getUser, { id: userId }));
    return !!result.data.getUser;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
}
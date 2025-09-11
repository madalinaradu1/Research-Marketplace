import { API, graphqlOperation } from 'aws-amplify';
import { createUser, getUser, listUsers } from '../graphql/operations';

/**
 * Creates a User record in DynamoDB after a user signs up with Cognito
 * @param {Object} userData - The user data from Cognito
 * @returns {Promise} - Promise representing the created user
 */
export async function createUserAfterSignUp(userData) {
  const { username, attributes } = userData;
  
  try {
    // Determine role based on email domain
    const email = attributes.email;
    let role = 'Student'; // Default role
    if (email.endsWith('@gcu.edu')) {
      role = 'Faculty';
    } else if (email.endsWith('@mygcu.edu')) {
      role = 'Student';
    }
    
    const userInput = {
      id: username, // Use UUID as primary key
      name: `${attributes.given_name || ''} ${attributes.family_name || ''}`.trim() || attributes.name || '',
      email: attributes.email,
      role: role,
      profileComplete: role !== 'Student' // All Students must complete profile
    };
    
    console.log('Creating user with attributes:', attributes);
    console.log('User input:', userInput);
    
    // Check if user already exists by email (for admin-created users)
    try {
      const emailFilter = {
        email: {
          eq: attributes.email
        }
      };
      console.log('Searching for user with email:', attributes.email);
      console.log('Using filter:', emailFilter);
      const existingUsersByEmail = await API.graphql(graphqlOperation(listUsers, { 
        filter: emailFilter,
        limit: 1
      }));
      
      console.log('Email search result:', existingUsersByEmail.data.listUsers.items);
      if (existingUsersByEmail.data.listUsers.items.length > 0) {
        console.log('User already exists by email, preserving existing profile:', existingUsersByEmail.data.listUsers.items[0]);
        return existingUsersByEmail.data.listUsers.items[0];
      }
      
      // Fallback: fetch all users and filter client-side
      console.log('GraphQL filter failed, trying client-side search');
      const allUsers = await API.graphql(graphqlOperation(listUsers, { limit: 100 }));
      const userByEmail = allUsers.data.listUsers.items.find(user => user.email === attributes.email);
      
      if (userByEmail) {
        console.log('Found user by client-side email search:', userByEmail);
        console.log('User role from database:', userByEmail.role);
        return userByEmail;
      }
      console.log('No existing user found by email, creating new user');
      
      // If no existing user found, create new one with default role
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
 * @param {string} email - The user email to check
 * @returns {Promise<boolean>} - Whether the user exists
 */
export async function checkUserExists(email) {
  try {
    // First try to find by email (for backward compatibility)
    const result = await API.graphql(graphqlOperation(getUser, { id: email }));
    return !!result.data.getUser;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
}
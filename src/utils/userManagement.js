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
    const email = attributes.email.toLowerCase().trim();
    console.log('Processing user signup for email:', email);
    console.log('Cognito UUID:', username);
    
    // FIRST: Check if user already exists by UUID
    try {
      const result = await API.graphql(graphqlOperation(getUser, { id: username }));
      if (result.data.getUser) {
        console.log('User found by UUID, returning existing user:', result.data.getUser);
        return result.data.getUser;
      }
    } catch (uuidError) {
      console.log('No user found by UUID, checking by email');
    }
    
    // SECOND: Check if user already exists by email (admin-created users)
    console.log('Searching for existing user with email:', email);
    console.log('Email to search for (normalized):', email.toLowerCase().trim());
    
    try {
      const allUsers = await API.graphql(graphqlOperation(listUsers, { limit: 1000 }));
      console.log('Total users found:', allUsers.data.listUsers.items.length);
      
      // Test specific email
      const testEmail = 'matthew.craig@gcu.edu';
      console.log('Testing search for specific email:', testEmail);
      const testUser = allUsers.data.listUsers.items.find(u => u.email === testEmail);
      console.log('Test result for matthew.craig@gcu.edu:', testUser);
      
      // Log all users for debugging
      allUsers.data.listUsers.items.forEach(user => {
        console.log('User in DB:', user.email, 'ID:', user.id, 'Role:', user.role);
      });
      
      const userByEmail = allUsers.data.listUsers.items.find(user => {
        if (!user.email) return false;
        const userEmail = user.email.toLowerCase().trim();
        const searchEmail = email.toLowerCase().trim();
        console.log('Comparing:', userEmail, '===', searchEmail, '?', userEmail === searchEmail);
        return userEmail === searchEmail;
      });
      
      if (userByEmail) {
        console.log('FOUND EXISTING USER BY EMAIL - RETURNING:', userByEmail);
        console.log('Existing user role:', userByEmail.role);
        console.log('Existing user ID:', userByEmail.id);
        return userByEmail;
      } else {
        console.log('NO EXISTING USER FOUND BY EMAIL in listUsers');
        console.log('Searched for:', email);
        
        // Try GraphQL filter as fallback
        try {
          console.log('Trying GraphQL email filter as fallback');
          const emailFilter = { email: { eq: email } };
          const filterResult = await API.graphql(graphqlOperation(listUsers, { 
            filter: emailFilter,
            limit: 10
          }));
          
          console.log('GraphQL filter result:', filterResult.data.listUsers.items);
          
          if (filterResult.data.listUsers.items.length > 0) {
            const foundUser = filterResult.data.listUsers.items[0];
            console.log('FOUND USER WITH GRAPHQL FILTER:', foundUser);
            return foundUser;
          }
        } catch (filterError) {
          console.error('GraphQL filter also failed:', filterError);
        }
      }
    } catch (error) {
      console.error('Error checking existing user by email:', error);
    }
    
    // Create new user if not found
    console.log('No existing user found. User must be created by admin first.');
    
    const newUser = {
      id: username,
      email: email,
      name: attributes.name || email.split('@')[0],
      role:'Student', // Get role from Cognito attribute
      profileComplete: false,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await API.graphql(graphqlOperation(createUser, { input: newUser }));
      console.log('New user created:', newUser);
      return newUser;
    } catch (createError) {
      console.error('Error creating new user:', createError);
      return null;
    }
    
  } catch (error) {
    console.error('Error in createUserAfterSignUp:', error);
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
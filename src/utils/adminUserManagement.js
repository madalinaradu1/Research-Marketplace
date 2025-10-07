import { Auth } from 'aws-amplify';

export const createUser = async (email, temporaryPassword, attributes = {}) => {
  try {
    const params = {
      username: email,
      password: temporaryPassword,
      attributes: {
        email,
        email_verified: 'true',
        ...attributes
      }
    };
    
    const result = await Auth.signUp(params);
    return result;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const canDeleteUser = (user) => {
  // Add your logic for when a user can be deleted
  return user && user.status !== 'active';
};
/**
 * Check if a user is an admin based on Cognito groups or DynamoDB role
 * @param {Object} user - The user object from Cognito
 * @param {Object} userProfile - The user profile from DynamoDB
 * @returns {boolean} - Whether the user is an admin
 */
export function isUserAdmin(user, userProfile) {
  // Check Cognito groups in attributes
  const hasAdminGroupInAttributes = user?.attributes?.['cognito:groups']?.includes('Admin');
  
  // Check Cognito groups in session token
  const hasAdminGroupInToken = user?.signInUserSession?.accessToken?.payload?.['cognito:groups']?.includes('Admin');
  
  // Check role in DynamoDB
  const hasAdminRole = userProfile?.role === 'Admin';
  

  
  return hasAdminGroupInAttributes || hasAdminGroupInToken || hasAdminRole;
}
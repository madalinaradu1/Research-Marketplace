const AWS = require('aws-sdk');

exports.handler = async (event, context) => {
  console.log('PostConfirmation trigger:', JSON.stringify(event, null, 2));
  
  const { userAttributes, userName } = event.request;
  
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  
  // Determine role based on email domain
  let role = 'Student';
  if (userAttributes.email && userAttributes.email.includes('@gcu.edu')) {
    role = 'Faculty';
  }
  
  const userRecord = {
    id: userName,
    email: userAttributes.email,
    name: userAttributes.name || userAttributes.email.split('@')[0],
    role: role,
    profileComplete: false,
    status: 'Active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __typename: 'User'
  };
  
  try {
    await dynamodb.put({
      TableName: `User-${process.env.API_RESEARCHMARKETPLACE_GRAPHQLAPIIDOUTPUT}-${process.env.ENV}`,
      Item: userRecord
    }).promise();
    
    console.log('User record created successfully:', userRecord.id);
  } catch (error) {
    console.error('Error creating user record:', error.message);
  }
  
  return event;
};

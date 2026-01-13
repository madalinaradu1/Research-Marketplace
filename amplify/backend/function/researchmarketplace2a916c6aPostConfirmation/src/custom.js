const AWS = require('aws-sdk');

// Lambda handler function that processes post-confirmation events from Cognito
exports.handler = async (event, context) => {
  try {
    // Validate that required event data exists
    if (!event.request?.userAttributes || !event.userName) {
      console.error('Invalid event structure');
      return event;
    }
    
    // Extract user data from the event
    const { userAttributes, userName } = event.request;
    // Initialize DynamoDB document client
    const dynamodb = new AWS.DynamoDB.DocumentClient();
    
    // Additional validation of required fields
    if (!userAttributes.email || !userName) {
      console.error('Missing required user attributes');
      return event;
    }
    
    // Normalize email address
    const email = userAttributes.email.toLowerCase().trim();
    // Construct DynamoDB table name using environment variables
    const tableName = `User-${process.env.API_RESEARCHMARKETPLACE_GRAPHQLAPIIDOUTPUT}-${process.env.ENV}`;
    
    // Check for existing users with same email to prevent duplicates
    try {
      const existingUsers = await dynamodb.scan({
        TableName: tableName,
        FilterExpression: 'email = :email',
        ExpressionAttributeValues: {
          ':email': email
        }
      }).promise();
      
      // If user with email exists, exit early
      if (existingUsers.Items && existingUsers.Items.length > 0) {
        console.log('DUPLICATE DETECTED: User with this email already exists');
        // Don't create duplicate - just return
        return event;
      }
    } catch (scanError) {
      console.error('Error checking for duplicates:', scanError);
    }
    
    // Set default role as Student
    let role = 'Student';
    
    // Construct user record with required fields
    const userRecord = {
      id: userName,
      email: email,
      name: userAttributes.name || email.split('@')[0], // Use email prefix if name not provided
      role: role,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __typename: 'User'
    };
  
    // Use conditional write to prevent race conditions
    try {
      await dynamodb.put({
        Item: userRecord,
        ConditionExpression: 'attribute_not_exists(id)' // Only create if ID doesn't exist
      }).promise();
      
      console.log('User record created successfully:', userRecord.id);
    } catch (dbError) {
      if (dbError.code === 'ConditionalCheckFailedException') {
        console.log('User already exists, skipping creation');
      } else {
        console.error('Error creating user record:', dbError.message);
      }
    }
    
  } catch (error) {
    // Log any errors that occur during the process
    console.error('Post-confirmation error:', error.message);
  }
  
  // Return the original event
  return event;
};


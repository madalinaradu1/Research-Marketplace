const AWS = require('aws-sdk');

// Configure DynamoDB
const dynamodb = new AWS.DynamoDB.DocumentClient({
  region: 'us-west-2'
});

async function createAdminUser() {
  const userRecord = {
    id: '28b1c300-a061-70cd-dd51-efdb7bd60546',
    email: 'madalina.radu1@gcu.edu',
    name: 'Madalina Radu',
    role: 'Admin',
    profileComplete: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    __typename: 'User'
  };

  try {
    await dynamodb.put({
      TableName: 'User-d2ab4l779whdq-dev', // Your DynamoDB table name
      Item: userRecord
    }).promise();
    
    console.log('Admin user created successfully in database!');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();
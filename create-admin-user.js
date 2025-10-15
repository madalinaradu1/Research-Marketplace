// Quick script to create admin user in database
// Run this once to create your admin account

const { API, graphqlOperation } = require('aws-amplify');
const { createUser } = require('./src/graphql/operations.js');
const { Amplify } = require('aws-amplify');
const awsconfig = require('./src/aws-exports.js');

Amplify.configure(awsconfig);

async function createAdminUser() {
  try {
    const adminUser = {
      id: '28b1c300-a061-70cd-dd51-efdb7bd60546', // Your Cognito UUID
      email: 'madalina.radu1@gcu.edu',
      name: 'Madalina Radu',
      role: 'Admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await API.graphql(graphqlOperation(createUser, { input: adminUser }));
    console.log('Admin user created successfully:', result.data.createUser);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();
import { API } from 'aws-amplify';

/**
 * Delete user from Cognito User Pool via API Gateway + Lambda
 */
export const deleteCognitoUser = async (userId) => {
  try {
    // This calls a Lambda function that has admin privileges to delete from Cognito
    const response = await fetch('/api/admin/delete-cognito-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting Cognito user:', error);
    throw error;
  }
};

/**
 * Lambda function code (to be deployed separately)
 * This would go in amplify/backend/function/adminDeleteUser/src/index.js
 */
export const lambdaFunctionCode = `
const AWS = require('aws-sdk');
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    try {
        const { userId } = JSON.parse(event.body);
        const userPoolId = process.env.USER_POOL_ID;
        
        if (!userId || !userPoolId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'userId and userPoolId are required' })
            };
        }

        // Delete from Cognito User Pool
        await cognitoIdentityServiceProvider.adminDeleteUser({
            UserPoolId: userPoolId,
            Username: userId
        }).promise();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'User deleted from Cognito successfully',
                userId
            })
        };

    } catch (error) {
        console.error('Error deleting Cognito user:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to delete user from Cognito',
                details: error.message
            })
        };
    }
};
`;

export default {
  deleteCognitoUser,
  lambdaFunctionCode
};
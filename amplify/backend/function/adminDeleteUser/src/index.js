

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
        
        // Get User Pool ID from environment variables
        const userPoolId = process.env.AUTH_RESEARCHMARKETPLACE_USERPOOLID || 
                          process.env.AUTH_RESEARCHMARKETPLACE74F5F456_USERPOOLID ||  
                          process.env.AMPLIFY_USERPOOL_ID;
        
        if (!userId || !userPoolId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'userId and userPoolId are required' })
            };
        }

        console.log(`Deleting user: ${userId} from UserPool: ${userPoolId}`);
        console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('USERPOOL')));

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

/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

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
        const { email, name, role, department } = JSON.parse(event.body);
        
        const userPoolId = process.env.AUTH_RESEARCHMARKETPLACE_USERPOOLID;
        
        if (!email || !name) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Email and name are required' })
            };
        }

        if (!userPoolId) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'User Pool ID not configured' })
            };
        }

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';

        // Create user in Cognito
        const createParams = {
            UserPoolId: userPoolId,
            Username: email,
            UserAttributes: [
                { Name: 'email', Value: email },
                { Name: 'email_verified', Value: 'true' },
                { Name: 'given_name', Value: name.split(' ')[0] },
                { Name: 'family_name', Value: name.split(' ').slice(1).join(' ') || name },
                { Name: 'preferred_username', Value: email }
            ],
            TemporaryPassword: tempPassword,
            MessageAction: 'SUPPRESS' // Don't send default email
        };

        const createResult = await cognitoIdentityServiceProvider.adminCreateUser(createParams).promise();

        // Add user to appropriate group based on role
        if (role && role !== 'Student') {
            try {
                await cognitoIdentityServiceProvider.adminAddUserToGroup({
                    UserPoolId: userPoolId,
                    Username: email,
                    GroupName: role
                }).promise();
            } catch (groupError) {
                console.log('Group assignment failed (group may not exist):', groupError.message);
            }
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'User created in Cognito successfully',
                userId: createResult.User.Username,
                tempPassword: tempPassword
            })
        };

    } catch (error) {
        console.error('Error creating Cognito user:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to create user in Cognito',
                details: error.message
            })
        };
    }
};

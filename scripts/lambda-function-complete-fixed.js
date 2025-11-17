// AWS SDK v3 is available in Node.js 22 runtime
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminDeleteUserCommand, AdminAddUserToGroupCommand, AdminRemoveUserFromGroupCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const sesClient = new SESClient({ region: 'us-west-2' });
const cognitoClient = new CognitoIdentityProviderClient({ region: 'us-west-2' });
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'us-west-2' }));

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    };

    if (event.httpMethod === 'OPTIONS') {
        return { 
            statusCode: 200, 
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            }
        };
    }

    try {
        console.log('Event:', JSON.stringify(event, null, 2));
        const path = event.path || event.rawPath;
        const body = event.body ? JSON.parse(event.body) : {};
        
        switch (path) {
            case '/cloudwatch-metrics':
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        metrics: {
                            systemUptime: '99.9%',
                            avgResponseTime: '245ms',
                            storageUsed: '2.3GB',
                            errorRate: '0.02%'
                        }
                    })
                };
                
            case '/create-user':
                const { email, name, role } = body;
                let actualCognitoUserId = null;
                let tempPassword = Math.random().toString(36).slice(-8) + '!' + Math.random().toString(36).slice(-3).toUpperCase();
                
                try {
                    const createUserParams = {
                        UserPoolId: 'us-west-2_KuizmjgYE',
                        Username: email,
                        UserAttributes: [
                            { Name: 'email', Value: email },
                            { Name: 'email_verified', Value: 'true' },
                            { Name: 'name', Value: name }
                        ],
                        TemporaryPassword: tempPassword,
                        MessageAction: 'SUPPRESS'
                    };
                    
                    const createResult = await cognitoClient.send(new AdminCreateUserCommand(createUserParams));
                    actualCognitoUserId = createResult.User.Username;
                    
                    await cognitoClient.send(new AdminSetUserPasswordCommand({
                        UserPoolId: 'us-west-2_KuizmjgYE',
                        Username: actualCognitoUserId,
                        Password: tempPassword,
                        Permanent: false
                    }));
                    
                    if (role && ['Student', 'Faculty', 'Coordinator', 'Admin'].includes(role)) {
                        try {
                            await cognitoClient.send(new AdminAddUserToGroupCommand({
                                UserPoolId: 'us-west-2_KuizmjgYE',
                                Username: actualCognitoUserId,
                                GroupName: role
                            }));
                        } catch (groupError) {
                            console.error('Failed to add user to group:', groupError);
                        }
                    }
                    
                    try {
                        await dynamoClient.send(new PutCommand({
                            TableName: `User-${process.env.ENV || 'dev'}`,
                            Item: {
                                id: actualCognitoUserId,
                                email: email,
                                name: name,
                                role: role,
                                department: body.department || 'Not Specified',
                                profileComplete: false,
                                owner: actualCognitoUserId,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            }
                        }));
                    } catch (dbError) {
                        console.error('Failed to create user in database:', dbError);
                    }
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            userId: actualCognitoUserId,
                            message: 'User created successfully'
                        })
                    };
                } catch (error) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Failed to create user',
                            details: error.message
                        })
                    };
                }

            case '/delete-user':
                const { userId, userEmail } = body;
                console.log('Delete user request:', { userId, userEmail });
                
                if (!userId && !userEmail) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Missing userId or userEmail'
                        })
                    };
                }
                
                try {
                    // Try with userId first, then userEmail
                    const username = userId || userEmail;
                    console.log('Attempting to delete Cognito user:', username);
                    
                    await cognitoClient.send(new AdminDeleteUserCommand({
                        UserPoolId: 'us-west-2_KuizmjgYE',
                        Username: username
                    }));
                    
                    console.log('Successfully deleted user from Cognito:', username);
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            message: 'User deleted from Cognito successfully'
                        })
                    };
                } catch (error) {
                    console.error('Cognito user deletion failed:', error);
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Failed to delete user from Cognito',
                            details: error.message,
                            code: error.name
                        })
                    };
                }
                
            default:
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Endpoint not found' })
                };
        }
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};
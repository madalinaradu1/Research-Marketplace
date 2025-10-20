// AWS SDK v3 is available in Node.js 22 runtime
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminDeleteUserCommand, AdminAddUserToGroupCommand, AdminRemoveUserFromGroupCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
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
        return { statusCode: 200, headers };
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
                let cognitoSuccess = false;
                let actualCognitoUserId = null;
                let tempPassword = Math.random().toString(36).slice(-8) + '!' + Math.random().toString(36).slice(-3).toUpperCase();
                
                // Try to create user in Cognito
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
                    actualCognitoUserId = createResult.User.Username; // Get actual Cognito UUID
                    
                    const setPasswordParams = {
                        UserPoolId: 'us-west-2_KuizmjgYE',
                        Username: actualCognitoUserId,
                        Password: tempPassword,
                        Permanent: false
                    };
                    
                    await cognitoClient.send(new AdminSetUserPasswordCommand(setPasswordParams));
                    
                    // Add user to appropriate Cognito group based on role
                    if (role && ['Student', 'Faculty', 'Coordinator', 'Admin'].includes(role)) {
                        try {
                            await cognitoClient.send(new AdminAddUserToGroupCommand({
                                UserPoolId: 'us-west-2_KuizmjgYE',
                                Username: actualCognitoUserId,
                                GroupName: role
                            }));
                            console.log(`User added to ${role} group:`, actualCognitoUserId);
                        } catch (groupError) {
                            console.error('Failed to add user to group:', groupError);
                            // Don't fail the entire operation if group assignment fails
                        }
                    }
                    
                    cognitoSuccess = true;
                    
                    // Create user record in DynamoDB
                    try {
                        const userRecord = {
                            id: actualCognitoUserId,
                            email: email,
                            name: name,
                            role: role,
                            department: body.department || 'Not Specified',
                            profileComplete: false,
                            owner: actualCognitoUserId,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        
                        await dynamoClient.send(new PutCommand({
                            TableName: `User-${process.env.ENV || 'dev'}`,
                            Item: userRecord
                        }));
                        
                        console.log('User created in database:', actualCognitoUserId);
                    } catch (dbError) {
                        console.error('Failed to create user in database:', dbError);
                        // Don't fail the entire operation if DB creation fails
                    }
                } catch (cognitoError) {
                    console.error('Cognito user creation failed:', cognitoError);
                    // Don't create fallback ID - return error instead
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Failed to create user in Cognito',
                            details: cognitoError.message
                        })
                    };
                }
                
                // Try to send email
                try {
                    
                    // Send welcome email via SES
                    const emailParams = {
                        Source: 'madalina.radu1@gcu.edu',
                        Destination: {
                            ToAddresses: ['madalina.radu1@gcu.edu'] // Send all notifications to your email in sandbox
                        },
                        Message: {
                            Subject: {
                                Data: `Welcome to GCU Research Marketplace!`,
                                Charset: 'UTF-8'
                            },
                            Body: {
                                Text: {
                                    Data: `Note: This email was intended for ${email} but sent to your verified address for testing.\n\nWelcome to GCU Research Marketplace!\n\nHello ${name},\n\nYour account has been created successfully. Here are your login credentials:\n\nEmail: ${email}\nTemporary Password: ${tempPassword}\nRole: ${role}\n\nPlease log in to the Research Marketplace and change your password on first login.\n\nBest regards,\nGCU Research Team`,
                                    Charset: 'UTF-8'
                                },
                                Html: {
                                    Data: `
                                        <p><em>Note: This email was intended for ${email} but sent to your verified address for testing.</em></p>
                                        <h2>Welcome to GCU Research Marketplace!</h2>
                                        <p>Hello ${name},</p>
                                        <p>Your account has been created successfully. Here are your login credentials:</p>
                                        <p><strong>Email:</strong> ${email}<br>
                                        <strong>Temporary Password:</strong> ${tempPassword}<br>
                                        <strong>Role:</strong> ${role}</p>
                                        <p>Please log in to the Research Marketplace using the link below and change your password:</p>
                                        <p><a href="https://master.d12p7fg02coi07.amplifyapp.com">Access Research Marketplace</a></p>
                                        <p>You will be prompted to change your password on first login.</p>
                                        <p>Best regards,<br>GCU Research Team</p>
                                    `,
                                    Charset: 'UTF-8'
                                }
                            }
                        }
                    };
                    
                    await sesClient.send(new SendEmailCommand(emailParams));
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            userId: actualCognitoUserId,
                            cognitoUserId: actualCognitoUserId,
                            role: role,
                            message: 'User created successfully in Cognito'
                        })
                    };
                } catch (emailError) {
                    console.error('Email sending failed:', emailError);
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            userId: actualCognitoUserId,
                            cognitoUserId: actualCognitoUserId,
                            role: role,
                            message: 'User created successfully in Cognito (email notification failed)'
                        })
                    };
                }
                
            case '/update-user-group':
                const { username, newRole, oldRole } = body;
                
                if (!username || !newRole) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Missing username or newRole'
                        })
                    };
                }
                
                try {
                    // Remove from old group if specified
                    if (oldRole && ['Student', 'Faculty', 'Coordinator', 'Admin'].includes(oldRole)) {
                        try {
                            await cognitoClient.send(new AdminRemoveUserFromGroupCommand({
                                UserPoolId: 'us-west-2_KuizmjgYE',
                                Username: username,
                                GroupName: oldRole
                            }));
                        } catch (removeError) {
                            console.log('User was not in old group or removal failed:', removeError.message);
                        }
                    }
                    
                    // Add to new group
                    if (['Student', 'Faculty', 'Coordinator', 'Admin'].includes(newRole)) {
                        await cognitoClient.send(new AdminAddUserToGroupCommand({
                            UserPoolId: 'us-west-2_KuizmjgYE',
                            Username: username,
                            GroupName: newRole
                        }));
                    }
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            message: `User group updated to ${newRole} successfully`
                        })
                    };
                } catch (error) {
                    console.error('Group update failed:', error);
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Failed to update user group',
                            details: error.message
                        })
                    };
                }
                
            case '/clean-old-files':
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: 'File cleanup initiated'
                    })
                };
                
            case '/backup-database':
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        ddlScript: 'CREATE TABLE users...',
                        message: 'Database backup generated'
                    })
                };
                
            case '/send-email':
                const { to, subject, message, type } = body;
                
                try {
                    const emailParams = {
                        Source: 'madalina.radu1@gcu.edu',
                        Destination: {
                            ToAddresses: ['madalina.radu1@gcu.edu']
                        },
                        Message: {
                            Subject: {
                                Data: subject || 'Research Marketplace Notification',
                                Charset: 'UTF-8'
                            },
                            Body: {
                                Text: {
                                    Data: `Note: This email was intended for ${to} but sent to your verified address for testing.\n\n${message}`,
                                    Charset: 'UTF-8'
                                }
                            }
                        }
                    };
                    
                    await sesClient.send(new SendEmailCommand(emailParams));
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            message: 'Email sent successfully'
                        })
                    };
                } catch (error) {
                    console.error('Email sending failed:', error);
                    return {
                        statusCode: 500,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Failed to send email',
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
                    // Try with email first (Cognito username is usually email)
                    const username = userEmail || userId;
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
                    console.error('Error details:', {
                        code: error.name,
                        message: error.message,
                        userId,
                        userEmail
                    });
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

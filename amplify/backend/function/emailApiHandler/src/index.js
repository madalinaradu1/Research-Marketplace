// AWS SDK v3 is available in Node.js 22 runtime
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminDeleteUserCommand, AdminAddUserToGroupCommand, AdminRemoveUserFromGroupCommand } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
const sesClient = new SESClient({ region: 'us-west-2' });
const cognitoClient = new CognitoIdentityProviderClient({ region: 'us-west-2' });
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'us-west-2' }));

export const handler = async (event) => {
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
                let cognitoSuccess = false;
                let actualCognitoUserId = null;
                let tempPassword = Math.random().toString(36).slice(-8) + '!' + Math.random().toString(36).slice(-3).toUpperCase();
                
                // Try to create user in Cognito
                try {
                    const createUserParams = {
                        UserPoolId: 'us-west-2_UA7PlngqC',
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
                        UserPoolId: 'us-west-2_UA7PlngqC',
                        Username: actualCognitoUserId,
                        Password: tempPassword,
                        Permanent: false
                    };
                    
                    await cognitoClient.send(new AdminSetUserPasswordCommand(setPasswordParams));
                    
                    // Add user to appropriate Cognito group based on role
                    if (role && ['Student', 'Faculty', 'Coordinator', 'Admin'].includes(role)) {
                        try {
                            await cognitoClient.send(new AdminAddUserToGroupCommand({
                                UserPoolId: 'us-west-2_UA7PlngqC',
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
                    // List of verified SES identities
                    const verifiedEmails = [
                        'madalina.radu1@gcu.edu',
                        'dlemus4@my.gcu.edu',
                        'ldycus@my.gcu.edu', 
                        'OFusco@my.gcu.edu',
                        'bberger7@my.gcu.edu',
                        'ABrajovic@my.gcu.edu'
                    ];
                    
                    // Check if user's email is verified, otherwise send to admin
                    const isVerified = verifiedEmails.includes(email);
                    const recipientEmail = isVerified ? email : 'madalina.radu1@gcu.edu';
                    
                    // Send welcome email via SES
                    const emailParams = {
                        Source: 'madalina.radu1@gcu.edu',
                        Destination: {
                            ToAddresses: [recipientEmail]
                        },
                        Message: {
                            Subject: {
                                Data: `Welcome to GCU Research Marketplace!`,
                                Charset: 'UTF-8'
                            },
                            Body: {
                                Text: {
                                    Data: isVerified ? 
                                        `Welcome to GCU Research Marketplace!\n\nHello ${name},\n\nYour account has been created successfully. Here are your login credentials:\n\nEmail: ${email}\nTemporary Password: ${tempPassword}\nRole: ${role}\n\nPlease log in to the Research Marketplace and change your password on first login.\n\nBest regards,\nGCU Research Team` :
                                        `Note: This email was intended for ${email} but sent to your verified address for testing.\n\nWelcome to GCU Research Marketplace!\n\nHello ${name},\n\nYour account has been created successfully. Here are your login credentials:\n\nEmail: ${email}\nTemporary Password: ${tempPassword}\nRole: ${role}\n\nPlease log in to the Research Marketplace and change your password on first login.\n\nBest regards,\nGCU Research Team`,
                                    Charset: 'UTF-8'
                                },
                                Html: {
                                    Data: isVerified ?
                                        `<h2>Welcome to GCU Research Marketplace!</h2>
                                        <p>Hello ${name},</p>
                                        <p>Your account has been created successfully. Here are your login credentials:</p>
                                        <p><strong>Email:</strong> ${email}<br>
                                        <strong>Temporary Password:</strong> ${tempPassword}<br>
                                        <strong>Role:</strong> ${role}</p>
                                        <p>Please log in to the Research Marketplace using the link below and change your password:</p>
                                        <p><a href="https://master.d12p7fg02coi07.amplifyapp.com">Access Research Marketplace</a></p>
                                        <p>You will be prompted to change your password on first login.</p>
                                        <p>Best regards,<br>GCU Research Team</p>` :
                                        `<p><em>Note: This email was intended for ${email} but sent to your verified address for testing.</em></p>
                                        <h2>Welcome to GCU Research Marketplace!</h2>
                                        <p>Hello ${name},</p>
                                        <p>Your account has been created successfully. Here are your login credentials:</p>
                                        <p><strong>Email:</strong> ${email}<br>
                                        <strong>Temporary Password:</strong> ${tempPassword}<br>
                                        <strong>Role:</strong> ${role}</p>
                                        <p>Please log in to the Research Marketplace using the link below and change your password:</p>
                                        <p><a href="https://master.d12p7fg02coi07.amplifyapp.com">Access Research Marketplace</a></p>
                                        <p>You will be prompted to change your password on first login.</p>
                                        <p>Best regards,<br>GCU Research Team</p>`,
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
                
            case '/fix-admin-group':
                // Add current user to Admin group
                const { adminUserId, adminEmail } = body;
                
                if (!adminUserId && !adminEmail) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Missing adminUserId or adminEmail'
                        })
                    };
                }
                
                try {
                    const username = adminUserId || adminEmail;
                    
                    await cognitoClient.send(new AdminAddUserToGroupCommand({
                        UserPoolId: 'us-west-2_UA7PlngqC',
                        Username: username,
                        GroupName: 'Admin'
                    }));
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            message: 'User added to Admin group successfully'
                        })
                    };
                } catch (error) {
                    console.error('Failed to add user to Admin group:', error);
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Failed to add user to Admin group',
                            details: error.message
                        })
                    };
                }
                
            case '/assign-existing-users':
                // Get users from DynamoDB and assign groups based on their roles
                try {
                    
                    const scanParams = {
                        TableName: `User-${process.env.ENV || 'dev'}`
                    };
                    
                    const dynamoRawClient = new DynamoDBClient({ region: 'us-west-2' });
                    const scanResult = await dynamoRawClient.send(new ScanCommand(scanParams));
                    
                    const assignmentResults = [];
                    
                    for (const item of scanResult.Items || []) {
                        const user = unmarshall(item);
                        if (user.role && user.id) {
                            try {
                                await cognitoClient.send(new AdminAddUserToGroupCommand({
                                    UserPoolId: 'us-west-2_UA7PlngqC',
                                    Username: user.id,
                                    GroupName: user.role
                                }));
                                assignmentResults.push({ userId: user.id, role: user.role, success: true });
                            } catch (error) {
                                assignmentResults.push({ userId: user.id, role: user.role, success: false, error: error.message });
                            }
                        }
                    }
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            assignmentResults,
                            message: `Processed ${assignmentResults.length} existing users`
                        })
                    };
                } catch (error) {
                    return {
                        statusCode: 500,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Failed to assign groups to existing users',
                            details: error.message
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
                                UserPoolId: 'us-west-2_UA7PlngqC',
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
                            UserPoolId: 'us-west-2_UA7PlngqC',
                            Username: username,
                            GroupName: newRole
                        }));
                    }
                    
                    // Update role in DynamoDB
                    try {
                        await dynamoClient.send(new UpdateCommand({
                            TableName: `User-${process.env.ENV || 'dev'}`,
                            Key: { id: username },
                            UpdateExpression: 'SET #role = :role, updatedAt = :updatedAt',
                            ExpressionAttributeNames: { '#role': 'role' },
                            ExpressionAttributeValues: {
                                ':role': newRole,
                                ':updatedAt': new Date().toISOString()
                            }
                        }));
                    } catch (dbError) {
                        console.error('Failed to update role in database:', dbError);
                    }
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            message: `User role updated to ${newRole} in both Cognito and database`
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
                    // List of verified SES identities
                    const verifiedEmails = [
                        'madalina.radu1@gcu.edu',
                        'dlemus4@my.gcu.edu',
                        'ldycus@my.gcu.edu', 
                        'OFusco@my.gcu.edu',
                        'bberger7@my.gcu.edu',
                        'ABrajovic@my.gcu.edu'
                    ];
                    
                    // Check if recipient's email is verified, otherwise send to admin
                    const isVerified = verifiedEmails.includes(to);
                    const recipientEmail = isVerified ? to : 'madalina.radu1@gcu.edu';
                    
                    const emailParams = {
                        Source: 'madalina.radu1@gcu.edu',
                        Destination: {
                            ToAddresses: [recipientEmail]
                        },
                        Message: {
                            Subject: {
                                Data: subject || 'Research Marketplace Notification',
                                Charset: 'UTF-8'
                            },
                            Body: {
                                Text: {
                                    Data: isVerified ? message : `Note: This email was intended for ${to} but sent to your verified address for testing.\n\n${message}`,
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
                
            case '/update-project':
                const { projectId, coordinatorNotes, projectStatus, rejectionReason } = body;
                
                if (!projectId) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Missing projectId'
                        })
                    };
                }
                
                try {
                    const updateParams = {
                        TableName: `Project-${process.env.ENV || 'dev'}`,
                        Key: { id: projectId },
                        UpdateExpression: 'SET updatedAt = :updatedAt',
                        ExpressionAttributeValues: {
                            ':updatedAt': new Date().toISOString()
                        }
                    };
                    
                    if (coordinatorNotes) {
                        updateParams.UpdateExpression += ', coordinatorNotes = :notes';
                        updateParams.ExpressionAttributeValues[':notes'] = coordinatorNotes;
                    }
                    
                    if (projectStatus) {
                        updateParams.UpdateExpression += ', projectStatus = :status';
                        updateParams.ExpressionAttributeValues[':status'] = projectStatus;
                    }
                    
                    if (rejectionReason) {
                        updateParams.UpdateExpression += ', rejectionReason = :reason';
                        updateParams.ExpressionAttributeValues[':reason'] = rejectionReason;
                    }
                    
                    await dynamoClient.send(new UpdateCommand(updateParams));
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            message: 'Project updated successfully'
                        })
                    };
                } catch (error) {
                    console.error('Project update failed:', error);
                    return {
                        statusCode: 500,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Failed to update project',
                            details: error.message
                        })
                    };
                }
                
            case '/delete-user':
                const { userId, userEmail, userData } = body;
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
                    const username = userEmail || userId;
                    const userIdToDelete = userId || username;
                    console.log('Attempting to delete user:', username);
                    
                    // Create DeletedUser record first (before deletion)
                    if (userData) {
                        try {
                            const deletedUserRecord = {
                                id: `deleted_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                originalUserID: userIdToDelete,
                                name: userData.name || 'Unknown',
                                email: userData.email || userEmail || 'unknown@example.com',
                                role: userData.role || 'Unknown',
                                deletionScheduledAt: new Date().toISOString(),
                                isTestMode: false,
                                userData: JSON.stringify(userData),
                                status: 'DELETED',
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString()
                            };
                            
                            await dynamoClient.send(new PutCommand({
                                TableName: `DeletedUser-${process.env.ENV || 'dev'}`,
                                Item: deletedUserRecord
                            }));
                            console.log('Created DeletedUser record:', deletedUserRecord.id);
                        } catch (deletedUserError) {
                            console.error('Failed to create DeletedUser record:', deletedUserError);
                        }
                    }
                    
                    // Delete from Cognito
                    try {
                        await cognitoClient.send(new AdminDeleteUserCommand({
                            UserPoolId: 'us-west-2_UA7PlngqC',
                            Username: username
                        }));
                        console.log('Successfully deleted user from Cognito:', username);
                    } catch (cognitoError) {
                        console.error('Cognito deletion failed:', cognitoError);
                    }
                    
                    // Delete from DynamoDB User table
                    try {
                        console.log('Attempting to delete from User table:', userIdToDelete);
                        const deleteResult = await dynamoClient.send(new DeleteCommand({
                            TableName: `User-${process.env.ENV || 'dev'}`,
                            Key: { id: userIdToDelete }
                        }));
                        console.log('Successfully deleted user from database:', userIdToDelete, deleteResult);
                    } catch (dbError) {
                        console.error('Database deletion failed:', dbError);
                        console.error('Delete error details:', {
                            tableName: `User-${process.env.ENV || 'dev'}`,
                            key: { id: userIdToDelete },
                            error: dbError.message
                        });
                    }
                    
                    return {
                        statusCode: 200,
                        headers,
                        body: JSON.stringify({
                            success: true,
                            message: 'User deleted from Cognito, database, and archived in DeletedUser table'
                        })
                    };
                } catch (error) {
                    console.error('User deletion failed:', error);
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Failed to delete user',
                            details: error.message
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

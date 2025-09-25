/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminDeleteUserCommand, AdminAddUserToGroupCommand, AdminRemoveUserFromGroupCommand } = require('@aws-sdk/client-cognito-identity-provider');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');


const cognitoClient = new CognitoIdentityProviderClient({ region: 'us-east-1' });
const sesClient = new SESClient({ region: 'us-east-1' });


// Handle user creation in Cognito with email notification
const handleUserCreation = async (event, headers) => {
    console.log('handleUserCreation called');
    try {
        console.log('Parsing event body:', event.body);
        const { email, name, role, department } = JSON.parse(event.body);
        console.log('Parsed data:', { email, name, role, department });
        
        const userPoolId = 'us-east-1_iMyhdFqsG';
        
        if (!email || !name) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Email and name are required' })
            };
        }

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';

        // Create user in Cognito (use email as username for login compatibility)
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
            MessageAction: 'SUPPRESS'
        };

        const createCommand = new AdminCreateUserCommand(createParams);
        const createResult = await cognitoClient.send(createCommand);

        // Add user to appropriate group based on role
        if (role) {
            try {
                const addToGroupCommand = new AdminAddUserToGroupCommand({
                    UserPoolId: userPoolId,
                    Username: email,
                    GroupName: role
                });
                await cognitoClient.send(addToGroupCommand);
            } catch (groupError) {
                console.log('Group assignment failed (group may not exist):', groupError.message);
            }
        }

        // Send welcome email with credentials
        console.log('Sending welcome email to:', email);
        const emailParams = {
            Source: 'madalina.radu1@gcu.edu',
            Destination: {
                ToAddresses: ['madalina.radu1@gcu.edu']
            },
            Message: {
                Subject: {
                    Data: 'Welcome to GCU Research Marketplace - Account Created'
                },
                Body: {
                    Html: {
                        Data: `
                            <p><strong>Note:</strong> This email was intended for ${email} but sent to your verified address for testing.</p>
                            <hr>
                            <h2>Welcome to GCU Research Marketplace!</h2>
                            <p>Hello ${name},</p>
                            <p>Your account has been created successfully. Here are your login credentials:</p>
                            <p><strong>Email:</strong> ${email}</p>
                            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
                            <p><strong>Role:</strong> ${role}</p>
                            ${department ? `<p><strong>Department:</strong> ${department}</p>` : ''}
                            <p>Please log in to the Research Marketplace using the link below and change your password:</p>
                            <p><a href="https://master.d33ubw0r59z0k8.amplifyapp.com/">Access Research Marketplace</a></p>
                            <p>You will be prompted to change your password on first login.</p>
                            <p>Best regards,<br>GCU Research Team</p>
                        `
                    }
                }
            }
        };

        try {
            const sendEmailCommand = new SendEmailCommand(emailParams);
            await sesClient.send(sendEmailCommand);
            console.log('Email sent successfully');
        } catch (emailError) {
            console.log('Email sending failed:', emailError.message);
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'User created successfully in Cognito and welcome email sent',
                userId: createResult.User.Attributes.find(attr => attr.Name === 'sub')?.Value || createResult.User.Username,
                tempPassword: tempPassword
            })
        };

    } catch (error) {
        console.error('Error creating user:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to create user',
                details: error.message
            })
        };
    }
};

// Handle user group update in Cognito
const handleUserGroupUpdate = async (event, headers) => {
    try {
        const { userEmail, oldRole, newRole } = JSON.parse(event.body);
        const userPoolId = 'us-east-1_iMyhdFqsG';
        
        if (!userEmail || !newRole) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'userEmail and newRole are required' })
            };
        }

        // Remove from all possible groups to ensure clean state
        const allGroups = ['Student', 'Faculty', 'Coordinator', 'Admin'];
        console.log('Removing user from all groups:', userEmail);
        for (const group of allGroups) {
            try {
                const removeCommand = new AdminRemoveUserFromGroupCommand({
                    UserPoolId: userPoolId,
                    Username: userEmail,
                    GroupName: group
                });
                await cognitoClient.send(removeCommand);
                console.log(`Successfully removed from ${group} group`);
            } catch (removeError) {
                console.log(`Failed to remove from ${group} group:`, removeError.message);
            }
        }

        // Add to new group
        console.log(`Adding user to ${newRole} group`);
        try {
            const addToGroupCommand = new AdminAddUserToGroupCommand({
                UserPoolId: userPoolId,
                Username: userEmail,
                GroupName: newRole
            });
            await cognitoClient.send(addToGroupCommand);
            console.log(`Successfully added to ${newRole} group`);
        } catch (addError) {
            console.log('Failed to add to new group:', addError.message);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'Failed to add user to new group' })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: `User group updated from ${oldRole} to ${newRole}`
            })
        };

    } catch (error) {
        console.error('Error updating user group:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to update user group',
                details: error.message
            })
        };
    }
};

// Handle user deletion from Cognito
const handleUserDeletion = async (event, headers) => {
    try {
        const { userId, userEmail } = JSON.parse(event.body);
        
        const userPoolId = 'us-east-1_iMyhdFqsG';
        
        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'userId is required' })
            };
        }

        // Try to delete using email first (since users are created with email as username), then UUID for backward compatibility
        let deleteSuccess = false;
        let usedIdentifier = userEmail || userId;
        let lastError = null;
        
        try {
            const deleteCommand = new AdminDeleteUserCommand({
                UserPoolId: userPoolId,
                Username: userEmail || userId
            });
            await cognitoClient.send(deleteCommand);
            deleteSuccess = true;
        } catch (error) {
            lastError = error;
            // If email fails, try with different UUID formats
            if (error.name === 'UserNotFoundException') {
                // Try with database UUID first
                if (userId) {
                    try {
                        const deleteCommand = new AdminDeleteUserCommand({
                            UserPoolId: userPoolId,
                            Username: userId
                        });
                        await cognitoClient.send(deleteCommand);
                        deleteSuccess = true;
                        usedIdentifier = userId;
                    } catch (uuidError) {
                        lastError = uuidError;
                        // If database UUID fails, we need to find the actual Cognito user
                        // This requires listing users and finding by email
                        console.log('Both email and database UUID failed. User may exist with different Cognito UUID.');
                        deleteSuccess = false;
                    }
                } else {
                    deleteSuccess = false;
                }
            } else {
                deleteSuccess = false;
            }
        }

        if (!deleteSuccess) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Failed to delete user from Cognito',
                    details: lastError?.message || 'Unknown error',
                    userId,
                    triedIdentifiers: [userId, userEmail].filter(Boolean)
                })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: `User deleted from Cognito successfully using ${usedIdentifier}`,
                userId,
                usedIdentifier
            })
        };

    } catch (error) {
        console.error('Error deleting user from Cognito:', error);
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

exports.handler = async (event) => {
    console.log('Event received:', JSON.stringify(event, null, 2));
    
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers };
    }

    try {
        // Check if this is a delete request based on path
        if (event.path && event.path.includes('/delete-user')) {
            return handleUserDeletion(event, headers);
        }
        
        // Check if this is a create request based on path
        if (event.path && event.path.includes('/create-user')) {
            return handleUserCreation(event, headers);
        }
        
        // Check if this is an update user group request
        if (event.path && event.path.includes('/update-user-group')) {
            return handleUserGroupUpdate(event, headers);
        }
        

    } catch (error) {
        console.error('Handler error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                details: error.message
            })
        };
    }

    try {
        const { email, name, role, department } = JSON.parse(event.body);
        
        const userPoolId = 'us-east-1_iMyhdFqsG';
        
        if (!email || !name) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Email and name are required' })
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
            MessageAction: 'SUPPRESS'
        };

        const createCommand = new AdminCreateUserCommand(createParams);
        const createResult = await cognitoClient.send(createCommand);

        // Add user to appropriate group based on role
        if (role) {
            try {
                const addToGroupCommand = new AdminAddUserToGroupCommand({
                    UserPoolId: userPoolId,
                    Username: email,
                    GroupName: role
                });
                await cognitoClient.send(addToGroupCommand);
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
                userId: createResult.User.Attributes.find(attr => attr.Name === 'sub')?.Value || createResult.User.Username,
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


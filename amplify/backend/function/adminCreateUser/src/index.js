/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminDeleteUserCommand, AdminAddUserToGroupCommand } = require('@aws-sdk/client-cognito-identity-provider');
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
        if (role && role !== 'Student') {
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
                userId: createResult.User.Username,
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

// Handle user deletion from Cognito
const handleUserDeletion = async (event, headers) => {
    try {
        const { userId } = JSON.parse(event.body);
        
        const userPoolId = 'us-east-1_iMyhdFqsG';
        
        if (!userId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'userId is required' })
            };
        }

        // Delete from Cognito User Pool
        const deleteCommand = new AdminDeleteUserCommand({
            UserPoolId: userPoolId,
            Username: userId
        });
        await cognitoClient.send(deleteCommand);

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
        if (role && role !== 'Student') {
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
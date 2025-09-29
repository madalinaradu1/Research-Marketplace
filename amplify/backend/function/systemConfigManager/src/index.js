const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        const { action, configKey, configValue } = JSON.parse(event.body || '{}');
        const userPoolId = process.env.AUTH_RESEARCHMARKETPLACE_USERPOOLID;

        switch (action) {
            case 'updatePasswordPolicy':
                return await updatePasswordPolicy(userPoolId, configValue, headers);
            case 'updateSessionTimeout':
                return await updateSessionTimeout(userPoolId, configValue, headers);
            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid action' })
                };
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
};

async function updatePasswordPolicy(userPoolId, minLength, headers) {
    const params = {
        UserPoolId: userPoolId,
        Policies: {
            PasswordPolicy: {
                MinimumLength: parseInt(minLength),
                RequireUppercase: true,
                RequireLowercase: true,
                RequireNumbers: true,
                RequireSymbols: true
            }
        }
    };

    await cognito.updateUserPool(params).promise();
    
    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
            success: true, 
            message: `Password policy updated to ${minLength} characters` 
        })
    };
}

async function updateSessionTimeout(userPoolId, timeoutMinutes, headers) {
    const clientsResponse = await cognito.listUserPoolClients({
        UserPoolId: userPoolId
    }).promise();

    for (const client of clientsResponse.UserPoolClients) {
        await cognito.updateUserPoolClient({
            UserPoolId: userPoolId,
            ClientId: client.ClientId,
            RefreshTokenValidity: Math.ceil(timeoutMinutes / 1440) || 1,
            AccessTokenValidity: Math.min(timeoutMinutes, 1440),
            IdTokenValidity: Math.min(timeoutMinutes, 1440)
        }).promise();
    }

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
            success: true, 
            message: `Session timeout updated to ${timeoutMinutes} minutes` 
        })
    };
}
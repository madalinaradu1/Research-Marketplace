/* Amplify Params - DO NOT EDIT
	API_RESEARCHMARKETPLACE_GRAPHQLAPIENDPOINTOUTPUT
	API_RESEARCHMARKETPLACE_GRAPHQLAPIIDOUTPUT
	AUTH_RESEARCHMARKETPLACE2A916C6A_USERPOOLID
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const https = require('https');
const urlParse = require('url').URL;

const appsync = new AWS.AppSync({ region: process.env.REGION });

exports.handler = async (event) => {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    
    const { userAttributes, userName } = event.request;
    
    // Create User record in DynamoDB
    const createUserMutation = `
        mutation CreateUser($input: CreateUserInput!) {
            createUser(input: $input) {
                id
                email
                role
            }
        }
    `;
    
    const variables = {
        input: {
            id: userName,
            email: userAttributes.email,
            name: userAttributes.name || '',
            role: 'Student', // Default role
            profileComplete: false
        }
    };
    
    try {
        await graphqlRequest(createUserMutation, variables);
        console.log('User record created successfully');
    } catch (error) {
        console.error('Error creating user record:', error);
    }
    
    return event;
};

async function graphqlRequest(query, variables) {
    const endpoint = new urlParse(process.env.API_RESEARCHMARKETPLACE_GRAPHQLAPIENDPOINTOUTPUT);
    
    const requestBody = {
        query,
        variables
    };
    
    const options = {
        method: 'POST',
        hostname: endpoint.hostname,
        path: endpoint.pathname,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.API_RESEARCHMARKETPLACE_GRAPHQLAPIKEY
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (result.errors) {
                        reject(new Error(JSON.stringify(result.errors)));
                    } else {
                        resolve(result.data);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        req.on('error', reject);
        req.write(JSON.stringify(requestBody));
        req.end();
    });
}

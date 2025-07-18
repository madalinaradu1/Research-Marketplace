// AWS Amplify Configuration
const awsConfig = {
    Auth: {
        // Amazon Cognito Region
        region: 'us-east-1',
        
        // Amazon Cognito User Pool ID
        userPoolId: 'us-east-1_XXXXXXXXX',
        
        // Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolWebClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
        
        // Enforce user authentication prior to accessing AWS resources or not
        mandatorySignIn: true,
        
        // Cookie Storage Configuration
        cookieStorage: {
            // Domain of the cookie (usually your app's domain)
            domain: 'localhost',
            // Cookie path
            path: '/',
            // Cookie expiration in days
            expires: 365,
            // Cookie secure flag
            secure: false
        }
    },
    Storage: {
        // Amazon S3 bucket name
        AWSS3: {
            bucket: 'uraf-file-storage',
            region: 'us-east-1'
        }
    },
    API: {
        // GraphQL endpoint
        GraphQL: {
            endpoint: 'https://XXXXXXXXXX.appsync-api.us-east-1.amazonaws.com/graphql',
            region: 'us-east-1',
            authMode: 'AMAZON_COGNITO_USER_POOLS'
        }
    }
};

// Initialize AWS Amplify
try {
    AWS.Amplify.configure(awsConfig);
    console.log('AWS Amplify configured successfully');
} catch (error) {
    console.error('Error configuring AWS Amplify:', error);
}
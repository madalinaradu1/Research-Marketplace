# URAF Website Deployment Guide

This guide provides step-by-step instructions for deploying the Undergraduate Research and Fellowships (URAF) website using AWS Amplify.

## Prerequisites

- AWS Account
- Node.js and npm installed
- AWS Amplify CLI installed (`npm install -g @aws-amplify/cli`)
- Git installed

## Step 1: Initialize Amplify Project

If you haven't already initialized the Amplify project:

```bash
amplify init
```

Follow the prompts to configure your project:
- Enter a name for the project (e.g., `uraf-website`)
- Choose your default editor
- Choose JavaScript as the type of app
- Choose React as the framework
- Choose the source directory path (usually `src`)
- Choose the distribution directory path (usually `build`)
- Choose the build command (usually `npm run build`)
- Choose the start command (usually `npm start`)
- Choose to use an AWS profile or configure with access key and secret key

## Step 2: Add Authentication

```bash
amplify add auth
```

Configure Cognito with the following settings:
- Default configuration with social provider (optional)
- Email as the username
- Password requirements (uppercase, lowercase, numbers, special characters)
- Enable MFA (optional)

## Step 3: Add API

```bash
amplify add api
```

Choose GraphQL and configure:
- API name (e.g., `urafapi`)
- Authorization type: Amazon Cognito User Pool
- Do you want to configure advanced settings? Yes
- Configure additional auth types? Yes
- Choose additional authorization types: API key (for public access)
- Conflict detection? Yes
- Conflict resolution strategy: Auto Merge

When prompted, use the schema from `schema.graphql` in this repository.

## Step 4: Add Storage

```bash
amplify add storage
```

Configure S3 for file storage:
- Content (Images, audio, video, etc.)
- Provide a friendly name (e.g., `uraffiles`)
- Provide a bucket name (e.g., `uraf-file-storage`)
- Who should have access? Auth users only
- What kind of access? read/write

## Step 5: Add Functions

```bash
amplify add function
```

Create Lambda functions for:

1. searchOpportunities:
   - Function name: `searchOpportunities`
   - Choose Node.js runtime
   - Template: Hello World
   - Advanced settings: Yes
   - Access to other resources? Yes
   - Select the API you created earlier

2. getRecommendedOpportunities:
   - Function name: `getRecommendedOpportunities`
   - Choose Node.js runtime
   - Template: Hello World
   - Advanced settings: Yes
   - Access to other resources? Yes
   - Select the API you created earlier

## Step 6: Push to AWS

```bash
amplify push
```

This will create all the necessary resources in your AWS account. When prompted:
- Generate code for your GraphQL API? Yes
- Choose the code generation language target: JavaScript
- Enter the file name pattern of graphql queries: `src/graphql/**/*.js`
- Do you want to generate all possible GraphQL operations? Yes
- Maximum statement depth: 2

## Step 7: Launch Amplify Studio

```bash
amplify studio
```

This will open Amplify Studio in your browser where you can:

1. Configure Data Models:
   - Navigate to the "Data" section
   - Review the generated models from schema.graphql
   - Customize fields, relationships, and authorization rules as needed

2. Design UI Components:
   - Go to the "UI Library" section
   - Import the UI components from the `ui-components` directory
   - Customize the components as needed
   - Create additional components for:
     - Landing page
     - User profile
     - Research opportunity listings
     - Application forms
     - Project dashboards
     - Document uploads

3. Configure Authentication Flow:
   - Configure the authentication UI in the "Auth" section
   - Customize the sign-in, sign-up, and password reset experiences
   - Set up social providers if needed

4. Theme Customization:
   - Define your brand colors, typography, and component styles
   - Apply consistent styling across all components

## Step 8: Deploy the Frontend

### Option 1: Deploy with Amplify Console

1. Connect your repository to Amplify Console:
   - Go to the AWS Amplify Console
   - Click "Connect app"
   - Choose your repository provider (GitHub, BitBucket, etc.)
   - Select your repository and branch
   - Configure build settings
   - Deploy

### Option 2: Manual Deployment

```bash
amplify publish
```

This will build your React application and deploy it to the Amplify hosting environment.

## Step 9: Configure CampusPress Integration

For the pre-login experience hosted on CampusPress:

1. Create API endpoints for public data:
   - Use the API key authentication type for public access
   - Create GraphQL queries for public data (events, announcements, etc.)

2. Implement SSO between CampusPress and Cognito:
   - Use the Cognito Hosted UI or custom UI
   - Configure SAML or OAuth integration with CampusPress

3. Add links from CampusPress to the Amplify-hosted application:
   - Create navigation links to the login page
   - Add buttons for "Apply Now" or "Login" that redirect to the Amplify app

## Step 10: Set Up Custom Domain (Optional)

```bash
amplify add hosting
```

Choose Amazon CloudFront and S3, then:
- Configure custom domain settings
- Add SSL certificate
- Set up redirects as needed

## Step 11: Monitor and Maintain

1. Set up CloudWatch Alarms:
   - Monitor API usage
   - Set up alerts for errors

2. Configure Backup:
   - Enable DynamoDB backups
   - Configure S3 versioning

3. Set up CI/CD:
   - Configure automatic deployments from your repository
   - Set up testing before deployment

## Troubleshooting

- **API Errors**: Check CloudWatch Logs for Lambda function errors
- **Authentication Issues**: Verify Cognito User Pool settings
- **Storage Problems**: Check S3 bucket permissions
- **UI Component Errors**: Regenerate UI components in Amplify Studio

## Additional Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Amplify Studio Guide](https://docs.amplify.aws/console/)
- [GraphQL API Development](https://docs.amplify.aws/cli/graphql/overview/)
- [Authentication with Cognito](https://docs.amplify.aws/lib/auth/getting-started/)
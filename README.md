# Undergraduate Research and Fellowships (URAF) Website

A platform for Grand Canyon University's undergraduate research community, built with AWS Amplify Studio.

## Project Overview

The URAF website is committed to creating a diverse and inclusive undergraduate research community at Grand Canyon University where each student has the tools, access to opportunities, and support to thrive.

This platform connects students with faculty-led research opportunities, streamlines the application process, and provides tools for managing research projects.

## Key Features

- User authentication and profile management
- Research opportunity listings and search
- Personalized opportunity recommendations
- Application submission and tracking
- Project management and document sharing
- Administrative tools for program oversight

## Architecture

This application is built using:

- **AWS Amplify Studio** - Visual development environment
- **AWS Cognito** - User authentication and authorization
- **AWS AppSync** - GraphQL API
- **Amazon DynamoDB** - Database
- **Amazon S3** - File storage
- **AWS Lambda** - Serverless functions

## Project Structure

```
/
├── amplify/                  # AWS Amplify configuration
│   ├── backend/              # Backend resources
│   │   ├── api/              # GraphQL API
│   │   ├── auth/             # Authentication
│   │   ├── function/         # Lambda functions
│   │   └── storage/          # S3 storage
│   └── .config/              # Amplify configuration
├── public/                   # Public assets
├── src/                      # Source code
│   ├── components/           # React components
│   ├── graphql/              # GraphQL queries and mutations
│   ├── pages/                # Page components
│   ├── ui-components/        # Amplify Studio components
│   ├── App.js                # Main application
│   └── index.js              # Entry point
├── ui-components/            # Amplify Studio component definitions
├── schema.graphql            # GraphQL schema
├── DEPLOYMENT.md             # Deployment instructions
└── PROJECT_SUMMARY.md        # Detailed project summary
```

## Getting Started

### Prerequisites

- Node.js and npm installed
- AWS account
- AWS Amplify CLI installed (`npm install -g @aws-amplify/cli`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/uraf-website.git
   cd uraf-website
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize Amplify (if not already initialized):
   ```bash
   amplify init
   ```

4. Push Amplify resources to AWS:
   ```bash
   amplify push
   ```

5. Start the development server:
   ```bash
   npm start
   ```

## Development Workflow

### Using Amplify Studio

1. Launch Amplify Studio:
   ```bash
   amplify studio
   ```

2. Design UI components in the UI Library section
3. Configure data models in the Data section
4. Customize authentication in the Auth section
5. Pull generated code into your project:
   ```bash
   amplify pull
   ```

### Adding Features

1. Create new data models in `schema.graphql`
2. Push changes to AWS:
   ```bash
   amplify push
   ```
3. Create UI components in Amplify Studio
4. Implement React components and pages

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Project Documentation

For a comprehensive overview of the project, see [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- University of Michigan's UROP program for inspiration
- AWS Amplify team for the development tools
- Grand Canyon University for supporting undergraduate research
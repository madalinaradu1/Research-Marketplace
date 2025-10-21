# URAF Application Technology Stack

## AWS Services Used

### **AWS Amplify**
- Full-stack development platform that provides hosting, CI/CD, and backend services
- Handles deployment and hosting of the React frontend
- Manages backend infrastructure provisioning

### **AWS Amplify Studio**
- Visual development environment for building UI components
- Drag-and-drop interface for creating React components
- Integrates with the Amplify backend services

### **Amazon Cognito**
- User authentication and authorization service
- Manages user sign-up, sign-in, and access control
- Handles user groups (Student, Faculty, Coordinator, Admin)
- Provides JWT tokens for secure API access

### **AWS AppSync**
- Managed GraphQL API service
- Handles real-time data synchronization
- Provides automatic CRUD operations for database models
- Manages API authorization rules

### **Amazon DynamoDB**
- NoSQL database service
- Stores all application data (users, projects, applications, messages)
- Provides fast, scalable data access
- Automatically managed by Amplify

### **Amazon S3**
- Object storage service
- Stores uploaded files (resumes, transcripts, documents)
- Provides secure file access with pre-signed URLs

### **AWS Lambda**
- Serverless compute service
- Runs backend functions (email notifications, user management)
- Handles custom business logic not covered by GraphQL

### **Amazon SES (Simple Email Service)**
- Email sending service
- Sends notification emails to users
- Handles welcome emails and status change notifications

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
│   ├── utils/                # Utility functions
│   ├── App.js                # Main application
│   └── index.js              # Entry point
├── ui-components/            # Amplify Studio component definitions
├── schema.graphql            # GraphQL schema
├── DEPLOYMENT.md             # Deployment instructions
├── PROJECT_SUMMARY.md        # Detailed project summary
├── TECH_STACK.md             # Technology stack documentation
└── README.md                 # Project overview
```

## Frontend Technologies

### **React.js**
- JavaScript library for building user interfaces
- Component-based architecture for reusable UI elements

### **AWS Amplify UI React**
- Pre-built React components designed for Amplify
- Provides authentication UI, form components, and styling

### **ReactQuill**
- Rich text editor component
- Used for project descriptions and message composition

### **JavaScript/ES6+**
- Modern JavaScript features for application logic
- Async/await for API calls and data handling

## Development Tools

### **Node.js & npm**
- JavaScript runtime and package manager
- Required for running the development environment

### **Amplify CLI**
- Command-line tool for managing Amplify projects
- Used for deploying backend changes and managing environments

### **GraphQL**
- Query language for APIs
- Defines data schema and relationships between models

### **Git**
- Version control system for tracking code changes
- Integration with Amplify for automatic deployments

## Key Configuration Files

### **schema.graphql**
- Defines database models and relationships
- Specifies authorization rules for data access

### **amplify/backend/**
- Contains all backend configuration
- API, authentication, storage, and function definitions

### **package.json**
- Lists all frontend dependencies
- Defines build and deployment scripts

## Architecture Overview

The application follows a serverless, full-stack architecture:

1. **Frontend**: React app hosted on Amplify
2. **API**: GraphQL via AppSync with DynamoDB backend
3. **Auth**: Cognito for user management
4. **Storage**: S3 for file uploads
5. **Functions**: Lambda for custom business logic
6. **Email**: SES for notifications

This stack provides automatic scaling, high availability, and minimal operational overhead while maintaining security and performance.

## Getting Started for New Developers

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- AWS account
- Amplify CLI: `npm install -g @aws-amplify/cli`

### Setup Steps
1. Clone the repository
2. Run `npm install` to install dependencies
3. Configure Amplify CLI with your AWS credentials: `amplify configure`
4. Initialize Amplify in the project: `amplify init`
5. Pull backend resources: `amplify pull`
6. Run `npm start` to start the development server

### Development Workflow
1. Make frontend changes in the `src/` directory
2. Update backend schema in `schema.graphql`
3. Deploy backend changes with `amplify push`
4. Test changes locally before committing
5. Push to GitHub for automatic deployment via Amplify

## Useful Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Deploy backend changes
amplify push

# Open Amplify Studio
amplify studio

# View backend status
amplify status

# Pull latest backend changes
amplify pull
```
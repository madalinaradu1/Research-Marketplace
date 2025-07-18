# URAF Website Project Summary

## Overview

The Undergraduate Research and Fellowships (URAF) website is designed to create a diverse and inclusive undergraduate research community at Grand Canyon University. The platform connects students with faculty-led research opportunities, streamlines the application process, and provides tools for managing research projects.

## Architecture

The application is built using AWS Amplify Studio with the following components:

1. **Frontend**:
   - React.js application with Amplify UI components
   - Responsive design for desktop and mobile devices
   - Custom UI components created with Amplify Studio

2. **Authentication**:
   - AWS Cognito User Pools for secure authentication
   - Support for email/password authentication
   - Role-based access control (students, faculty, administrators)

3. **API**:
   - GraphQL API powered by AWS AppSync
   - Custom resolvers for complex queries
   - Real-time data synchronization

4. **Database**:
   - Amazon DynamoDB for scalable, serverless data storage
   - Data models for users, opportunities, applications, projects, etc.
   - Relationships between entities (one-to-many, many-to-many)

5. **Storage**:
   - Amazon S3 for file storage (resumes, project documents, etc.)
   - Secure access controls for uploaded files
   - Integration with the application for seamless file management

6. **Functions**:
   - AWS Lambda functions for custom business logic
   - Search functionality for research opportunities
   - Recommendation engine for personalized opportunity suggestions

7. **Integration**:
   - CampusPress Website for pre-login experience
   - SSO integration between CampusPress and AWS Cognito
   - Seamless transition between public and authenticated areas

## Key Features

### For Students

1. **Profile Management**:
   - Create and update personal profiles
   - Specify research interests and academic information
   - Upload and manage documents (resume, transcripts, etc.)

2. **Opportunity Discovery**:
   - Search for research opportunities by keyword, category, etc.
   - Receive personalized recommendations based on interests
   - View detailed information about each opportunity

3. **Application Process**:
   - Apply to research opportunities with customized statements
   - Track application status (submitted, under review, accepted, etc.)
   - Receive notifications about application updates

4. **Project Management**:
   - View active and completed research projects
   - Upload and share project documents
   - Collaborate with faculty mentors

### For Faculty

1. **Opportunity Management**:
   - Create and publish research opportunities
   - Specify requirements, deadlines, and other details
   - Update opportunity status (published, closed, etc.)

2. **Application Review**:
   - Review student applications
   - Accept or reject applications with feedback
   - Communicate with applicants

3. **Project Oversight**:
   - Monitor active research projects
   - Review and provide feedback on project documents
   - Track project progress and outcomes

### For Administrators

1. **User Management**:
   - Manage student and faculty accounts
   - Assign roles and permissions
   - Monitor system usage

2. **Content Management**:
   - Update general information pages
   - Manage events and deadlines
   - Create announcements and notifications

3. **Reporting**:
   - Generate reports on application statistics
   - Track research participation metrics
   - Analyze system usage and engagement

## User Flow

1. **Pre-Login Experience** (CampusPress Website):
   - General information about the research program
   - Eligibility requirements and guidelines
   - Resources and training materials
   - Login/registration options

2. **Authentication**:
   - Sign up with email and password
   - Verify email address
   - Log in with credentials
   - Password reset functionality

3. **Post-Login Experience** (AWS Amplify Application):
   - Personalized dashboard with recommendations
   - Profile management
   - Opportunity search and application
   - Project tracking and document management

## Technical Implementation

1. **Data Models**:
   - User (students, faculty, administrators)
   - ResearchOpportunity (research projects seeking students)
   - Application (student applications to opportunities)
   - Project (active research projects)
   - Document (uploaded files)
   - Event (deadlines, workshops, etc.)
   - Notification (system messages)

2. **UI Components**:
   - Custom components created with Amplify Studio
   - Responsive design for all screen sizes
   - Consistent styling and branding

3. **API Operations**:
   - CRUD operations for all data models
   - Custom queries for search and recommendations
   - Real-time subscriptions for notifications

4. **Security**:
   - Role-based access control
   - Secure file storage with access controls
   - Data validation and sanitization

## Deployment

The application is deployed using AWS Amplify with the following environments:

1. **Development**:
   - For active development and testing
   - Connected to development branch in repository

2. **Staging**:
   - For pre-production testing
   - Connected to staging branch in repository

3. **Production**:
   - Live environment for end users
   - Connected to main branch in repository
   - Custom domain with SSL certificate

## Future Enhancements

1. **Advanced Search**:
   - Filters for departments, skills, time commitment, etc.
   - Saved searches and alerts

2. **Messaging System**:
   - Direct messaging between students and faculty
   - Group discussions for research teams

3. **Calendar Integration**:
   - Sync deadlines and events with personal calendars
   - Scheduling tools for meetings and appointments

4. **Mobile App**:
   - Native mobile application for iOS and Android
   - Push notifications for important updates

5. **Analytics Dashboard**:
   - Detailed metrics on program participation
   - Insights on research trends and outcomes

6. **Integration with Academic Systems**:
   - Connect with student information systems
   - Automatic verification of academic standing
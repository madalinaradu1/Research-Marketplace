// Simplified operations for basic CRUD operations
export const listApplications = /* GraphQL */ `
  query ListApplications {
    listApplications {
      items {
        id
        status
        submittedAt
        projectId
        userId
        createdAt
        updatedAt
      }
    }
  }
`;

export const listApplicationsSimple = /* GraphQL */ `
  query ListApplications {
    listApplications {
      items {
        id
        status
        submittedAt
        projectId
        userId
        createdAt
        updatedAt
      }
    }
  }
`;

export const listProjectsSimple = /* GraphQL */ `
  query ListProjects {
    listProjects {
      items {
        id
        title
        description
        status
        facultyId
        createdAt
        updatedAt
      }
    }
  }
`;

export const listUsersSimple = /* GraphQL */ `
  query ListUsers {
    listUsers {
      items {
        id
        email
        firstName
        lastName
        role
        createdAt
        updatedAt
      }
    }
  }
`;
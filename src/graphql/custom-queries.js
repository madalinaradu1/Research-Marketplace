/* eslint-disable */
// Custom GraphQL queries

export const searchOpportunities = /* GraphQL */ `
  query SearchOpportunities($query: String!, $category: String, $limit: Int) {
    searchOpportunities(query: $query, category: $category, limit: $limit) {
      id
      title
      description
      facultyId
      faculty {
        id
        name
        email
        type
      }
      department
      requirements
      deadline
      startDate
      endDate
      status
      categories
      skills
      createdAt
      updatedAt
    }
  }
`;

export const getRecommendedOpportunities = /* GraphQL */ `
  query GetRecommendedOpportunities($userId: ID!, $limit: Int) {
    getRecommendedOpportunities(userId: $userId, limit: $limit) {
      id
      title
      description
      facultyId
      faculty {
        id
        name
        email
        type
      }
      department
      requirements
      deadline
      startDate
      endDate
      status
      categories
      skills
      createdAt
      updatedAt
    }
  }
`;

export const getUserWithApplications = /* GraphQL */ `
  query GetUserWithApplications($id: ID!) {
    getUser(id: $id) {
      id
      username
      email
      name
      type
      major
      year
      interests
      bio
      profilePicture
      applications {
        items {
          id
          opportunityId
          opportunity {
            id
            title
            faculty {
              id
              name
            }
          }
          status
          statement
          submissionDate
          lastUpdated
        }
      }
      projects {
        items {
          id
          title
          description
          status
          startDate
          endDate
          facultyId
          faculty {
            id
            name
          }
        }
      }
    }
  }
`;

export const getOpportunityWithApplications = /* GraphQL */ `
  query GetOpportunityWithApplications($id: ID!) {
    getResearchOpportunity(id: $id) {
      id
      title
      description
      facultyId
      faculty {
        id
        name
        email
        type
      }
      department
      requirements
      deadline
      startDate
      endDate
      status
      categories
      skills
      applications {
        items {
          id
          userId
          user {
            id
            name
            email
            major
            year
          }
          status
          submissionDate
        }
      }
      createdAt
      updatedAt
    }
  }
`;

export const getProjectWithFiles = /* GraphQL */ `
  query GetProjectWithFiles($id: ID!) {
    getProject(id: $id) {
      id
      title
      description
      userId
      user {
        id
        name
        email
      }
      facultyId
      faculty {
        id
        name
        email
      }
      status
      startDate
      endDate
      files {
        items {
          id
          name
          key
          type
          size
          uploadDate
          uploader
        }
      }
      createdAt
      updatedAt
    }
  }
`;
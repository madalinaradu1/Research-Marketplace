/* eslint-disable */
// This file contains simplified GraphQL operations

// User queries
export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      name
      email
      role
      department
      major
      academicYear
      gpa
      careerInterests
      profileComplete
      status
      createdAt
      updatedAt
    }
  }
`;

export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        email
        role
        department
      }
      nextToken
    }
  }
`;

// Project queries
export const getProject = /* GraphQL */ `
  query GetProject($id: ID!) {
    getProject(id: $id) {
      id
      title
      description
      department
      skillsRequired
      duration
      applicationDeadline
      facultyID
      faculty {
        id
        name
        email
      }
      isActive
      createdAt
      updatedAt
    }
  }
`;

export const listProjects = /* GraphQL */ `
  query ListProjects(
    $filter: ModelProjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProjects(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        description
        department
        skillsRequired
        duration
        applicationDeadline
        facultyID
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// Application queries
export const listApplications = /* GraphQL */ `
  query ListApplications(
    $filter: ModelApplicationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listApplications(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        studentID
        projectID
        project {
          id
          title
          department
        }
        statement
        status
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// User mutations
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
      id
      name
      email
      role
      profileComplete
      careerInterests
      updatedAt
    }
  }
`;

// Project mutations
export const createProject = /* GraphQL */ `
  mutation CreateProject(
    $input: CreateProjectInput!
    $condition: ModelProjectConditionInput
  ) {
    createProject(input: $input, condition: $condition) {
      id
      title
      description
      department
      skillsRequired
      duration
      applicationDeadline
      facultyID
      isActive
      createdAt
      updatedAt
    }
  }
`;

// Application mutations
export const createApplication = /* GraphQL */ `
  mutation CreateApplication(
    $input: CreateApplicationInput!
    $condition: ModelApplicationConditionInput
  ) {
    createApplication(input: $input, condition: $condition) {
      id
      studentID
      projectID
      status
      createdAt
    }
  }
`;
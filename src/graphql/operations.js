/* eslint-disable */
// This file contains GraphQL operations used in the application

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
      skills
      researchInterests
      careerInterests
      resumeKey
      affiliation
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
        major
        academicYear
        gpa
        profileComplete
        status
        createdAt
        updatedAt
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
        department
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
        faculty {
          id
          name
          email
        }
        isActive
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// Application queries
export const getApplication = /* GraphQL */ `
  query GetApplication($id: ID!) {
    getApplication(id: $id) {
      id
      studentID
      student {
        id
        name
        email
        major
        gpa
      }
      projectID
      project {
        id
        title
        department
      }
      statement
      resumeKey
      transcriptLink
      status
      statusDetail
      facultyNotes
      coordinatorNotes
      adminNotes
      withdrawReason
      submittedToFacultyAt
      submittedToDepartmentAt
      submittedToAdminAt
      approvedAt
      returnedAt
      rejectedAt
      cancelledAt
      createdAt
      updatedAt
    }
  }
`;

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
        statement
        resumeKey
        transcriptLink
        status
        statusDetail
        facultyNotes
        coordinatorNotes
        adminNotes
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

// User mutations
export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
      id
      name
      email
      role
      department
      major
      academicYear
      gpa
      skills
      researchInterests
      careerInterests
      resumeKey
      affiliation
      profileComplete
      status
      createdAt
      updatedAt
    }
  }
`;

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
      department
      major
      academicYear
      gpa
      skills
      researchInterests
      careerInterests
      resumeKey
      affiliation
      profileComplete
      status
      createdAt
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

export const updateProject = /* GraphQL */ `
  mutation UpdateProject(
    $input: UpdateProjectInput!
    $condition: ModelProjectConditionInput
  ) {
    updateProject(input: $input, condition: $condition) {
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
      statement
      resumeKey
      transcriptLink
      status
      statusDetail
      facultyNotes
      createdAt
      updatedAt
    }
  }
`;

export const updateApplication = /* GraphQL */ `
  mutation UpdateApplication(
    $input: UpdateApplicationInput!
    $condition: ModelApplicationConditionInput
  ) {
    updateApplication(input: $input, condition: $condition) {
      id
      studentID
      projectID
      statement
      resumeKey
      transcriptLink
      status
      statusDetail
      facultyNotes
      coordinatorNotes
      adminNotes
      withdrawReason
      submittedToFacultyAt
      submittedToDepartmentAt
      submittedToAdminAt
      approvedAt
      returnedAt
      rejectedAt
      cancelledAt
      createdAt
      updatedAt
    }
  }
`;
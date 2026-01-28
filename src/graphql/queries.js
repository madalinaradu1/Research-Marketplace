/* eslint-disable */
// this is an auto generated file. This will be overwritten

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
      expectedGraduation
      availability
      personalStatement
      certificates
      applicationCount
      projects {
        nextToken
        __typename
      }
      applications {
        nextToken
        __typename
      }
      posts {
        nextToken
        __typename
      }
      notifications {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      college
      classesTaught
      facultyResearchInterests
      owner
      __typename
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
        skills
        researchInterests
        careerInterests
        resumeKey
        affiliation
        profileComplete
        status
        expectedGraduation
        availability
        personalStatement
        certificates
        applicationCount
        createdAt
        updatedAt
        college
        classesTaught
        facultyResearchInterests
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getProject = /* GraphQL */ `
  query GetProject($id: ID!) {
    getProject(id: $id) {
      id
      title
      description
      department
      faculty
      skillsRequired
      tags
      qualifications
      duration
      applicationDeadline
      facultyID
      isActive
      requiresTranscript
      projectStatus
      coordinatorNotes
      rejectionReason
      selectedStudentID
      filledAt
      applications {
        nextToken
        __typename
      }
      createdAt
      updatedAt
      owner
      __typename
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
        faculty
        skillsRequired
        tags
        qualifications
        duration
        applicationDeadline
        facultyID
        isActive
        requiresTranscript
        projectStatus
        coordinatorNotes
        rejectionReason
        selectedStudentID
        filledAt
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getApplication = /* GraphQL */ `
  query GetApplication($id: ID!) {
    getApplication(id: $id) {
      id
      studentID
      projectID
      statement
      resumeKey
      transcriptLink
      documentKey
      relevantCourses {
        courseName
        courseNumber
        grade
        semester
        year
        __typename
      }
      status
      statusDetail
      facultyNotes
      coordinatorNotes
      rejectionReason
      acceptanceReason
      withdrawReason
      isSelected
      selectedAt
      createdAt
      updatedAt
      owner
      __typename
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
        documentKey
        status
        statusDetail
        facultyNotes
        coordinatorNotes
        rejectionReason
        acceptanceReason
        withdrawReason
        isSelected
        selectedAt
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getStudentPost = /* GraphQL */ `
  query GetStudentPost($id: ID!) {
    getStudentPost(id: $id) {
      id
      title
      content
      authorID
      isAnonymous
      tags
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listStudentPosts = /* GraphQL */ `
  query ListStudentPosts(
    $filter: ModelStudentPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listStudentPosts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        content
        authorID
        isAnonymous
        tags
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getMessage = /* GraphQL */ `
  query GetMessage($id: ID!) {
    getMessage(id: $id) {
      id
      senderID
      receiverID
      subject
      body
      isRead
      readAt
      sentAt
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listMessages = /* GraphQL */ `
  query ListMessages(
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMessages(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        senderID
        receiverID
        subject
        body
        isRead
        readAt
        sentAt
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getNotification = /* GraphQL */ `
  query GetNotification($id: ID!) {
    getNotification(id: $id) {
      id
      userID
      type
      title
      message
      isRead
      relatedItemID
      relatedItemType
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listNotifications = /* GraphQL */ `
  query ListNotifications(
    $filter: ModelNotificationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listNotifications(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userID
        type
        title
        message
        isRead
        relatedItemID
        relatedItemType
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getDeletedUser = /* GraphQL */ `
  query GetDeletedUser($id: ID!) {
    getDeletedUser(id: $id) {
      id
      originalUserID
      name
      email
      role
      deletionScheduledAt
      deletionExecutedAt
      isTestMode
      userData
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listDeletedUsers = /* GraphQL */ `
  query ListDeletedUsers(
    $filter: ModelDeletedUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDeletedUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        originalUserID
        name
        email
        role
        deletionScheduledAt
        deletionExecutedAt
        isTestMode
        userData
        status
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getAuditLog = /* GraphQL */ `
  query GetAuditLog($id: ID!) {
    getAuditLog(id: $id) {
      id
      userId
      userName
      userEmail
      action
      resource
      details
      timestamp
      ipAddress
      userAgent
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listAuditLogs = /* GraphQL */ `
  query ListAuditLogs(
    $filter: ModelAuditLogFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAuditLogs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        userName
        userEmail
        action
        resource
        details
        timestamp
        ipAddress
        userAgent
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const projectsByFacultyID = /* GraphQL */ `
  query ProjectsByFacultyID(
    $facultyID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelProjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    projectsByFacultyID(
      facultyID: $facultyID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        title
        description
        department
        faculty
        skillsRequired
        tags
        qualifications
        duration
        applicationDeadline
        facultyID
        isActive
        requiresTranscript
        projectStatus
        coordinatorNotes
        rejectionReason
        selectedStudentID
        filledAt
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const applicationsByStudentID = /* GraphQL */ `
  query ApplicationsByStudentID(
    $studentID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelApplicationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    applicationsByStudentID(
      studentID: $studentID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        studentID
        projectID
        statement
        resumeKey
        transcriptLink
        documentKey
        status
        statusDetail
        facultyNotes
        coordinatorNotes
        rejectionReason
        acceptanceReason
        withdrawReason
        isSelected
        selectedAt
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const applicationsByProjectID = /* GraphQL */ `
  query ApplicationsByProjectID(
    $projectID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelApplicationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    applicationsByProjectID(
      projectID: $projectID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        studentID
        projectID
        statement
        resumeKey
        transcriptLink
        documentKey
        status
        statusDetail
        facultyNotes
        coordinatorNotes
        rejectionReason
        acceptanceReason
        withdrawReason
        isSelected
        selectedAt
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const studentPostsByAuthorID = /* GraphQL */ `
  query StudentPostsByAuthorID(
    $authorID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelStudentPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    studentPostsByAuthorID(
      authorID: $authorID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        title
        content
        authorID
        isAnonymous
        tags
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const notificationsByUserID = /* GraphQL */ `
  query NotificationsByUserID(
    $userID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelNotificationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    notificationsByUserID(
      userID: $userID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userID
        type
        title
        message
        isRead
        relatedItemID
        relatedItemType
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;

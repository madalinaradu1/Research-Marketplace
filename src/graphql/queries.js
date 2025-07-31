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
      applicationCount
      expectedGraduation
      availability
      personalStatement
      certificates
      createdAt
      updatedAt
      facultyProjects {
        nextToken
        __typename
      }
      studentApplications {
        nextToken
        __typename
      }
      sentMessages {
        nextToken
        __typename
      }
      receivedMessages {
        nextToken
        __typename
      }
      notifications {
        nextToken
        __typename
      }
      activityLogs {
        nextToken
        __typename
      }
      messageBoards {
        nextToken
        __typename
      }
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
        applicationCount
        expectedGraduation
        availability
        personalStatement
        certificates
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
export const getProject = /* GraphQL */ `
  query GetProject($id: ID!) {
    getProject(id: $id) {
      id
      title
      description
      department
      skillsRequired
      qualifications
      duration
      applicationDeadline
      facultyID
      faculty {
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
        applicationCount
        expectedGraduation
        availability
        personalStatement
        certificates
        createdAt
        updatedAt
        owner
        __typename
      }
      isActive
      requiresTranscript
      createdAt
      updatedAt
      applications {
        nextToken
        __typename
      }
      messageBoards {
        nextToken
        __typename
      }
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
        skillsRequired
        qualifications
        duration
        applicationDeadline
        facultyID
        isActive
        requiresTranscript
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
        skillsRequired
        qualifications
        duration
        applicationDeadline
        facultyID
        isActive
        requiresTranscript
        createdAt
        updatedAt
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
      student {
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
        applicationCount
        expectedGraduation
        availability
        personalStatement
        certificates
        createdAt
        updatedAt
        owner
        __typename
      }
      projectID
      project {
        id
        title
        description
        department
        skillsRequired
        qualifications
        duration
        applicationDeadline
        facultyID
        isActive
        requiresTranscript
        createdAt
        updatedAt
        __typename
      }
      statement
      resumeKey
      transcriptLink
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
      learningContract {
        id
        applicationID
        researchSchedule
        researchRequirements
        learningObjectives
        evaluationCriteria
        mentorApproved
        studentConfirmed
        submittedAt
        createdAt
        updatedAt
        owner
        __typename
      }
      applicationLearningContractId
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
        applicationLearningContractId
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
        applicationLearningContractId
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
        applicationLearningContractId
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getLearningContract = /* GraphQL */ `
  query GetLearningContract($id: ID!) {
    getLearningContract(id: $id) {
      id
      applicationID
      application {
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
        applicationLearningContractId
        __typename
      }
      researchSchedule
      researchRequirements
      learningObjectives
      evaluationCriteria
      mentorApproved
      studentConfirmed
      submittedAt
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listLearningContracts = /* GraphQL */ `
  query ListLearningContracts(
    $filter: ModelLearningContractFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listLearningContracts(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        applicationID
        researchSchedule
        researchRequirements
        learningObjectives
        evaluationCriteria
        mentorApproved
        studentConfirmed
        submittedAt
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
export const learningContractsByApplicationID = /* GraphQL */ `
  query LearningContractsByApplicationID(
    $applicationID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelLearningContractFilterInput
    $limit: Int
    $nextToken: String
  ) {
    learningContractsByApplicationID(
      applicationID: $applicationID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        applicationID
        researchSchedule
        researchRequirements
        learningObjectives
        evaluationCriteria
        mentorApproved
        studentConfirmed
        submittedAt
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
export const getMessageBoard = /* GraphQL */ `
  query GetMessageBoard($id: ID!) {
    getMessageBoard(id: $id) {
      id
      facultyID
      faculty {
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
        applicationCount
        expectedGraduation
        availability
        personalStatement
        certificates
        createdAt
        updatedAt
        owner
        __typename
      }
      projectID
      project {
        id
        title
        description
        department
        skillsRequired
        qualifications
        duration
        applicationDeadline
        facultyID
        isActive
        requiresTranscript
        createdAt
        updatedAt
        __typename
      }
      title
      content
      isPublic
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listMessageBoards = /* GraphQL */ `
  query ListMessageBoards(
    $filter: ModelMessageBoardFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listMessageBoards(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        facultyID
        projectID
        title
        content
        isPublic
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const messageBoardsByFacultyID = /* GraphQL */ `
  query MessageBoardsByFacultyID(
    $facultyID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelMessageBoardFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messageBoardsByFacultyID(
      facultyID: $facultyID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        facultyID
        projectID
        title
        content
        isPublic
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const messageBoardsByProjectID = /* GraphQL */ `
  query MessageBoardsByProjectID(
    $projectID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelMessageBoardFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messageBoardsByProjectID(
      projectID: $projectID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        facultyID
        projectID
        title
        content
        isPublic
        createdAt
        updatedAt
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
      sender {
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
        applicationCount
        expectedGraduation
        availability
        personalStatement
        certificates
        createdAt
        updatedAt
        owner
        __typename
      }
      receiverID
      receiver {
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
        applicationCount
        expectedGraduation
        availability
        personalStatement
        certificates
        createdAt
        updatedAt
        owner
        __typename
      }
      subject
      body
      isRead
      sentAt
      readAt
      threadID
      projectID
      messageType
      parentMessageID
      parentMessage {
        id
        senderID
        receiverID
        subject
        body
        isRead
        sentAt
        readAt
        threadID
        projectID
        messageType
        parentMessageID
        createdAt
        updatedAt
        owner
        __typename
      }
      replies {
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
        sentAt
        readAt
        threadID
        projectID
        messageType
        parentMessageID
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
export const messagesBySenderID = /* GraphQL */ `
  query MessagesBySenderID(
    $senderID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messagesBySenderID(
      senderID: $senderID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        senderID
        receiverID
        subject
        body
        isRead
        sentAt
        readAt
        threadID
        projectID
        messageType
        parentMessageID
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
export const messagesByReceiverID = /* GraphQL */ `
  query MessagesByReceiverID(
    $receiverID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messagesByReceiverID(
      receiverID: $receiverID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        senderID
        receiverID
        subject
        body
        isRead
        sentAt
        readAt
        threadID
        projectID
        messageType
        parentMessageID
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
export const messagesByThreadID = /* GraphQL */ `
  query MessagesByThreadID(
    $threadID: String!
    $sortDirection: ModelSortDirection
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messagesByThreadID(
      threadID: $threadID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        senderID
        receiverID
        subject
        body
        isRead
        sentAt
        readAt
        threadID
        projectID
        messageType
        parentMessageID
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
export const messagesByParentMessageID = /* GraphQL */ `
  query MessagesByParentMessageID(
    $parentMessageID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelMessageFilterInput
    $limit: Int
    $nextToken: String
  ) {
    messagesByParentMessageID(
      parentMessageID: $parentMessageID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        senderID
        receiverID
        subject
        body
        isRead
        sentAt
        readAt
        threadID
        projectID
        messageType
        parentMessageID
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
      user {
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
        applicationCount
        expectedGraduation
        availability
        personalStatement
        certificates
        createdAt
        updatedAt
        owner
        __typename
      }
      type
      message
      isRead
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
        message
        isRead
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
        message
        isRead
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
export const getActivityLog = /* GraphQL */ `
  query GetActivityLog($id: ID!) {
    getActivityLog(id: $id) {
      id
      userID
      user {
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
        applicationCount
        expectedGraduation
        availability
        personalStatement
        certificates
        createdAt
        updatedAt
        owner
        __typename
      }
      action
      resourceType
      resourceID
      detail
      timestamp
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listActivityLogs = /* GraphQL */ `
  query ListActivityLogs(
    $filter: ModelActivityLogFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listActivityLogs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userID
        action
        resourceType
        resourceID
        detail
        timestamp
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const activityLogsByUserID = /* GraphQL */ `
  query ActivityLogsByUserID(
    $userID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelActivityLogFilterInput
    $limit: Int
    $nextToken: String
  ) {
    activityLogsByUserID(
      userID: $userID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        userID
        action
        resourceType
        resourceID
        detail
        timestamp
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;

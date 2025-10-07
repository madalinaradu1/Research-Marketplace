/* eslint-disable */
// this is an auto generated file. This will be overwritten

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
      owner
      __typename
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
      owner
      __typename
    }
  }
`;
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
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
      owner
      __typename
    }
  }
`;
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
export const deleteProject = /* GraphQL */ `
  mutation DeleteProject(
    $input: DeleteProjectInput!
    $condition: ModelProjectConditionInput
  ) {
    deleteProject(input: $input, condition: $condition) {
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
export const deleteApplication = /* GraphQL */ `
  mutation DeleteApplication(
    $input: DeleteApplicationInput!
    $condition: ModelApplicationConditionInput
  ) {
    deleteApplication(input: $input, condition: $condition) {
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
export const createStudentPost = /* GraphQL */ `
  mutation CreateStudentPost(
    $input: CreateStudentPostInput!
    $condition: ModelStudentPostConditionInput
  ) {
    createStudentPost(input: $input, condition: $condition) {
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
export const updateStudentPost = /* GraphQL */ `
  mutation UpdateStudentPost(
    $input: UpdateStudentPostInput!
    $condition: ModelStudentPostConditionInput
  ) {
    updateStudentPost(input: $input, condition: $condition) {
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
export const deleteStudentPost = /* GraphQL */ `
  mutation DeleteStudentPost(
    $input: DeleteStudentPostInput!
    $condition: ModelStudentPostConditionInput
  ) {
    deleteStudentPost(input: $input, condition: $condition) {
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
export const createMessage = /* GraphQL */ `
  mutation CreateMessage(
    $input: CreateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    createMessage(input: $input, condition: $condition) {
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
export const updateMessage = /* GraphQL */ `
  mutation UpdateMessage(
    $input: UpdateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    updateMessage(input: $input, condition: $condition) {
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
export const deleteMessage = /* GraphQL */ `
  mutation DeleteMessage(
    $input: DeleteMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    deleteMessage(input: $input, condition: $condition) {
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
export const createNotification = /* GraphQL */ `
  mutation CreateNotification(
    $input: CreateNotificationInput!
    $condition: ModelNotificationConditionInput
  ) {
    createNotification(input: $input, condition: $condition) {
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
export const updateNotification = /* GraphQL */ `
  mutation UpdateNotification(
    $input: UpdateNotificationInput!
    $condition: ModelNotificationConditionInput
  ) {
    updateNotification(input: $input, condition: $condition) {
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
export const deleteNotification = /* GraphQL */ `
  mutation DeleteNotification(
    $input: DeleteNotificationInput!
    $condition: ModelNotificationConditionInput
  ) {
    deleteNotification(input: $input, condition: $condition) {
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
export const createDeletedUser = /* GraphQL */ `
  mutation CreateDeletedUser(
    $input: CreateDeletedUserInput!
    $condition: ModelDeletedUserConditionInput
  ) {
    createDeletedUser(input: $input, condition: $condition) {
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
export const updateDeletedUser = /* GraphQL */ `
  mutation UpdateDeletedUser(
    $input: UpdateDeletedUserInput!
    $condition: ModelDeletedUserConditionInput
  ) {
    updateDeletedUser(input: $input, condition: $condition) {
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
export const deleteDeletedUser = /* GraphQL */ `
  mutation DeleteDeletedUser(
    $input: DeleteDeletedUserInput!
    $condition: ModelDeletedUserConditionInput
  ) {
    deleteDeletedUser(input: $input, condition: $condition) {
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

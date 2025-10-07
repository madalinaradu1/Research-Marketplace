/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser(
    $filter: ModelSubscriptionUserFilterInput
    $owner: String
  ) {
    onCreateUser(filter: $filter, owner: $owner) {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser(
    $filter: ModelSubscriptionUserFilterInput
    $owner: String
  ) {
    onUpdateUser(filter: $filter, owner: $owner) {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser(
    $filter: ModelSubscriptionUserFilterInput
    $owner: String
  ) {
    onDeleteUser(filter: $filter, owner: $owner) {
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
export const onCreateProject = /* GraphQL */ `
  subscription OnCreateProject(
    $filter: ModelSubscriptionProjectFilterInput
    $owner: String
  ) {
    onCreateProject(filter: $filter, owner: $owner) {
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
export const onUpdateProject = /* GraphQL */ `
  subscription OnUpdateProject(
    $filter: ModelSubscriptionProjectFilterInput
    $owner: String
  ) {
    onUpdateProject(filter: $filter, owner: $owner) {
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
export const onDeleteProject = /* GraphQL */ `
  subscription OnDeleteProject(
    $filter: ModelSubscriptionProjectFilterInput
    $owner: String
  ) {
    onDeleteProject(filter: $filter, owner: $owner) {
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
export const onCreateApplication = /* GraphQL */ `
  subscription OnCreateApplication(
    $filter: ModelSubscriptionApplicationFilterInput
    $owner: String
  ) {
    onCreateApplication(filter: $filter, owner: $owner) {
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
export const onUpdateApplication = /* GraphQL */ `
  subscription OnUpdateApplication(
    $filter: ModelSubscriptionApplicationFilterInput
    $owner: String
  ) {
    onUpdateApplication(filter: $filter, owner: $owner) {
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
export const onDeleteApplication = /* GraphQL */ `
  subscription OnDeleteApplication(
    $filter: ModelSubscriptionApplicationFilterInput
    $owner: String
  ) {
    onDeleteApplication(filter: $filter, owner: $owner) {
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
export const onCreateStudentPost = /* GraphQL */ `
  subscription OnCreateStudentPost(
    $filter: ModelSubscriptionStudentPostFilterInput
    $owner: String
  ) {
    onCreateStudentPost(filter: $filter, owner: $owner) {
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
export const onUpdateStudentPost = /* GraphQL */ `
  subscription OnUpdateStudentPost(
    $filter: ModelSubscriptionStudentPostFilterInput
    $owner: String
  ) {
    onUpdateStudentPost(filter: $filter, owner: $owner) {
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
export const onDeleteStudentPost = /* GraphQL */ `
  subscription OnDeleteStudentPost(
    $filter: ModelSubscriptionStudentPostFilterInput
    $owner: String
  ) {
    onDeleteStudentPost(filter: $filter, owner: $owner) {
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
export const onCreateMessage = /* GraphQL */ `
  subscription OnCreateMessage(
    $filter: ModelSubscriptionMessageFilterInput
    $owner: String
  ) {
    onCreateMessage(filter: $filter, owner: $owner) {
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
export const onUpdateMessage = /* GraphQL */ `
  subscription OnUpdateMessage(
    $filter: ModelSubscriptionMessageFilterInput
    $owner: String
  ) {
    onUpdateMessage(filter: $filter, owner: $owner) {
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
export const onDeleteMessage = /* GraphQL */ `
  subscription OnDeleteMessage(
    $filter: ModelSubscriptionMessageFilterInput
    $owner: String
  ) {
    onDeleteMessage(filter: $filter, owner: $owner) {
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
export const onCreateNotification = /* GraphQL */ `
  subscription OnCreateNotification(
    $filter: ModelSubscriptionNotificationFilterInput
    $owner: String
  ) {
    onCreateNotification(filter: $filter, owner: $owner) {
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
export const onUpdateNotification = /* GraphQL */ `
  subscription OnUpdateNotification(
    $filter: ModelSubscriptionNotificationFilterInput
    $owner: String
  ) {
    onUpdateNotification(filter: $filter, owner: $owner) {
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
export const onDeleteNotification = /* GraphQL */ `
  subscription OnDeleteNotification(
    $filter: ModelSubscriptionNotificationFilterInput
    $owner: String
  ) {
    onDeleteNotification(filter: $filter, owner: $owner) {
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
export const onCreateDeletedUser = /* GraphQL */ `
  subscription OnCreateDeletedUser(
    $filter: ModelSubscriptionDeletedUserFilterInput
  ) {
    onCreateDeletedUser(filter: $filter) {
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
export const onUpdateDeletedUser = /* GraphQL */ `
  subscription OnUpdateDeletedUser(
    $filter: ModelSubscriptionDeletedUserFilterInput
  ) {
    onUpdateDeletedUser(filter: $filter) {
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
export const onDeleteDeletedUser = /* GraphQL */ `
  subscription OnDeleteDeletedUser(
    $filter: ModelSubscriptionDeletedUserFilterInput
  ) {
    onDeleteDeletedUser(filter: $filter) {
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

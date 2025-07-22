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
      resumeKey
      affiliation
      profileComplete
      status
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
      resumeKey
      affiliation
      profileComplete
      status
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
      resumeKey
      affiliation
      profileComplete
      status
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
      owner
      __typename
    }
  }
`;
export const onCreateProject = /* GraphQL */ `
  subscription OnCreateProject($filter: ModelSubscriptionProjectFilterInput) {
    onCreateProject(filter: $filter) {
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
        role
        department
        major
        academicYear
        gpa
        skills
        researchInterests
        resumeKey
        affiliation
        profileComplete
        status
        createdAt
        updatedAt
        owner
        __typename
      }
      isActive
      createdAt
      updatedAt
      applications {
        nextToken
        __typename
      }
      __typename
    }
  }
`;
export const onUpdateProject = /* GraphQL */ `
  subscription OnUpdateProject($filter: ModelSubscriptionProjectFilterInput) {
    onUpdateProject(filter: $filter) {
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
        role
        department
        major
        academicYear
        gpa
        skills
        researchInterests
        resumeKey
        affiliation
        profileComplete
        status
        createdAt
        updatedAt
        owner
        __typename
      }
      isActive
      createdAt
      updatedAt
      applications {
        nextToken
        __typename
      }
      __typename
    }
  }
`;
export const onDeleteProject = /* GraphQL */ `
  subscription OnDeleteProject($filter: ModelSubscriptionProjectFilterInput) {
    onDeleteProject(filter: $filter) {
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
        role
        department
        major
        academicYear
        gpa
        skills
        researchInterests
        resumeKey
        affiliation
        profileComplete
        status
        createdAt
        updatedAt
        owner
        __typename
      }
      isActive
      createdAt
      updatedAt
      applications {
        nextToken
        __typename
      }
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
        resumeKey
        affiliation
        profileComplete
        status
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
        duration
        applicationDeadline
        facultyID
        isActive
        createdAt
        updatedAt
        __typename
      }
      statement
      resumeKey
      transcriptLink
      status
      facultyNotes
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
        resumeKey
        affiliation
        profileComplete
        status
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
        duration
        applicationDeadline
        facultyID
        isActive
        createdAt
        updatedAt
        __typename
      }
      statement
      resumeKey
      transcriptLink
      status
      facultyNotes
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
        resumeKey
        affiliation
        profileComplete
        status
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
        duration
        applicationDeadline
        facultyID
        isActive
        createdAt
        updatedAt
        __typename
      }
      statement
      resumeKey
      transcriptLink
      status
      facultyNotes
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
        resumeKey
        affiliation
        profileComplete
        status
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
        resumeKey
        affiliation
        profileComplete
        status
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
        resumeKey
        affiliation
        profileComplete
        status
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
        resumeKey
        affiliation
        profileComplete
        status
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
        resumeKey
        affiliation
        profileComplete
        status
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
        resumeKey
        affiliation
        profileComplete
        status
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
        resumeKey
        affiliation
        profileComplete
        status
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
export const onUpdateNotification = /* GraphQL */ `
  subscription OnUpdateNotification(
    $filter: ModelSubscriptionNotificationFilterInput
    $owner: String
  ) {
    onUpdateNotification(filter: $filter, owner: $owner) {
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
        resumeKey
        affiliation
        profileComplete
        status
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
export const onDeleteNotification = /* GraphQL */ `
  subscription OnDeleteNotification(
    $filter: ModelSubscriptionNotificationFilterInput
    $owner: String
  ) {
    onDeleteNotification(filter: $filter, owner: $owner) {
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
        resumeKey
        affiliation
        profileComplete
        status
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
export const onCreateActivityLog = /* GraphQL */ `
  subscription OnCreateActivityLog(
    $filter: ModelSubscriptionActivityLogFilterInput
  ) {
    onCreateActivityLog(filter: $filter) {
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
        resumeKey
        affiliation
        profileComplete
        status
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
export const onUpdateActivityLog = /* GraphQL */ `
  subscription OnUpdateActivityLog(
    $filter: ModelSubscriptionActivityLogFilterInput
  ) {
    onUpdateActivityLog(filter: $filter) {
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
        resumeKey
        affiliation
        profileComplete
        status
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
export const onDeleteActivityLog = /* GraphQL */ `
  subscription OnDeleteActivityLog(
    $filter: ModelSubscriptionActivityLogFilterInput
  ) {
    onDeleteActivityLog(filter: $filter) {
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
        resumeKey
        affiliation
        profileComplete
        status
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

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
      studentPosts {
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
      studentPosts {
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
      studentPosts {
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
      tags
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
      projectStatus
      coordinatorNotes
      selectedStudentID
      filledAt
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
export const onUpdateProject = /* GraphQL */ `
  subscription OnUpdateProject($filter: ModelSubscriptionProjectFilterInput) {
    onUpdateProject(filter: $filter) {
      id
      title
      description
      department
      skillsRequired
      tags
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
      projectStatus
      coordinatorNotes
      selectedStudentID
      filledAt
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
export const onDeleteProject = /* GraphQL */ `
  subscription OnDeleteProject($filter: ModelSubscriptionProjectFilterInput) {
    onDeleteProject(filter: $filter) {
      id
      title
      description
      department
      skillsRequired
      tags
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
      projectStatus
      coordinatorNotes
      selectedStudentID
      filledAt
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
export const onCreateApplication = /* GraphQL */ `
  subscription OnCreateApplication(
    $filter: ModelSubscriptionApplicationFilterInput
  ) {
    onCreateApplication(filter: $filter) {
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
        tags
        qualifications
        duration
        applicationDeadline
        facultyID
        isActive
        requiresTranscript
        projectStatus
        coordinatorNotes
        selectedStudentID
        filledAt
        createdAt
        updatedAt
        __typename
      }
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
      withdrawReason
      isSelected
      selectedAt
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
export const onUpdateApplication = /* GraphQL */ `
  subscription OnUpdateApplication(
    $filter: ModelSubscriptionApplicationFilterInput
  ) {
    onUpdateApplication(filter: $filter) {
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
        tags
        qualifications
        duration
        applicationDeadline
        facultyID
        isActive
        requiresTranscript
        projectStatus
        coordinatorNotes
        selectedStudentID
        filledAt
        createdAt
        updatedAt
        __typename
      }
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
      withdrawReason
      isSelected
      selectedAt
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
export const onDeleteApplication = /* GraphQL */ `
  subscription OnDeleteApplication(
    $filter: ModelSubscriptionApplicationFilterInput
  ) {
    onDeleteApplication(filter: $filter) {
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
        tags
        qualifications
        duration
        applicationDeadline
        facultyID
        isActive
        requiresTranscript
        projectStatus
        coordinatorNotes
        selectedStudentID
        filledAt
        createdAt
        updatedAt
        __typename
      }
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
      withdrawReason
      isSelected
      selectedAt
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
export const onCreateLearningContract = /* GraphQL */ `
  subscription OnCreateLearningContract(
    $filter: ModelSubscriptionLearningContractFilterInput
    $owner: String
  ) {
    onCreateLearningContract(filter: $filter, owner: $owner) {
      id
      applicationID
      application {
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
        withdrawReason
        isSelected
        selectedAt
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
export const onUpdateLearningContract = /* GraphQL */ `
  subscription OnUpdateLearningContract(
    $filter: ModelSubscriptionLearningContractFilterInput
    $owner: String
  ) {
    onUpdateLearningContract(filter: $filter, owner: $owner) {
      id
      applicationID
      application {
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
        withdrawReason
        isSelected
        selectedAt
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
export const onDeleteLearningContract = /* GraphQL */ `
  subscription OnDeleteLearningContract(
    $filter: ModelSubscriptionLearningContractFilterInput
    $owner: String
  ) {
    onDeleteLearningContract(filter: $filter, owner: $owner) {
      id
      applicationID
      application {
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
        withdrawReason
        isSelected
        selectedAt
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
export const onCreateMessageBoard = /* GraphQL */ `
  subscription OnCreateMessageBoard(
    $filter: ModelSubscriptionMessageBoardFilterInput
  ) {
    onCreateMessageBoard(filter: $filter) {
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
        tags
        qualifications
        duration
        applicationDeadline
        facultyID
        isActive
        requiresTranscript
        projectStatus
        coordinatorNotes
        selectedStudentID
        filledAt
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
export const onUpdateMessageBoard = /* GraphQL */ `
  subscription OnUpdateMessageBoard(
    $filter: ModelSubscriptionMessageBoardFilterInput
  ) {
    onUpdateMessageBoard(filter: $filter) {
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
        tags
        qualifications
        duration
        applicationDeadline
        facultyID
        isActive
        requiresTranscript
        projectStatus
        coordinatorNotes
        selectedStudentID
        filledAt
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
export const onDeleteMessageBoard = /* GraphQL */ `
  subscription OnDeleteMessageBoard(
    $filter: ModelSubscriptionMessageBoardFilterInput
  ) {
    onDeleteMessageBoard(filter: $filter) {
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
        tags
        qualifications
        duration
        applicationDeadline
        facultyID
        isActive
        requiresTranscript
        projectStatus
        coordinatorNotes
        selectedStudentID
        filledAt
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
export const onCreateStudentPost = /* GraphQL */ `
  subscription OnCreateStudentPost(
    $filter: ModelSubscriptionStudentPostFilterInput
    $owner: String
  ) {
    onCreateStudentPost(filter: $filter, owner: $owner) {
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
      type
      title
      description
      department
      researchAreas
      skillsOffered
      skillsNeeded
      timeCommitment
      isActive
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
      type
      title
      description
      department
      researchAreas
      skillsOffered
      skillsNeeded
      timeCommitment
      isActive
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
      type
      title
      description
      department
      researchAreas
      skillsOffered
      skillsNeeded
      timeCommitment
      isActive
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;

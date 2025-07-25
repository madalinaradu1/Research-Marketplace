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
export const createApplication = /* GraphQL */ `
  mutation CreateApplication(
    $input: CreateApplicationInput!
    $condition: ModelApplicationConditionInput
  ) {
    createApplication(input: $input, condition: $condition) {
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
export const updateApplication = /* GraphQL */ `
  mutation UpdateApplication(
    $input: UpdateApplicationInput!
    $condition: ModelApplicationConditionInput
  ) {
    updateApplication(input: $input, condition: $condition) {
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
export const deleteApplication = /* GraphQL */ `
  mutation DeleteApplication(
    $input: DeleteApplicationInput!
    $condition: ModelApplicationConditionInput
  ) {
    deleteApplication(input: $input, condition: $condition) {
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
export const createLearningContract = /* GraphQL */ `
  mutation CreateLearningContract(
    $input: CreateLearningContractInput!
    $condition: ModelLearningContractConditionInput
  ) {
    createLearningContract(input: $input, condition: $condition) {
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
export const updateLearningContract = /* GraphQL */ `
  mutation UpdateLearningContract(
    $input: UpdateLearningContractInput!
    $condition: ModelLearningContractConditionInput
  ) {
    updateLearningContract(input: $input, condition: $condition) {
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
export const deleteLearningContract = /* GraphQL */ `
  mutation DeleteLearningContract(
    $input: DeleteLearningContractInput!
    $condition: ModelLearningContractConditionInput
  ) {
    deleteLearningContract(input: $input, condition: $condition) {
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
export const createMessageBoard = /* GraphQL */ `
  mutation CreateMessageBoard(
    $input: CreateMessageBoardInput!
    $condition: ModelMessageBoardConditionInput
  ) {
    createMessageBoard(input: $input, condition: $condition) {
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
export const updateMessageBoard = /* GraphQL */ `
  mutation UpdateMessageBoard(
    $input: UpdateMessageBoardInput!
    $condition: ModelMessageBoardConditionInput
  ) {
    updateMessageBoard(input: $input, condition: $condition) {
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
export const deleteMessageBoard = /* GraphQL */ `
  mutation DeleteMessageBoard(
    $input: DeleteMessageBoardInput!
    $condition: ModelMessageBoardConditionInput
  ) {
    deleteMessageBoard(input: $input, condition: $condition) {
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
export const createMessage = /* GraphQL */ `
  mutation CreateMessage(
    $input: CreateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    createMessage(input: $input, condition: $condition) {
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
export const updateNotification = /* GraphQL */ `
  mutation UpdateNotification(
    $input: UpdateNotificationInput!
    $condition: ModelNotificationConditionInput
  ) {
    updateNotification(input: $input, condition: $condition) {
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
export const deleteNotification = /* GraphQL */ `
  mutation DeleteNotification(
    $input: DeleteNotificationInput!
    $condition: ModelNotificationConditionInput
  ) {
    deleteNotification(input: $input, condition: $condition) {
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
export const createActivityLog = /* GraphQL */ `
  mutation CreateActivityLog(
    $input: CreateActivityLogInput!
    $condition: ModelActivityLogConditionInput
  ) {
    createActivityLog(input: $input, condition: $condition) {
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
export const updateActivityLog = /* GraphQL */ `
  mutation UpdateActivityLog(
    $input: UpdateActivityLogInput!
    $condition: ModelActivityLogConditionInput
  ) {
    updateActivityLog(input: $input, condition: $condition) {
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
export const deleteActivityLog = /* GraphQL */ `
  mutation DeleteActivityLog(
    $input: DeleteActivityLogInput!
    $condition: ModelActivityLogConditionInput
  ) {
    deleteActivityLog(input: $input, condition: $condition) {
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

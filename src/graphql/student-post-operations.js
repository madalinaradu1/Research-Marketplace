export const createStudentPost = /* GraphQL */ `
  mutation CreateStudentPost($input: CreateStudentPostInput!) {
    createStudentPost(input: $input) {
      id
      studentID
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
    }
  }
`;

export const updateStudentPost = /* GraphQL */ `
  mutation UpdateStudentPost($input: UpdateStudentPostInput!) {
    updateStudentPost(input: $input) {
      id
      studentID
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
    }
  }
`;

export const deleteStudentPost = /* GraphQL */ `
  mutation DeleteStudentPost($input: DeleteStudentPostInput!) {
    deleteStudentPost(input: $input) {
      id
    }
  }
`;

export const getStudentPost = /* GraphQL */ `
  query GetStudentPost($id: ID!) {
    getStudentPost(id: $id) {
      id
      studentID
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
      student {
        id
        name
        email
        major
        academicYear
      }
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
        studentID
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
        student {
          id
          name
          email
          major
          academicYear
        }
      }
      nextToken
    }
  }
`;

export const studentPostsByStudent = /* GraphQL */ `
  query StudentPostsByStudent(
    $studentID: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelStudentPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    studentPostsByStudent(
      studentID: $studentID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        studentID
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
        student {
          id
          name
          email
          major
          academicYear
        }
      }
      nextToken
    }
  }
`;
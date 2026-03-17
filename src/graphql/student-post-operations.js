// Student post operations
export const listStudentPosts = /* GraphQL */ `
  query ListStudentPosts(
    $filter: ModelStudentPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listStudentPosts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        type
        title
        description
        studentID
        department
        researchAreas
        skillsOffered
        skillsNeeded
        timeCommitment
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const getStudentPost = /* GraphQL */ `
  query GetStudentPost($id: ID!) {
    getStudentPost(id: $id) {
      id
      type
      title
      description
      studentID
      department
      researchAreas
      skillsOffered
      skillsNeeded
      timeCommitment
      createdAt
      updatedAt
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
      type
      title
      description
      studentID
      department
      researchAreas
      skillsOffered
      skillsNeeded
      timeCommitment
      createdAt
      updatedAt
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
      type
      title
      description
      studentID
      department
      researchAreas
      skillsOffered
      skillsNeeded
      timeCommitment
      createdAt
      updatedAt
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
    }
  }
`;

export const onCreateStudentPostCustom = /* GraphQL */ `
  subscription OnCreateStudentPost {
    onCreateStudentPost {
      id
      type
      title
      description
      studentID
      department
      researchAreas
      skillsOffered
      skillsNeeded
      timeCommitment
      createdAt
      updatedAt
    }
  }
`;

export const onUpdateStudentPostCustom = /* GraphQL */ `
  subscription OnUpdateStudentPost {
    onUpdateStudentPost {
      id
      type
      title
      description
      studentID
      department
      researchAreas
      skillsOffered
      skillsNeeded
      timeCommitment
      createdAt
      updatedAt
    }
  }
`;

export const onDeleteStudentPostCustom = /* GraphQL */ `
  subscription OnDeleteStudentPost {
    onDeleteStudentPost {
      id
    }
  }
`;
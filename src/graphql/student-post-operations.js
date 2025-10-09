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
        title
        content
        authorId
        category
        tags
        isPublic
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
      title
      content
      authorId
      category
      tags
      isPublic
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
      title
      content
      authorId
      category
      tags
      isPublic
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
      title
      content
      authorId
      category
      tags
      isPublic
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
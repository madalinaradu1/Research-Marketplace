// Using existing Message model - no schema changes needed!

export const createPostMessage = /* GraphQL */ `
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
      senderID
      receiverID
      subject
      body
      isRead
      sentAt
      createdAt
      updatedAt
    }
  }
`;

export const listPostMessages = /* GraphQL */ `
  query ListMessages($filter: ModelMessageFilterInput, $limit: Int) {
    listMessages(filter: $filter, limit: $limit) {
      items {
        id
        senderID
        receiverID
        subject
        body
        isRead
        sentAt
        createdAt
        updatedAt
      }
    }
  }
`;

export const onCreatePostMessage = /* GraphQL */ `
  subscription OnCreateMessage {
    onCreateMessage {
      id
      senderID
      receiverID
      subject
      body
      isRead
      sentAt
      createdAt
      updatedAt
    }
  }
`;

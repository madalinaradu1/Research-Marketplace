import { graphqlOperation } from 'aws-amplify';

// Message queries
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
        readAt
        sentAt
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const getMessage = /* GraphQL */ `
  query GetMessage($id: ID!) {
    getMessage(id: $id) {
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
    }
  }
`;

// Message mutations
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
      type
      title
      message
      userId
      isRead
      createdAt
      updatedAt
    }
  }
`;

export const getMessageThread = /* GraphQL */ `
  query GetMessageThread($userId1: String!, $userId2: String!) {
    listMessages(
      filter: {
        or: [
          { and: [{ senderID: { eq: $userId1 } }, { receiverID: { eq: $userId2 } }] }
          { and: [{ senderID: { eq: $userId2 } }, { receiverID: { eq: $userId1 } }] }
        ]
      }
    ) {
      items {
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
      }
    }
  }
`;
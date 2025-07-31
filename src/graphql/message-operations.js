/* eslint-disable */
// Message operations using existing Message schema

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
      sentAt
      readAt
    }
  }
`;

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
        sentAt
        readAt
        createdAt
        updatedAt
      }
      nextToken
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
      sentAt
      readAt
      threadID
      projectID
      messageType
    }
  }
`;

export const getMessageThread = /* GraphQL */ `
  query GetMessageThread($threadID: String!) {
    listMessages(filter: {threadID: {eq: $threadID}}) {
      items {
        id
        senderID
        receiverID
        subject
        body
        isRead
        sentAt
        readAt
        threadID
        messageType
        parentMessageID
        sender {
          id
          name
          email
        }
        receiver {
          id
          name
          email
        }
      }
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
      message
      isRead
      createdAt
    }
  }
`;
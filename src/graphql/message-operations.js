/* eslint-disable */
// Simplified messaging using Notification table

export const createMessage = /* GraphQL */ `
  mutation CreateNotification(
    $input: CreateNotificationInput!
    $condition: ModelNotificationConditionInput
  ) {
    createNotification(input: $input, condition: $condition) {
      id
      userId
      type
      title
      message
      read
      relatedItemId
      relatedItemType
      createdAt
    }
  }
`;

export const listMessages = /* GraphQL */ `
  query ListNotifications(
    $filter: ModelNotificationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listNotifications(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        type
        title
        message
        read
        relatedItemId
        relatedItemType
        createdAt
      }
      nextToken
    }
  }
`;

export const updateMessage = /* GraphQL */ `
  mutation UpdateNotification(
    $input: UpdateNotificationInput!
    $condition: ModelNotificationConditionInput
  ) {
    updateNotification(input: $input, condition: $condition) {
      id
      userId
      type
      title
      message
      read
      relatedItemId
      relatedItemType
      createdAt
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
      userId
      type
      title
      message
      read
      relatedItemId
      relatedItemType
      createdAt
    }
  }
`;
// Re-export all operations from individual files
export * from './queries';
export * from './mutations';
export * from './subscriptions';

// Add missing audit log operations
export const listAuditLogs = /* GraphQL */ `
  query ListAuditLogs(
    $filter: ModelAuditLogFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAuditLogs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        userName
        userEmail
        action
        resource
        details
        timestamp
        ipAddress
        userAgent
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
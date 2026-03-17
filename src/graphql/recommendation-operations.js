export const getRecommendedProjects = /* GraphQL */ `
  query GetRecommendedProjects($limit: Int, $userId: ID, $userTagIds: [String!]) {
    getRecommendedProjects(limit: $limit, userId: $userId, userTagIds: $userTagIds) {
      projectId
      score
      requiredMatches
      optionalMatches
      matchedTagIds
      reasons
      project {
        id
        title
        description
        department
        skillsRequired
        tags
        duration
        applicationDeadline
        facultyID
        isActive
        projectStatus
        createdAt
      }
    }
  }
`;

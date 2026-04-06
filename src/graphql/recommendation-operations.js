export const getRecommendedProjects = /* GraphQL */ `
  query GetRecommendedProjects($limit: Int, $userId: ID, $userTagIds: [String!]) {
    getRecommendedProjects(limit: $limit, userId: $userId, userTagIds: $userTagIds) {
      projectId
      score
      requiredMatches
      optionalMatches
      directMatches
      relatedMatches
      directScore
      relatedScore
      matchedTagIds
      reasons
      explanation {
        directMatchedTagIds
        relatedMatchedTagIds
        directMatches
        relatedMatches
        directScore
        relatedScore
        matchDetails {
          matchedTagId
          projectTagType
          matchKind
          directUserTagIds
          relatedSourceUserTagIds
          relationWeight
          scoreContribution
        }
      }
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

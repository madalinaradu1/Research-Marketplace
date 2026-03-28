/* Amplify Params - DO NOT EDIT
	ENV
	INDEX_TABLE
	PROJECT_TABLE
	REGION
	USER_TABLE
Amplify Params - DO NOT EDIT */
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  BatchGetCommand,
  ScanCommand
} = require('@aws-sdk/lib-dynamodb');
const {
  buildDirectExpandedTags,
  mergeRelatedEdges,
  createCandidateEntry,
  upsertCandidateMatch,
  finalizeCandidate,
  buildRecommendationResponse,
  compareRecommendations
} = require('./recommendationCore');

const ddbClient = new DynamoDBClient({ region: process.env.REGION });
const ddb = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true }
});

const MAX_LIMIT = 50;

const PROJECT_TABLE = process.env.PROJECT_TABLE;
const USER_TABLE = process.env.USER_TABLE;
const INDEX_TABLE = process.env.INDEX_TABLE;
const TAG_RELATIONS_TABLE = process.env.TAG_RELATIONS_TABLE;

const ENABLE_RELATED_TAG_EXPANSION = process.env.ENABLE_RELATED_TAG_EXPANSION === 'true';
const MIN_RELATION_WEIGHT = Number(process.env.MIN_RELATION_WEIGHT || '0.35');
const MAX_RELATED_TAGS_PER_SOURCE = Number(process.env.MAX_RELATED_TAGS_PER_SOURCE || '3');
const DEFAULT_RELATED_WEIGHT = Number(process.env.DEFAULT_RELATED_WEIGHT || '0.40');
const RECOMMENDATION_DEBUG_LOGS = process.env.RECOMMENDATION_DEBUG_LOGS === 'true';

exports.handler = async (event) => {
  const args = event.arguments || {};
  const limit = Math.min(Math.max(args.limit || 10, 1), MAX_LIMIT);
  const identityUserId = event.identity?.username || event.identity?.sub || null;
  const userId = args.userId || identityUserId;

  try {
    validateConfig();

    let userTagIds = Array.isArray(args.userTagIds) ? args.userTagIds.filter(Boolean) : [];
    if (!userTagIds.length && userId) userTagIds = await loadUserTagIds(userId);
    if (!userTagIds.length) return newestFallback(limit);

    logUserTagSummary(userId, userTagIds);

    const expandedTags = await expandUserTags(userTagIds);

    logExpansionSummary(userId, userTagIds, expandedTags);
    const candidateMap = await buildCandidateMap(expandedTags);
    logCandidateSummary(candidateMap);

    if (!candidateMap.size) return newestFallback(limit);

    const projects = await batchGetProjects(Array.from(candidateMap.keys()));
    const nowIso = new Date().toISOString();

    const scored = projects
      .filter(
        (project) =>
          project &&
          project.isActive === true &&
          (project.projectStatus === 'Approved' || project.projectStatus === 'Published') &&
          (!project.applicationDeadline || project.applicationDeadline > nowIso)
      )
      .map((project) => buildRecommendationResponse(project, candidateMap.get(project.id)))
      .sort(compareRecommendations);
    logFinalResults(scored);

    console.log('[recommend]', {
      userTagCount: userTagIds.length,
      expandedTagCount: expandedTags.size,
      candidateCount: candidateMap.size,
      topScore: scored[0]?.score || 0,
      topDirectMatches: scored[0]?.directMatches || 0,
      topRelatedMatches: scored[0]?.relatedMatches || 0
    });

    return scored.length ? scored.slice(0, limit) : newestFallback(limit);
  } catch (error) {
    console.error(
      '[recommend:error]',
      JSON.stringify({
        message: error.message,
        name: error.name,
        stack: error.stack,
        request: {
          limit,
          hasExplicitUserId: Boolean(args.userId),
          identityUserId,
          userId,
          userTagCount: Array.isArray(args.userTagIds) ? args.userTagIds.filter(Boolean).length : null
        },
        config: {
          projectTable: PROJECT_TABLE,
          userTable: USER_TABLE,
          indexTable: INDEX_TABLE,
          tagRelationsTable: TAG_RELATIONS_TABLE,
          region: process.env.REGION,
          expansionEnabled: ENABLE_RELATED_TAG_EXPANSION
        }
      })
    );
    throw error;
  }
};

function validateConfig() {
  const missing = [
    ['PROJECT_TABLE', PROJECT_TABLE],
    ['USER_TABLE', USER_TABLE],
    ['INDEX_TABLE', INDEX_TABLE],
    ['REGION', process.env.REGION]
  ]
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (ENABLE_RELATED_TAG_EXPANSION && !TAG_RELATIONS_TABLE) {
    missing.push('TAG_RELATIONS_TABLE');
  }

  if (missing.length) {
    throw new Error(`Missing Lambda configuration: ${missing.join(', ')}`);
  }
}

async function loadUserTagIds(userId) {
  const response = await ddb.send(
    new GetCommand({
      TableName: USER_TABLE,
      Key: { id: userId }
    })
  );

  const user = response.Item || {};
  const tagIds = new Set();

  (user.researchInterests || []).forEach((tagId) => tagId && tagIds.add(tagId));
  (user.skills || []).forEach((tagId) => tagId && tagIds.add(tagId));
  if (user.department) tagIds.add(user.department);

  return Array.from(tagIds);
}

async function expandUserTags(userTagIds) {
  const expandedTags = buildDirectExpandedTags(userTagIds);

  if (!ENABLE_RELATED_TAG_EXPANSION) {
    return expandedTags;
  }

  for (const sourceTagId of userTagIds) {
    const relatedEdges = await loadRelatedEdgesForSourceTag(sourceTagId);
    mergeRelatedEdges(expandedTags, sourceTagId, relatedEdges, DEFAULT_RELATED_WEIGHT);
  }

  return expandedTags;
}

async function loadRelatedEdgesForSourceTag(sourceTagId) {
  let lastKey;
  const allItems = [];

  do {
    const response = await ddb.send(
      new QueryCommand({
        TableName: TAG_RELATIONS_TABLE,
        KeyConditionExpression: '#pk = :pk',
        ExpressionAttributeNames: {
          '#pk': 'PK'
        },
        ExpressionAttributeValues: {
          ':pk': `TAG#${sourceTagId}`
        },
        ExclusiveStartKey: lastKey
      })
    );

    allItems.push(...(response.Items || []));
    lastKey = response.LastEvaluatedKey;
  } while (lastKey);

  const filteredEdges = allItems
    .filter(
      (item) =>
        item &&
        item.relationType === 'RELATED_TO' &&
        item.isActive === true &&
        item.targetTagId &&
        item.targetTagId !== sourceTagId
    )
    .map((item) => ({
      sourceTagId: item.sourceTagId,
      targetTagId: item.targetTagId,
      edgeWeight: normalizeRelationWeight(item.edgeWeight)
    }))
    .filter((item) => item.edgeWeight >= MIN_RELATION_WEIGHT)
    .sort((a, b) => {
      if (b.edgeWeight !== a.edgeWeight) return b.edgeWeight - a.edgeWeight;
      return a.targetTagId.localeCompare(b.targetTagId);
    })
    .slice(0, MAX_RELATED_TAGS_PER_SOURCE);

  logRelationsSummary(sourceTagId, allItems, filteredEdges);

  return filteredEdges;
}

function normalizeRelationWeight(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return DEFAULT_RELATED_WEIGHT;
  return Math.max(0, Math.min(1, numeric));
}

async function buildCandidateMap(expandedTags) {
  const candidateMap = new Map();

  for (const [tagId, expandedTagSpec] of expandedTags.entries()) {
    let lastKey;

    do {
      const response = await ddb.send(
        new QueryCommand({
          TableName: INDEX_TABLE,
          KeyConditionExpression: '#pk = :pk',
          ExpressionAttributeNames: {
            '#pk': 'PK'
          },
          ExpressionAttributeValues: {
            ':pk': `TAG#${tagId}`
          },
          ExclusiveStartKey: lastKey
        })
      );

      for (const item of response.Items || []) {
        const projectId = item.projectId;
        if (!projectId) continue;

        if (!candidateMap.has(projectId)) {
          candidateMap.set(projectId, createCandidateEntry(projectId));
        }

        upsertCandidateMatch(candidateMap.get(projectId), item, expandedTagSpec);
      }

      lastKey = response.LastEvaluatedKey;
    } while (lastKey);
  }

  for (const [projectId, candidate] of candidateMap.entries()) {
    candidateMap.set(
      projectId,
      finalizeCandidate(candidate, {
        defaultRelatedWeight: DEFAULT_RELATED_WEIGHT
      })
    );
  }

  return candidateMap;
}

async function batchGetProjects(projectIds) {
  const chunks = [];
  for (let i = 0; i < projectIds.length; i += 100) {
    chunks.push(projectIds.slice(i, i + 100));
  }

  const allProjects = [];

  for (const ids of chunks) {
    const response = await ddb.send(
      new BatchGetCommand({
        RequestItems: {
          [PROJECT_TABLE]: {
            Keys: ids.map((id) => ({ id }))
          }
        }
      })
    );

    allProjects.push(...(response.Responses?.[PROJECT_TABLE] || []));
  }

  return allProjects;
}

async function newestFallback(limit) {
  const nowIso = new Date().toISOString();

  const response = await ddb.send(
    new ScanCommand({
      TableName: PROJECT_TABLE,
      FilterExpression:
        '#active = :active AND (#status = :approved OR #status = :published) AND (attribute_not_exists(#deadline) OR #deadline > :now)',
      ExpressionAttributeNames: {
        '#active': 'isActive',
        '#status': 'projectStatus',
        '#deadline': 'applicationDeadline'
      },
      ExpressionAttributeValues: {
        ':active': true,
        ':approved': 'Approved',
        ':published': 'Published',
        ':now': nowIso
      }
    })
  );

  return (response.Items || [])
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, limit)
    .map((project) => ({
      projectId: project.id,
      score: 0,
      requiredMatches: 0,
      optionalMatches: 0,
      directMatches: 0,
      relatedMatches: 0,
      directScore: 0,
      relatedScore: 0,
      matchedTagIds: [],
      reasons: ['Newest active project'],
      explanation: null,
      project
    }));
}

function logUserTagSummary(userId, userTagIds) {
  if (!RECOMMENDATION_DEBUG_LOGS) return;

  console.log(
    '[recommend:user-tags]',
    JSON.stringify({
      userId,
      userTagIds
    })
  );
}

function logExpansionSummary(userId, userTagIds, expandedTags) {
  if (!RECOMMENDATION_DEBUG_LOGS) return;

  console.log(
    '[recommend:expand]',
    JSON.stringify({
      userId,
      expansionEnabled: ENABLE_RELATED_TAG_EXPANSION,
      userTagIds,
      expandedTagIds: Array.from(expandedTags.keys()),
      expandedTags: Array.from(expandedTags.values()).map((tag) => ({
        tagId: tag.tagId,
        matchKind: tag.matchKind,
        directUserTagIds: Array.from(tag.directUserTagIds || []),
        relatedSourceUserTagIds: Array.from(tag.relatedSourceUserTagIds || []),
        relationWeight: tag.relationWeight ?? null
      }))
    })
  );
}

function logRelationsSummary(sourceTagId, allItems, filteredEdges) {
  if (!RECOMMENDATION_DEBUG_LOGS) return;

  console.log(
    '[recommend:relations]',
    JSON.stringify({
      sourceTagId,
      rawRelationCount: allItems.length,
      keptRelations: filteredEdges
    })
  );
}

function logCandidateSummary(candidateMap) {
  if (!RECOMMENDATION_DEBUG_LOGS) return;

  console.log(
    '[recommend:candidates]',
    JSON.stringify({
      candidateCount: candidateMap.size,
      candidates: Array.from(candidateMap.values()).slice(0, 25).map((candidate) => ({
        projectId: candidate.projectId,
        directMatchedTagIds: Array.from(candidate.directMatchedTagIds || []),
        relatedMatchedTagIds: Array.from(candidate.relatedMatchedTagIds || []),
        directScore: candidate.directScore,
        relatedScore: candidate.relatedScore,
        requiredDirectCount: candidate.requiredDirectCount,
        optionalDirectCount: candidate.optionalDirectCount,
        requiredRelatedCount: candidate.requiredRelatedCount,
        optionalRelatedCount: candidate.optionalRelatedCount
      }))
    })
  );
}

function logFinalResults(scored) {
  if (!RECOMMENDATION_DEBUG_LOGS) return;

  console.log(
    '[recommend:results]',
    JSON.stringify(
      scored.slice(0, 10).map((rec) => ({
        projectId: rec.projectId,
        score: rec.score,
        directMatches: rec.directMatches,
        relatedMatches: rec.relatedMatches,
        directScore: rec.directScore,
        relatedScore: rec.relatedScore,
        matchedTagIds: rec.matchedTagIds,
        reasons: rec.reasons
      }))
    )
  );
}

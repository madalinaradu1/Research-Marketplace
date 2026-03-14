/* Amplify Params - DO NOT EDIT
	ENV
	INDEX_TABLE
	PROJECT_TABLE
	REGION
	USER_TABLE
Amplify Params - DO NOT EDIT */
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

const REQUIRED_WEIGHT = 3;
const OPTIONAL_WEIGHT = 1.5;
const MAX_LIMIT = 50;

const PROJECT_TABLE = process.env.PROJECT_TABLE;
const USER_TABLE = process.env.USER_TABLE;
const INDEX_TABLE = process.env.INDEX_TABLE;

exports.handler = async (event) => {
  const args = event.arguments || {};
  const limit = Math.min(Math.max(args.limit || 10, 1), MAX_LIMIT);
  const identityUserId = event.identity?.username || event.identity?.sub || null;
  const userId = args.userId || identityUserId;

  let userTagIds = Array.isArray(args.userTagIds) ? args.userTagIds.filter(Boolean) : [];
  if (!userTagIds.length && userId) userTagIds = await loadUserTagIds(userId);
  if (!userTagIds.length) return newestFallback(limit);

  const candidateMap = await buildCandidateMap(userTagIds);
  if (!candidateMap.size) return newestFallback(limit);

  const projects = await batchGetProjects(Array.from(candidateMap.keys()));
  const nowIso = new Date().toISOString();

  const scored = projects 
    .filter((p) => 
      p &&
      p.isActive === true &&
      (p.projectStatus === 'Approved' || p.projectStatus === 'Published') &&
      (!p.applicationDeadline || p.applicationDeadline > nowIso)
    )
    .map((project) => {
      const c = candidateMap.get(project.id);
      const matched = Array.from(c.matchedTagIds);
      return {
        projectId: project.id,
        score: c.requiredMatches * REQUIRED_WEIGHT + c.optionalMatches * OPTIONAL_WEIGHT,
        requiredMatches: c.requiredMatches,
        optionalMatches: c.optionalMatches,
        matchedTagIds: matched,
        reasons: matched.slice(0, 3),
        project
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const bc = b.project?.createdAt || '';
      const ac = a.project?.createdAt || '';
      if (bc !== ac) return bc.localeCompare(ac);
      return a.projectId.localeCompare(b.projectId);
    });

  console.log('[recommend]', { userTagCount: userTagIds.length, candidateCount: candidateMap.size, topScore: scored[0]?.score || 0 });
  return scored.length ? scored.slice(0, limit) : newestFallback(limit);
};

async function loadUserTagIds(userId) {
  const r = await ddb.get({ TableName: USER_TABLE, Key: { id: userId } }).promise();
  const u = r.Item || {};
  const set = new Set();
  (u.researchInterests || []).forEach((t) => t && set.add(t));
  (u.skills || []).forEach((t) => t && set.add(t));
  if (u.department) set.add(u.department);
  return Array.from(set);
}

async function buildCandidateMap(userTagIds) {
  const out = new Map();

  for (const tagId of userTagIds) {
    let lastKey;
    do {
      const q = await ddb.query({
        TableName: INDEX_TABLE,
        KeyConditionExpression: '#pk = :pk',
        ExpressionAttributeNames: { '#pk': 'PK' },
        ExpressionAttributeValues: { ':pk': `TAG#${tagId}` },
        ExclusiveStartKey: lastKey
      }).promise();

      (q.Items || []).forEach((item) => {
        const pid = item.projectId;
        if (!pid) return;
        if (!out.has(pid)) out.set(pid, { requiredMatches: 0, optionalMatches: 0, matchedTagIds: new Set() });
        const row = out.get(pid);
        if (item.tagType === 'REQUIRED') row.requiredMatches += 1;
        else row.optionalMatches += 1;
        row.matchedTagIds.add(item.tagId);
      });
      lastKey = q.LastEvaluatedKey;
    } while (lastKey);
  }
  return out;
}

async function batchGetProjects(projectIds) {
  const chunks = [];
  for (let i = 0; i < projectIds.length; i += 100) chunks.push(projectIds.slice(i, i + 100));
  const all = [];

  for (const ids of chunks) {
    const r = await ddb.batchGet({
      RequestItems: { [PROJECT_TABLE]: { Keys: ids.map((id) => ({ id })) } }
    }).promise();
    all.push(...(r.Responses?.[PROJECT_TABLE] || []));
  }
  return all;
}

async function newestFallback(limit) {
  const nowIso = new Date().toISOString();
  const r = await ddb.scan({
    TableName: PROJECT_TABLE,
    FilterExpression: '#active = :active AND (#status = :approved OR #status = :published) AND (attribute_not_exists(#deadline) OR #deadline > :now)',
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
  }).promise();

  return (r.Items || [])
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, limit)
    .map((project) => ({
      projectId: project.id,
      score: 0,
      requiredMatches: 0,
      optionalMatches: 0,
      matchedTagIds: [],
      reasons: ['Newest active project'],
      project
    }));
}

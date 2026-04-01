const assert = require('assert');
const {
  buildDirectExpandedTags,
  mergeRelatedEdges,
  createCandidateEntry,
  upsertCandidateMatch,
  finalizeCandidate,
  buildRecommendationResponse,
  compareRecommendations
} = require('../amplify/backend/function/projectRecommendations/src/recommendationCore');

const directExpanded = buildDirectExpandedTags(['domain-cybersecurity']);
mergeRelatedEdges(
  directExpanded,
  'domain-cybersecurity',
  [{ targetTagId: 'domain-ai-security', edgeWeight: 0.55 }],
  0.4
);

assert(
  directExpanded.get('domain-cybersecurity').matchKind === 'DIRECT',
  'Direct tags should remain direct'
);
assert(
  directExpanded.get('domain-ai-security').matchKind === 'RELATED',
  'Related tags should be added as related'
);

const directCandidate = createCandidateEntry('direct-project');
upsertCandidateMatch(
  directCandidate,
  { tagId: 'domain-cybersecurity', tagType: 'REQUIRED' },
  directExpanded.get('domain-cybersecurity')
);
const finalizedDirect = finalizeCandidate(directCandidate, { defaultRelatedWeight: 0.4 });
const directResponse = buildRecommendationResponse(
  { id: 'direct-project', createdAt: '2026-03-03T00:00:00.000Z' },
  finalizedDirect
);

assert(directResponse.score === 3, 'Required direct match should score 3');
assert(directResponse.directMatches === 1, 'Direct match count should be 1');
assert(directResponse.relatedMatches === 0, 'Related match count should be 0');

const relatedCandidate = createCandidateEntry('related-project');
upsertCandidateMatch(
  relatedCandidate,
  { tagId: 'domain-ai-security', tagType: 'REQUIRED' },
  directExpanded.get('domain-ai-security')
);
const finalizedRelated = finalizeCandidate(relatedCandidate, { defaultRelatedWeight: 0.4 });
const relatedResponse = buildRecommendationResponse(
  { id: 'related-project', createdAt: '2026-03-04T00:00:00.000Z' },
  finalizedRelated
);

assert(relatedResponse.score === 1.65, 'Required related match should score 3 * 0.55');
assert(relatedResponse.directMatches === 0, 'Indirect-only candidate should have no direct matches');
assert(relatedResponse.relatedMatches === 1, 'Indirect-only candidate should have one related match');
assert(
  compareRecommendations(directResponse, relatedResponse) < 0,
  'Direct-match result should sort ahead of indirect-only result'
);

const upgradedCandidate = createCandidateEntry('upgrade-project');
upsertCandidateMatch(
  upgradedCandidate,
  { tagId: 'domain-ai-security', tagType: 'REQUIRED' },
  directExpanded.get('domain-ai-security')
);

const exactAiExpanded = buildDirectExpandedTags(['domain-ai-security']);
upsertCandidateMatch(
  upgradedCandidate,
  { tagId: 'domain-ai-security', tagType: 'REQUIRED' },
  exactAiExpanded.get('domain-ai-security')
);

const finalizedUpgraded = finalizeCandidate(upgradedCandidate, { defaultRelatedWeight: 0.4 });

assert(finalizedUpgraded.directScore === 3, 'Exact match should override related match scoring');
assert(finalizedUpgraded.relatedScore === 0, 'Same matched tag should not be double-counted');
assert(finalizedUpgraded.directMatchedTagIds.has('domain-ai-security'), 'Exact tag should be kept');

console.log('Recommendation scoring test passed.');

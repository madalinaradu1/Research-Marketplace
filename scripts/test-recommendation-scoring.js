function scoreCandidate(candidate) {
  return candidate.requiredMatches * 3 + candidate.optionalMatches * 1.5;
}

function sortCandidates(candidates) {
  return [...candidates].sort((a, b) => {
    const scoreDiff = scoreCandidate(b) - scoreCandidate(a);
    if (scoreDiff !== 0) return scoreDiff;

    const bc = b.project.createdAt || '';
    const ac = a.project.createdAt || '';
    if (bc !== ac) return bc.localeCompare(ac);

    return a.projectId.localeCompare(b.projectId);
  });
}

function newestFallback(projects, limit) {
  return [...projects]
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

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const fixtures = [
  {
    projectId: 'b-project',
    requiredMatches: 1,
    optionalMatches: 0,
    project: { createdAt: '2026-03-01T00:00:00.000Z' }
  },
  {
    projectId: 'a-project',
    requiredMatches: 0,
    optionalMatches: 2,
    project: { createdAt: '2026-03-02T00:00:00.000Z' }
  },
  {
    projectId: 'c-project',
    requiredMatches: 1,
    optionalMatches: 0,
    project: { createdAt: '2026-03-03T00:00:00.000Z' }
  },
  {
    projectId: 'aa-project',
    requiredMatches: 1,
    optionalMatches: 0,
    project: { createdAt: '2026-03-03T00:00:00.000Z' }
  }
];

const sorted = sortCandidates(fixtures);
const fallback = newestFallback([
  { id: 'older-project', createdAt: '2026-03-01T00:00:00.000Z' },
  { id: 'newest-project', createdAt: '2026-03-04T00:00:00.000Z' }
], 1);

assert(scoreCandidate(fixtures[0]) === 3, 'Required score should be 3');
assert(scoreCandidate(fixtures[1]) === 3, 'Two optional matches should score 3');
assert(sorted[0].projectId === 'aa-project', 'Project ID should break ties after equal score and createdAt');
assert(sorted[1].projectId === 'c-project', 'Lexically later project ID should come after same-score same-date tie');
assert(sorted[2].projectId === 'a-project', 'Newer equal-score project should come before older equal-score project');
assert(sorted[3].projectId === 'b-project', 'Oldest equal-score candidate should sort last');
assert(fallback[0].projectId === 'newest-project', 'Fallback should return newest project first');
assert(fallback[0].reasons[0] === 'Newest active project', 'Fallback reason should stay stable');

console.log('Recommendation scoring test passed.');

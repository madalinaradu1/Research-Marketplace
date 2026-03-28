const REQUIRED_WEIGHT = 3;
const OPTIONAL_WEIGHT = 1.5;

const MATCH_KIND = {
  DIRECT: 'DIRECT',
  RELATED: 'RELATED'
};

function uniqueTruthy(values = []) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function clampRelationWeight(value, fallback = 0.4) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(1, numeric));
}

function roundScore(value) {
  return Number(Number(value || 0).toFixed(4));
}

function unionIntoSet(targetSet, values) {
  for (const value of values || []) {
    if (value) targetSet.add(value);
  }
}

function buildDirectExpandedTags(userTagIds) {
  const expanded = new Map();

  for (const tagId of uniqueTruthy(userTagIds)) {
    expanded.set(tagId, {
      tagId,
      matchKind: MATCH_KIND.DIRECT,
      directUserTagIds: new Set([tagId]),
      relatedSourceUserTagIds: new Set(),
      relationWeight: null
    });
  }

  return expanded;
}

function mergeRelatedEdges(expandedTags, sourceTagId, edges, defaultRelatedWeight) {
  for (const edge of edges || []) {
    const targetTagId = edge.targetTagId;
    if (!targetTagId || targetTagId === sourceTagId) continue;

    const relationWeight = clampRelationWeight(edge.edgeWeight, defaultRelatedWeight);
    const existing = expandedTags.get(targetTagId);

    if (!existing) {
      expandedTags.set(targetTagId, {
        tagId: targetTagId,
        matchKind: MATCH_KIND.RELATED,
        directUserTagIds: new Set(),
        relatedSourceUserTagIds: new Set([sourceTagId]),
        relationWeight
      });
      continue;
    }

    existing.relatedSourceUserTagIds.add(sourceTagId);

    if (existing.matchKind === MATCH_KIND.RELATED) {
      existing.relationWeight = Math.max(existing.relationWeight ?? 0, relationWeight);
    }
  }

  return expandedTags;
}

function createCandidateEntry(projectId) {
  return {
    projectId,
    matchesByTagId: new Map()
  };
}

function upsertCandidateMatch(candidate, indexRow, expandedTagSpec) {
  const matchedTagId = indexRow.tagId;
  if (!matchedTagId) return candidate;

  const incomingKind =
    expandedTagSpec.matchKind === MATCH_KIND.DIRECT ? MATCH_KIND.DIRECT : MATCH_KIND.RELATED;

  const existing = candidate.matchesByTagId.get(matchedTagId);

  if (!existing) {
    candidate.matchesByTagId.set(matchedTagId, {
      matchedTagId,
      projectTagType: indexRow.tagType === 'REQUIRED' ? 'REQUIRED' : 'OPTIONAL',
      matchKind: incomingKind,
      directUserTagIds: new Set(expandedTagSpec.directUserTagIds),
      relatedSourceUserTagIds: new Set(expandedTagSpec.relatedSourceUserTagIds),
      relationWeight:
        incomingKind === MATCH_KIND.RELATED ? expandedTagSpec.relationWeight ?? null : null,
      scoreContribution: 0
    });
    return candidate;
  }

  unionIntoSet(existing.directUserTagIds, expandedTagSpec.directUserTagIds);
  unionIntoSet(existing.relatedSourceUserTagIds, expandedTagSpec.relatedSourceUserTagIds);

  if (incomingKind === MATCH_KIND.DIRECT && existing.matchKind === MATCH_KIND.RELATED) {
    existing.matchKind = MATCH_KIND.DIRECT;
    existing.relationWeight = null;
    return candidate;
  }

  if (incomingKind === MATCH_KIND.RELATED && existing.matchKind === MATCH_KIND.RELATED) {
    existing.relationWeight = Math.max(
      existing.relationWeight ?? 0,
      expandedTagSpec.relationWeight ?? 0
    );
  }

  return candidate;
}

function finalizeCandidate(candidate, { defaultRelatedWeight = 0.4 } = {}) {
  candidate.directMatchedTagIds = new Set();
  candidate.relatedMatchedTagIds = new Set();
  candidate.requiredDirectCount = 0;
  candidate.optionalDirectCount = 0;
  candidate.requiredRelatedCount = 0;
  candidate.optionalRelatedCount = 0;
  candidate.directScore = 0;
  candidate.relatedScore = 0;

  for (const match of candidate.matchesByTagId.values()) {
    const baseWeight = match.projectTagType === 'REQUIRED' ? REQUIRED_WEIGHT : OPTIONAL_WEIGHT;

    if (match.matchKind === MATCH_KIND.DIRECT) {
      match.scoreContribution = roundScore(baseWeight);
      candidate.directMatchedTagIds.add(match.matchedTagId);
      candidate.directScore += match.scoreContribution;

      if (match.projectTagType === 'REQUIRED') candidate.requiredDirectCount += 1;
      else candidate.optionalDirectCount += 1;

      continue;
    }

    match.relationWeight = clampRelationWeight(match.relationWeight, defaultRelatedWeight);
    match.scoreContribution = roundScore(baseWeight * match.relationWeight);
    candidate.relatedMatchedTagIds.add(match.matchedTagId);
    candidate.relatedScore += match.scoreContribution;

    if (match.projectTagType === 'REQUIRED') candidate.requiredRelatedCount += 1;
    else candidate.optionalRelatedCount += 1;
  }

  candidate.directScore = roundScore(candidate.directScore);
  candidate.relatedScore = roundScore(candidate.relatedScore);
  candidate.hasDirectMatch = candidate.directMatchedTagIds.size > 0;

  return candidate;
}

function buildSortedMatchDetails(candidate) {
  return Array.from(candidate.matchesByTagId.values())
    .map((match) => ({
      matchedTagId: match.matchedTagId,
      projectTagType: match.projectTagType,
      matchKind: match.matchKind,
      directUserTagIds: Array.from(match.directUserTagIds).sort(),
      relatedSourceUserTagIds: Array.from(match.relatedSourceUserTagIds).sort(),
      relationWeight: match.matchKind === MATCH_KIND.RELATED ? roundScore(match.relationWeight) : null,
      scoreContribution: roundScore(match.scoreContribution)
    }))
    .sort((a, b) => {
      if (a.matchKind !== b.matchKind) {
        return a.matchKind === MATCH_KIND.DIRECT ? -1 : 1;
      }
      if (b.scoreContribution !== a.scoreContribution) {
        return b.scoreContribution - a.scoreContribution;
      }
      return a.matchedTagId.localeCompare(b.matchedTagId);
    });
}

function buildReasonTagIds(candidate, limit = 3) {
  return buildSortedMatchDetails(candidate)
    .map((detail) => detail.matchedTagId)
    .slice(0, limit);
}

function buildRecommendationExplanation(candidate) {
  return {
    directMatchedTagIds: Array.from(candidate.directMatchedTagIds).sort(),
    relatedMatchedTagIds: Array.from(candidate.relatedMatchedTagIds).sort(),
    directMatches: candidate.directMatchedTagIds.size,
    relatedMatches: candidate.relatedMatchedTagIds.size,
    directScore: roundScore(candidate.directScore),
    relatedScore: roundScore(candidate.relatedScore),
    matchDetails: buildSortedMatchDetails(candidate)
  };
}

function buildRecommendationResponse(project, candidate) {
  const explanation = buildRecommendationExplanation(candidate);

  return {
    projectId: project.id,
    score: roundScore(candidate.directScore + candidate.relatedScore),
    requiredMatches: candidate.requiredDirectCount + candidate.requiredRelatedCount,
    optionalMatches: candidate.optionalDirectCount + candidate.optionalRelatedCount,
    directMatches: explanation.directMatches,
    relatedMatches: explanation.relatedMatches,
    directScore: explanation.directScore,
    relatedScore: explanation.relatedScore,
    matchedTagIds: [
      ...explanation.directMatchedTagIds,
      ...explanation.relatedMatchedTagIds
    ],
    reasons: buildReasonTagIds(candidate),
    explanation,
    project
  };
}

function compareRecommendations(a, b) {
  const aHasDirect = a.directMatches > 0;
  const bHasDirect = b.directMatches > 0;

  if (aHasDirect !== bHasDirect) {
    return Number(bHasDirect) - Number(aHasDirect);
  }

  if (b.score !== a.score) {
    return b.score - a.score;
  }

  const bc = b.project?.createdAt || '';
  const ac = a.project?.createdAt || '';
  if (bc !== ac) {
    return bc.localeCompare(ac);
  }

  return a.projectId.localeCompare(b.projectId);
}

module.exports = {
  REQUIRED_WEIGHT,
  OPTIONAL_WEIGHT,
  MATCH_KIND,
  buildDirectExpandedTags,
  mergeRelatedEdges,
  createCandidateEntry,
  upsertCandidateMatch,
  finalizeCandidate,
  buildRecommendationResponse,
  compareRecommendations
};
  

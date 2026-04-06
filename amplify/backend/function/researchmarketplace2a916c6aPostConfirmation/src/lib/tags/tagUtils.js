//Normalize tag names for consistent storage and lookup
export function normalizeTagName(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

export function normalizeWords(value = '') {
    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ')
        .replace(/-/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
}

export function hasWordPrefixMatch(candidate, query) {
  const queryWords = normalizeWords(query);
  if (!queryWords.length) {
    return false;
  }

  const candidateWords = normalizeWords(candidate);

  return queryWords.every((queryWord) =>
    candidateWords.some((candidateWord) => candidateWord.startsWith(queryWord))
  );
}

export function isTagPrefixMatch(tag, rawPrefix) {
  const normalizedPrefix = normalizeTagName(rawPrefix);

  if (!normalizedPrefix) {
    return false;
  }

  const normalizedName = (tag?.normalized_name || '').toLowerCase();
  const displayName = (tag?.display_name || '').toLowerCase();

  return (
    normalizedName.startsWith(normalizedPrefix) ||
    displayName.startsWith(rawPrefix.toLowerCase().trim()) ||
    hasWordPrefixMatch(normalizedName, rawPrefix) ||
    hasWordPrefixMatch(displayName, rawPrefix)
  );
}

export function buildWordIndexItems(tag) {
  const words = Array.from(new Set(normalizeWords(tag?.normalized_name || tag?.display_name || '')));

  return words.map((word) => ({
    PK: 'TAG',
    SK: `WORD#${word}#TAG#${tag.tag_id}`,
    GSI1PK: 'TAG_WORD',
    GSI1SK: `${word}#${tag.tag_id}`,
    tag_id: tag.tag_id,
    display_name: tag.display_name,
    normalized_name: tag.normalized_name,
    parent_tag_id: tag.parent_tag_id ?? null,
    tag_type: tag.tag_type,
    aliases: Array.isArray(tag.aliases) ? tag.aliases : [],
    description: tag.description ?? null,
    hierarchy_path: Array.isArray(tag.hierarchy_path) ? tag.hierarchy_path : [],
    status: tag.status ?? 'ACTIVE',
    created_at: tag.created_at,
    created_by_role: tag.created_by_role,
    created_by_id: tag.created_by_id
  }));
}

//Generate determinsitic tag ID from display name
export function generateTagId(displayName, tagType) {
    const normalized = normalizeTagName(displayName);
    return `${tagType.toLowerCase()}-${normalized}`;
}

// Validate tag hierarchy (prevent infinite recursion, enforce depth limit)
export function validateHierarchy(tagId, parentTagId, allTags, maxDepth = 3) {
  if (tagId === parentTagId) {
    throw new Error('Tag cannot be its own parent');
  }

  let depth = 1;
  let currentParent = parentTagId;
  const visited = new Set([tagId]);

  while (currentParent) {
    if (visited.has(currentParent)) {
      throw new Error('Circular reference detected in tag hierarchy');
    }
    visited.add(currentParent);
    
    const parentTag = allTags.find(t => t.tag_id === currentParent);
    if (!parentTag) {
      throw new Error(`Parent tag ${currentParent} does not exist`);
    }
    
    depth++;
    if (depth > maxDepth) {
      throw new Error(`Hierarchy depth exceeds maximum of ${maxDepth}`);
    }
    
    currentParent = parentTag.parent_tag_id;
  }

  return true;
}

// Build hierarchy path for a tag
export function buildHierarchyPath(tagId, allTags) {
  const path = [];
  let currentId = tagId;
  const visited = new Set();

  while (currentId) {
    if (visited.has(currentId)) break;
    visited.add(currentId);

    const tag = allTags.find(t => t.tag_id === currentId);
    if (!tag) break;

    path.unshift(tag.normalized_name);
    currentId = tag.parent_tag_id;
  }

  return path;
}

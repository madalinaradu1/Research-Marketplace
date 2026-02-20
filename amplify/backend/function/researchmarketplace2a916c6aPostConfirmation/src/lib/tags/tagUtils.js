//Normalize tag names for consistent storage and lookup
export function normalizeTagName(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
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

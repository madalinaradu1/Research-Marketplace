// Prevents raw IDs from appearing in the UI
export function getTagDisplayName(tagId, tagsById) {
  if (!tagId) return '';
  const tag = tagsById.get(tagId);
  return tag?.display_name || tagId;
}

export function mapTagIdsToDisplayNames(tagIds, tagsById) {
  if (!Array.isArray(tagIds)) return [];
  return tagIds.map((id) => getTagDisplayName(id, tagsById));
}

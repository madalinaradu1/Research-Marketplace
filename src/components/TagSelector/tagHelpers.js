export function toStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return [];
}

export function toResolvedTagIds(value, resolveTagIds) {
  return resolveTagIds(toStringArray(value));
}

export function tagIdsToDisplayNames(tagIds, tagsById) {
  return (Array.isArray(tagIds) ? tagIds : [])
    .map((id) => tagsById.get(id)?.display_name || id)
    .filter(Boolean);
}

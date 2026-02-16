export function normalizeTagName(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function normalizeDisplayPrefix(value = '') {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
}

export function isPrefixMatch(tag, rawPrefix) {
  const normalizedPrefix = normalizeTagName(rawPrefix);
  const displayPrefix = normalizeDisplayPrefix(rawPrefix);

  if (!normalizedPrefix && !displayPrefix) {
    return false;
  }

  const normalizedName = (tag?.normalized_name || '').toLowerCase();
  const displayName = (tag?.display_name || '').toLowerCase();

  return normalizedName.startsWith(normalizedPrefix) || displayName.startsWith(displayPrefix);
}
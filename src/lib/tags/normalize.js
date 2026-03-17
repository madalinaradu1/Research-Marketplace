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

export function normalizeWords( value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/-/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}
export function isPrefixMatch(tag, rawPrefix) {
  const normalizedPrefix = normalizeTagName(rawPrefix);
  const displayPrefix = normalizeDisplayPrefix(rawPrefix);

  if (!normalizedPrefix && !displayPrefix) {
    return false;
  }

  const normalizedName = (tag?.normalized_name || '').toLowerCase();
  const displayName = (tag?.display_name || '').toLowerCase();
  const aliases = Array.isArray(tag?.aliases) ? tag.aliases : [];

  return (
    normalizedName.startsWith(normalizedPrefix) || 
    displayName.startsWith(displayPrefix) ||
    hasWordPrefixMatch(normalizedName, rawPrefix) ||
    hasWordPrefixMatch(displayName, rawPrefix) ||
    aliases.some((alias) => {
      const normalizedAlias = normalizeTagName(alias);
      return (
        normalizedAlias.startsWith(normalizedPrefix) ||
        hasWordPrefixMatch(alias, rawPrefix)
      );
    })
  );
}

export function hasWordPrefixMatch(candidate, query) {
  const queryWords = normalizeWords(query);
  if (!queryWords.length) {
    return false;
  } 

  const candidateWords = normalizeWords(candidate);

  return queryWords.every((queryWord) => candidateWords.some((candidateWord) => candidateWord.startsWith(queryWord)));
}

  


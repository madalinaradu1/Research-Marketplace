export const TAGS_CACHE_KEY = 'tags_cache';
export const TAGS_CACHE_VERSION = '2026-02-01';
export const TAGS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export function loadTagCache() {
  try {
    const raw = localStorage.getItem(TAGS_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.tags)) return null;

    return parsed;
  } catch (error) {
    console.warn('Failed to parse tags cache:', error);
    return null;
  }
}

export function saveTagCache(tags, version = TAGS_CACHE_VERSION) {
  try {
    const payload = {
      version,
      cachedAt: Date.now(),
      tags
    };
    localStorage.setItem(TAGS_CACHE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Failed to save tags cache:', error);
  }
}

export function isCacheExpired(cache) {
  if (!cache || !cache.cachedAt) return true;
  return Date.now() - cache.cachedAt > TAGS_CACHE_TTL_MS;
}
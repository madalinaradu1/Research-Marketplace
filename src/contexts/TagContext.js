import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchAllTags } from '../lib/tags/tagApi';
import { isPrefixMatch, normalizeTagName } from '../lib/tags/normalize';
import { isCacheExpired, loadTagCache, saveTagCache } from '../lib/tags/tagCache';

const TagContext = createContext(null);

function buildIndexes(tags) {
  const tagsById = new Map();
  const tagsByNormalizedName = new Map();
  const tagsByNormalizedAlias = new Map();
  
  tags.forEach((tag) => {
    if (!tag?.tag_id) return;
    tagsById.set(tag.tag_id, tag);
    if (tag.normalized_name) tagsByNormalizedName.set(tag.normalized_name, tag);

    (tag.aliases || []).forEach((alias) => {
      const normalizedAlias = normalizeTagName(alias);
      if (!normalizedAlias) return;

      const matches = tagsByNormalizedAlias.get(normalizedAlias) || [];
      matches.push(tag);
      tagsByNormalizedAlias.set(normalizedAlias, matches);
    });
  });

  return { tagsById, tagsByNormalizedName, tagsByNormalizedAlias };

}

export function TagProvider({ children }) {
  const [allActiveTags, setAllActiveTags] = useState([]);
  const [tagsById, setTagsById] = useState(new Map());
  const [tagsByNormalizedName, setTagsByNormalizedName] = useState(new Map());
  const [tagsByNormalizedAlias, setTagsByNormalizedAlias] = useState(new Map());
  const [lastFetchedAt, setLastFetchedAt] = useState(0);
  const [isHydrating, setIsHydrating] = useState(true);
  const [error, setError] = useState(null);

  const applyTags = useCallback((tags, fetchedAt) => {
    const {
      tagsById: idMap,
      tagsByNormalizedName: normalizedMap,
      tagsByNormalizedAlias: aliasMap
    } = buildIndexes(tags);
    setAllActiveTags(tags);
    setTagsById(idMap);
    setTagsByNormalizedName(normalizedMap);
    setTagsByNormalizedAlias(aliasMap);
    setLastFetchedAt(fetchedAt || Date.now());
  }, []);

  const refreshTagsInBackground = useCallback(async () => {
    try {
      const freshTags = await fetchAllTags();
      applyTags(freshTags, Date.now());
      saveTagCache(freshTags);
      setError(null);
    } catch (err) {
      console.warn('Tag refresh failed, using cached tags:', err);
      setError(err);
    }
  }, [applyTags]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const cached = loadTagCache();

      if (cached?.tags?.length) {
        applyTags(cached.tags, cached.cachedAt);
      }

      const shouldRefresh = !cached || !cached.tags?.length || isCacheExpired(cached);

      try {
        if (shouldRefresh) {
          await refreshTagsInBackground();
        } else {
          refreshTagsInBackground();
        }
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [applyTags, refreshTagsInBackground]);

  const searchByPrefix = useCallback((prefix, options = {}) => {
    const { tagTypeFilter, excludeTagIds = [], limit = 20 } = options;
    const excluded = new Set(excludeTagIds);

    if (!prefix || !prefix.trim()) return [];

    return allActiveTags
      .filter((tag) => !excluded.has(tag.tag_id))
      .filter((tag) => !tagTypeFilter || tag.tag_type === tagTypeFilter)
      .filter((tag) => isPrefixMatch(tag, prefix))
      .slice(0, limit);
  }, [allActiveTags]);

  const resolveTagIds = useCallback((values) => {
    if (!Array.isArray(values)) return [];

    const resolved = [];

    values.forEach((value) => {
      if (typeof value !== 'string') return;
      const trimmed = value.trim();
      if (!trimmed) return;

      if (tagsById.has(trimmed)) {
        resolved.push(trimmed);
        return;
      }

      const normalized = normalizeTagName(trimmed);
      const fromName = tagsByNormalizedName.get(normalized);

      if (fromName?.tag_id) {
        resolved.push(fromName.tag_id);
        return;
      }

      const fromAlias = tagsByNormalizedAlias.get(normalized) || [];
      if (fromAlias.length === 1 && fromAlias[0]?.tag_id) {
        resolved.push(fromAlias[0].tag_id);
        return;
      }

      if (fromAlias.length > 1) {
        console.warn(`Ambiguous alias ignored: "${trimmed}"`);
      } else {
        console.warn(`Unknown tag value ignored: "${trimmed}"`);
      }
    });

    return Array.from(new Set(resolved));
  }, [tagsById, tagsByNormalizedName, tagsByNormalizedAlias]);

  const value = useMemo(() => ({
    allActiveTags,
    tagsById,
    tagsByNormalizedName,
    tagsByNormalizedAlias,
    lastFetchedAt,
    isHydrating,
    error,
    searchByPrefix,
    resolveTagIds,
    refreshTagsInBackground
  }), [allActiveTags, tagsById, tagsByNormalizedName, tagsByNormalizedAlias, lastFetchedAt, isHydrating, error, searchByPrefix, resolveTagIds, refreshTagsInBackground]);

  return <TagContext.Provider value={value}>{children}</TagContext.Provider>;
}

export function useTags() {
  const context = useContext(TagContext);
  if (!context) throw new Error('useTags must be used within TagProvider');
  return context;
}

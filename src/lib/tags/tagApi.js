import { API, graphqlOperation } from 'aws-amplify';
import { listTagsByPrefix } from '../../graphql/operations';
import { normalizeTagName } from './normalize';

const MAX_LIMIT = 50;
const PREFIX_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');

function toTag(item) {
  return {
    tag_id: item.tag_id,
    display_name: item.display_name,
    normalized_name: item.normalized_name,
    tag_type: item.tag_type,
    parent_tag_id: item.parent_tag_id ?? null,
    status: item.status
  };
}

function dedupeByTagId(tags) {
  const byId = new Map();
  tags.forEach((tag) => {
    if (tag?.tag_id) byId.set(tag.tag_id, tag);
  });
  return Array.from(byId.values());
}

function activeOnly(tags) {
  return tags.filter((tag) => tag?.status === 'ACTIVE');
}

function sortByDisplayName(tags) {
  return [...tags].sort((a, b) => a.display_name.localeCompare(b.display_name));
}

async function queryPrefixRaw(prefix, limit = MAX_LIMIT) {
  const result = await API.graphql(
    graphqlOperation(listTagsByPrefix, { prefix, limit })
  );
  const items = result?.data?.listTagsByPrefix || [];
  return items.map(toTag);
}

export async function fetchTagsByPrefix(prefix, limit = MAX_LIMIT) {
  const normalizedPrefix = normalizeTagName(prefix);
  const raw = await queryPrefixRaw(normalizedPrefix, limit);
  return sortByDisplayName(activeOnly(dedupeByTagId(raw)));
}

function upsertAll(map, tags) {
  tags.forEach((tag) => {
    if (tag?.tag_id) map.set(tag.tag_id, tag);
  });
}

export async function fetchAllTags() {
  const byId = new Map();

  const root = await queryPrefixRaw('', MAX_LIMIT);
  upsertAll(byId, root);

  if (root.length >= MAX_LIMIT) {
    for (const first of PREFIX_CHARS) {
      const firstBatch = await queryPrefixRaw(first, MAX_LIMIT);
      upsertAll(byId, firstBatch);

      if (firstBatch.length >= MAX_LIMIT) {
        for (const second of PREFIX_CHARS) {
          const secondBatch = await queryPrefixRaw(`${first}${second}`, MAX_LIMIT);
          upsertAll(byId, secondBatch);
        }
      }
    }
  }

  return sortByDisplayName(activeOnly(Array.from(byId.values())));
}

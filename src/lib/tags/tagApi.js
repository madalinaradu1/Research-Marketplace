import { API, graphqlOperation } from 'aws-amplify';
import { normalizeTagName } from './normalize';

const MAX_LIMIT = 50;
const LIST_ALL_LIMIT = 200;
const PREFIX_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');

const TAG_SELECTION_SET = `
  tag_id
  display_name
  normalized_name
  parent_tag_id
  tag_type
  aliases
  description
  status
`;

const LIST_TAGS_BY_PREFIX = /* GraphQL */ `
  query ListTagsByPrefix($prefix: String!, $limit: Int) {
    listTagsByPrefix(prefix: $prefix, limit: $limit) {
${TAG_SELECTION_SET}
    }
  }
`;

const LIST_ALL_TAGS = /* GraphQL */ `
  query ListAllTags($limit: Int, $nextToken: String) {
    listAllTags(limit: $limit, nextToken: $nextToken) {
      items {
${TAG_SELECTION_SET}
      }
      nextToken
    }
  }
`;

function toTag(item) {
  return {
    tag_id: item.tag_id,
    display_name: item.display_name,
    normalized_name: item.normalized_name,
    parent_tag_id: item.parent_tag_id ?? null,
    tag_type: item.tag_type,
    aliases: Array.isArray(item.aliases) ? item.aliases : [],
    description: item.description ?? null,
    hierarchy_path: Array.isArray(item.hierarchy_path) ? item.hierarchy_path : [],
    status: item.status ?? 'INACTIVE'
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
  const variables = { prefix, limit };
  const result = await API.graphql(
    graphqlOperation(LIST_TAGS_BY_PREFIX, variables)
  );
  const items = result?.data?.listTagsByPrefix || [];
  return items.map(toTag);
}

async function queryAllTagsPage(nextToken, limit = LIST_ALL_LIMIT) {
  const variables = { limit };
  if (nextToken) variables.nextToken = nextToken;

  const result = await API.graphql(
    graphqlOperation(LIST_ALL_TAGS, variables)
  );

  const connection = result?.data?.listAllTags;
  if (!connection || !Array.isArray(connection.items)) {
    throw new Error('Invalid listAllTags response');
  }

  return {
    items: connection.items.map(toTag),
    nextToken: connection.nextToken ?? null
  };
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
  try {
    const all = [];
    let nextToken = null;

    do {
      const page = await queryAllTagsPage(nextToken, LIST_ALL_LIMIT);
      all.push(...page.items);
      nextToken = page.nextToken;
    } while (nextToken);

    return sortByDisplayName(activeOnly(dedupeByTagId(all)));
  } catch (error) {
    console.warn('listAllTags failed, falling back to prefix fetch:', error);
  }

  return fetchAllTagsByPrefix();
}

async function fetchAllTagsByPrefix() {
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

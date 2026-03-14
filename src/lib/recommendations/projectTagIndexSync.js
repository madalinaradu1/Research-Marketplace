import { API, graphqlOperation } from 'aws-amplify';
import {
  putProjectTagIndexMapping,
  deleteProjectTagIndexMapping
} from '../../graphql/projectTagIndex-operations';

function mapTypes(requiredTagIds = [], optionalTagIds = []) {
  const tagTypes = new Map();
  optionalTagIds.forEach((tagId) => tagId && tagTypes.set(tagId, 'OPTIONAL'));
  requiredTagIds.forEach((tagId) => tagId && tagTypes.set(tagId, 'REQUIRED'));
  return tagTypes;
}

function buildKeys(projectId, tagId) {
  return {
    PK: `TAG#${tagId}`,
    SK: `PROJECT#${projectId}`
  };
}

export async function syncProjectTagIndex({
  projectId,
  oldRequiredTagIds = [],
  oldOptionalTagIds = [],
  newRequiredTagIds = [],
  newOptionalTagIds = []
}) {
  const oldMap = mapTypes(oldRequiredTagIds, oldOptionalTagIds);
  const newMap = mapTypes(newRequiredTagIds, newOptionalTagIds);

  const removed = [...oldMap.keys()].filter((tagId) => !newMap.has(tagId));
  const added = [...newMap.entries()].filter(([tagId]) => !oldMap.has(tagId));
  const changed = [...newMap.entries()].filter(([tagId, tagType]) => oldMap.has(tagId) && oldMap.get(tagId) !== tagType);

  const errors = [];

  for (const tagId of removed) {
    try {
      await API.graphql(
        graphqlOperation(deleteProjectTagIndexMapping, {
          input: buildKeys(projectId, tagId)
        })
      );
    } catch (error) {
      errors.push({ op: 'delete', projectId, tagId, error: error.message || String(error) });
    }
  }

  for (const [tagId, tagType] of [...added, ...changed]) {
    try {
      await API.graphql(
        graphqlOperation(putProjectTagIndexMapping, {
          input: {
            ...buildKeys(projectId, tagId),
            projectId,
            tagId,
            tagType
          }
        })
      );
    } catch (error) {
      errors.push({ op: oldMap.has(tagId) ? 'update' : 'create', projectId, tagId, error: error.message || String(error) });
    }
  }

  if (errors.length) {
    throw new Error(`ProjectTagIndex sync failed: ${JSON.stringify(errors)}`);
  }
}

export async function removeProjectTagIndexMappings({
  projectId,
  requiredTagIds = [],
  optionalTagIds = []
}) {
  const allTagIds = [...new Set([...(requiredTagIds || []), ...(optionalTagIds || [])])];
  const errors = [];

  for (const tagId of allTagIds) {
    try {
      await API.graphql(
        graphqlOperation(deleteProjectTagIndexMapping, {
          input: buildKeys(projectId, tagId)
        })
      );
    } catch (error) {
      errors.push({ op: 'delete', projectId, tagId, error: error.message || String(error) });
    }
  }

  if (errors.length) {
    throw new Error(`ProjectTagIndex delete failed: ${JSON.stringify(errors)}`);
  }
}

import { API, graphqlOperation } from 'aws-amplify';
import {  createProjectTagIndex, updateProjectTagIndex, deleteProjectTagIndex } from '../../graphql/operations';

const makeId = (projectId, tagId) => `${projectId}#${tagId}`;

function mapTypes(requiredTagIds = [], optionalTagIds = []) {
    const m = new Map();
    optionalTagIds.forEach((id) => id && m.set(id, 'OPTIONAL'));
    requiredTagIds.forEach((id) => id && m.set(id, 'REQUIRED'));
    return m;
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

  const removed = [...oldMap.keys()].filter((k) => !newMap.has(k));
  const added = [...newMap.entries()].filter((k) => !oldMap.has(k));
  const changed = [...newMap.entries()].filter(([k, t]) => oldMap.has(k) && oldMap.get(k) !== t);

  const errors = [];

  for (const tagId of removed) {
    try {
      await API.graphql(graphqlOperation(deleteProjectTagIndex, {input: { id: makeId(projectId, tagId)} }));
    } catch (e) {
      errors.push({ op: 'delete', projectId, tagId, error: e.message || String(e) });
    }
  }

  for (const [tagId, tagType] of added) {
    const input = {
      id: makeId(projectId, tagId),
      PK: `TAG#${tagId}`,
      SK: `PROJECT#${projectId}`,
      projectId, 
      tagId,
      tagType
    };
    try {
      await API.graphql(graphqlOperation(createProjectTagIndex, {input: { input } }));
    } catch (e) {
      errors.push({ op: 'create', projectId, tagId, error: e.message || String(e) });
    }
  }

  for (const [tagId, tagType] of changed) {
    try {
      await API.graphql(graphqlOperation(updateProjectTagIndex, { input: { id: makeId(projectId, tagId), tagType } }));
    } catch (e) {
      errors.push({ op: 'update', projectId, tagId, error: e.message || String(e) });
    }
  }

  if (errors.length) throw new Error(`ProjectTagIndex sync failed: ${JSON.stringify(errors)}`);
}

export async function removeProjectTagIndexMappings({ projectId, requiredTagIds = [], optionalTagIds = []}) {
  const allTagIds = Array.from(new Set([...(requiredTagIds || []), ...(optionalTagIds || [])]));
  const errors = [];

  for (const tagId of allTagIds) {
    try {
      await API.graphql(graphqlOperation(deleteProjectTagIndex, {input: { id: makeId(projectId, tagId)} }));
    } catch (e) {
      errors.push({ projectId, tagId, error: e.message || String(e) });
    }
  }

  if (errors.length) throw new Error(`ProjectTagIndex delete failed: ${JSON.stringify(errors)}`);
}
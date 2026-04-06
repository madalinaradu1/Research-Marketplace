import { CANONICAL_TAGS } from './tagsData.js';

export function loadAdditionalTagDefinitions() {
  return [];
}

export function loadAllTagDefinitions() {
  return [...CANONICAL_TAGS];
}

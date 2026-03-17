import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import {
  buildHierarchyPath,
  buildWordIndexItems,
  generateTagId,
  normalizeTagName,
  validateHierarchy
} from '../amplify/backend/function/researchmarketplace2a916c6aPostConfirmation/src/lib/tags/tagUtils.js';
import { loadAllTagDefinitions } from './seed-data/loadTagDefinitions.js';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-west-2' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = `Tags-${process.env.ENV || 'devtwo'}`;
const TAG_DEFINITIONS = loadAllTagDefinitions();

async function batchWrite(items) {
  for (const item of items) {
    try {
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      }));
    } catch (error) {
      console.log(`Skipping duplicate: ${item.SK}`);
    }
  }
  console.log(`Wrote ${items.length} items`);
}

async function seedTags() {
  console.log(`Seeding tags to table: ${TABLE_NAME}`);
  
  const allItems = [];
  const processedTags = [];

  // First pass: create canonical tags
  for (const tagDef of TAG_DEFINITIONS) {
    const tagId = generateTagId(tagDef.display_name, tagDef.tag_type);
    const normalizedName = normalizeTagName(tagDef.display_name);
    const timestamp = new Date().toISOString();

    const canonicalTag = {
      PK: 'TAG',
      SK: `TAG#${tagId}`,
      GSI1PK: 'TAG_NAME',
      GSI1SK: normalizedName,
      tag_id: tagId,
      display_name: tagDef.display_name,
      normalized_name: normalizedName,
      tag_type: tagDef.tag_type,
      parent_tag_id: tagDef.parent_tag_id,
      status: 'ACTIVE',
      aliases: tagDef.aliases || [],
      description: tagDef.description || null,
      hierarchy_path: null, // Will be set in second pass
      created_at: timestamp,
      created_by_role: 'ADMIN',
      created_by_id: 'system'
    };

    allItems.push(canonicalTag);
    processedTags.push(canonicalTag);
  }

  // Second pass: validate hierarchy and build paths
  for (const tag of processedTags) {
    if (tag.parent_tag_id) {
      validateHierarchy(tag.tag_id, tag.parent_tag_id, processedTags);
    }
    tag.hierarchy_path = buildHierarchyPath(tag.tag_id, processedTags);
  }

  // Third pass: create word-search items, aliases, and edges
  for (const tag of processedTags) {
    allItems.push(...buildWordIndexItems(tag));
  }

  for (const tagDef of TAG_DEFINITIONS) {
    const tagId = generateTagId(tagDef.display_name, tagDef.tag_type);

    // Create alias items
    if (tagDef.aliases) {
      for (const alias of tagDef.aliases) {
        const aliasNormalized = normalizeTagName(alias);
        allItems.push({
          PK: 'TAG',
          SK: `ALIAS#${aliasNormalized}`,
          alias: alias,
          alias_normalized: aliasNormalized,
          tag_id: tagId,
          status: 'ACTIVE'
        });
      }
    }

    // Create parent-child edge
    if (tagDef.parent_tag_id) {
      allItems.push({
        PK: 'TAG',
        SK: `PARENT#${tagDef.parent_tag_id}#CHILD#${tagId}`,
        GSI2PK: `PARENT#${tagDef.parent_tag_id}`,
        GSI2SK: `TAG#${tagId}`,
        parent_tag_id: tagDef.parent_tag_id,
        child_tag_id: tagId,
        status: 'ACTIVE'
      });
    }
  }

  console.log(`Total items to write: ${allItems.length}`);
  await batchWrite(allItems);
  console.log('Seeding complete!');
}

seedTags().catch(console.error);

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import {
  buildWordIndexItems,
  generateTagId,
  normalizeTagName
} from '../amplify/backend/function/researchmarketplace2a916c6aPostConfirmation/src/lib/tags/tagUtils.js';
import { loadAllTagDefinitions } from './seed-data/loadTagDefinitions.js';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-west-2' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = `Tags-${process.env.ENV || 'devtwo'}`;
const TAG_DEFINITIONS = loadAllTagDefinitions();

async function seedTestTags() {
  console.log(`Seeding test tags to table: ${TABLE_NAME}`);

  const testTags = TAG_DEFINITIONS.slice(0, 2);

  for (const tagDef of testTags) {
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
      hierarchy_path: [normalizedName],
      created_at: timestamp,
      created_by_role: 'ADMIN',
      created_by_id: 'system'
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: canonicalTag
    }));
    console.log(`Added tag: ${tagDef.display_name}`);

    for (const wordItem of buildWordIndexItems(canonicalTag)) {
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: wordItem
      }));
      console.log(`  Added word index: ${wordItem.GSI1SK}`);
    }

    for (const alias of tagDef.aliases || []) {
      const aliasNormalized = normalizeTagName(alias);
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: 'TAG',
          SK: `ALIAS#${aliasNormalized}`,
          alias,
          alias_normalized: aliasNormalized,
          tag_id: tagId,
          status: 'ACTIVE'
        }
      }));
      console.log(`  Added alias: ${alias}`);
    }
  }

  console.log('\nTest seeding complete!');
  console.log(`Added ${testTags.length} tags with their aliases and word indexes`);
}

seedTestTags().catch(console.error);

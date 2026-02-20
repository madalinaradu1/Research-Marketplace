import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { CANONICAL_TAGS } from './seed-data/tagsData.js';
import { generateTagId, normalizeTagName } from '../amplify/backend/function/researchmarketplace2a916c6aPostConfirmation/src/lib/tags/tagUtils.js';

const client = new DynamoDBClient({region: process.env.AWS_REGION || 'us-west-2'});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = `Tags-${process.env.ENV || 'dev'}`;

async function seedTestTags() {
  console.log(`Seeding test tags to table: ${TABLE_NAME}`);
  
  // Take only first 2 tags
  const testTags = CANONICAL_TAGS.slice(0, 2);
  
  for (const tagDef of testTags) {
    const tagId = generateTagId(tagDef.display_name, tagDef.tag_type);
    const normalizedName = normalizeTagName(tagDef.display_name);
    const timestamp = new Date().toISOString();

    // Create canonical tag
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
    console.log(`✓ Added tag: ${tagDef.display_name}`);

    // Create aliases
    if (tagDef.aliases && tagDef.aliases.length > 0) {
      for (const alias of tagDef.aliases) {
        const aliasNormalized = normalizeTagName(alias);
        await docClient.send(new PutCommand({
          TableName: TABLE_NAME,
          Item: {
            PK: 'TAG',
            SK: `ALIAS#${aliasNormalized}`,
            alias: alias,
            alias_normalized: aliasNormalized,
            tag_id: tagId,
            status: 'ACTIVE'
          }
        }));
        console.log(`  ✓ Added alias: ${alias}`);
      }
    }
  }

  console.log('\nTest seeding complete!');
  console.log(`Added ${testTags.length} tags with their aliases`);
}

seedTestTags().catch(console.error);


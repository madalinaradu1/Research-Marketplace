import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { TAG_RELATIONS } from './seed-data/tagRelationsData.js';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-west-2' });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = `TagRelations-${process.env.ENV || 'devtwo'}`;

function buildItem(sourceTagId, targetTagId, edgeWeight, note, timestamp) {
  return {
    PK: `TAG#${sourceTagId}`,
    SK: `REL#${targetTagId}`,
    sourceTagId,
    targetTagId,
    relationType: 'RELATED_TO',
    edgeWeight,
    isActive: true,
    note: note || null,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

async function seedTagRelations() {
  console.log(`Seeding tag relations to table: ${TABLE_NAME}`);

  const timestamp = new Date().toISOString();
  const deduped = new Map();

  for (const relation of TAG_RELATIONS) {
    const forward = buildItem(
      relation.sourceTagId,
      relation.targetTagId,
      relation.edgeWeight,
      relation.note,
      timestamp
    );
    deduped.set(`${forward.PK}|${forward.SK}`, forward);

    if (relation.bidirectional) {
      const reverse = buildItem(
        relation.targetTagId,
        relation.sourceTagId,
        relation.edgeWeight,
        relation.note,
        timestamp
      );
      deduped.set(`${reverse.PK}|${reverse.SK}`, reverse);
    }
  }

  for (const item of deduped.values()) {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item
      })
    );
  }

  console.log(`Wrote ${deduped.size} relation items`);
}

seedTagRelations().catch((error) => {
  console.error(error);
  process.exit(1);
});

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';  
import { DynamoDBDocumentClient, GetCommand, QueryCommand, BatchGetCommand } from '@aws-sdk/lib-dynamodb';  
import { normalizeTagName } from './tagUtils.js';
import { fromIni } from '@aws-sdk/credential-provider-ini';

const client = new DynamoDBClient({
  region:'us-west-2',
  credentials: fromIni({ profile: process.env.AWS_PROFILE || 'default'})
  });
const docClient = DynamoDBDocumentClient.from(client);  

const TABLE_NAME = `Tags-${'dev'}`; 

export class TagRepository {

   // Get tag by ID
  async getTagById(tagId) {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: 'TAG',
        SK: `TAG#${tagId}`
      }
    };

    const result = await docClient.send(new GetCommand(params));
    
    if (!result.Item || result.Item.status !== 'ACTIVE') {
      return null;
    }

    return result.Item;
  }

  //Autocomeplete tags by prefix
  async autocompleteTags(prefix, tagType = null, limit=10) {
    const normalizedPrefix = normalizeTagName(prefix);

    const params = {
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :gsi1pk AND begins_with(GSI1SK, :prefix)',
        ExpressionAttributeValues: {
          ':gsi1pk': 'TAG_NAME',
          ':prefix': normalizedPrefix,
          ':status': 'ACTIVE'
      },  
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      Limit: limit
    };

    if (tagType) {
        params.FilterExpression += ' AND tagType = :tagType';
        params.ExpressionAttributeValues[':tagType'] = tagType;
    }

    const result = await docClient.send(new QueryCommand(params));
    return  result.Items || [];
  }

  //  Get children of a parent tag
  async getChildren(parentTagId) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `PARENT#${parentTagId}`
      }
    };

    const result = await docClient.send(new QueryCommand(params));
    const edges = result.Items || [];

    if (edges.length === 0) {
        return [];
    }

    // Extract child tag IDs
    const childIds = edges.map(edge => edge.child_tag_id);

    // Batch get canonical tags
    const keys = childIds.map(id => ({
      PK: 'TAG',
      SK: `TAG#${id}`
    }));

    const batchParams = {
      RequestItems: {
        [TABLE_NAME]: {
          Keys: keys
        }
      }
    };

    const batchResult = await docClient.send(new BatchGetCommand(batchParams));
    const tags = batchResult.Responses[TABLE_NAME] || [];

    return tags.filter(tag => tag.status === 'ACTIVE');
  }

  // Resolve alias to canonical tag
  async resolveAlias(alias) {
    const normalizedAlias = normalizeTagName(alias);
    
    const params = {
      TableName: TABLE_NAME,
      Key: {
        PK: 'TAG',
        SK: `ALIAS#${normalizedAlias}`
      }
    };

    const result = await docClient.send(new GetCommand(params));
    
    if (!result.Item || result.Item.status !== 'ACTIVE') {
      return null;
    }

    // Get the canonical tag
    return await this.getTagById(result.Item.tag_id);
  }
}

export default new TagRepository();

    
  

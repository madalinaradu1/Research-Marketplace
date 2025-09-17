const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const now = new Date().toISOString();
    
    // Find users scheduled for cleanup
    const params = {
      TableName: process.env.DELETEDUSER_TABLE,
      FilterExpression: 'scheduledCleanupAt <= :now AND (#status = :status OR #status = :testStatus),
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':now': now,
        ':status': 'SCHEDULED',
        ':testStatus': 'TEST_SCHEDULED'
      }
    };
    
    const result = await dynamodb.scan(params).promise();
    
    for (const deletedUser of result.Items) {
      await performCascadeDelete(deletedUser.originalUserID);
      
      // Mark as completed
      await dynamodb.update({
        TableName: process.env.DELETEDUSER_TABLE,
        Key: { id: deletedUser.id },
        UpdateExpression: 'SET #status = :status, completedAt = :completedAt',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':status': 'COMPLETED',
          ':completedAt': now
        }
      }).promise();
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Processed ${result.Items.length} users for cleanup`,
        processedUsers: result.Items.length
      })
    };
  } catch (error) {
    console.error('Error in cleanup function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

async function performCascadeDelete(originalUserID) {
  const tables = [
    { name: process.env.MESSAGE_TABLE, userFields: ['senderID', 'receiverID'] },
    { name: process.env.APPLICATION_TABLE, userFields: ['studentID'] },
    { name: process.env.PROJECT_TABLE, userFields: ['facultyID'] },
    { name: process.env.STUDENTPOST_TABLE, userFields: ['authorID'] },
    { name: process.env.NOTIFICATION_TABLE, userFields: ['userID'] }
  ];
  
  for (const table of tables) {
    for (const field of table.userFields) {
      const params = {
        TableName: table.name,
        FilterExpression: `${field} = :userId`,
        ExpressionAttributeValues: {
          ':userId': originalUserID
        }
      };
      
      const result = await dynamodb.scan(params).promise();
      
      for (const item of result.Items) {
        await dynamodb.delete({
          TableName: table.name,
          Key: { id: item.id }
        }).promise();
      }
    }
  }
}
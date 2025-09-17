const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    console.log('Starting cleanup of deleted users...');
    
    try {
        // Get all DeletedUser records
        const deletedUsersResult = await dynamodb.send(new ScanCommand({
            TableName: process.env.API_RESEARCHMARKETPLACE_DELETEDUSERTABLE_NAME
        }));
        
        const deletedUsers = deletedUsersResult.Items || [];
        console.log(`Found ${deletedUsers.length} deleted user records`);
        
        const now = new Date();
        let processedCount = 0;
        
        for (const deletedUser of deletedUsers) {
            // Skip if already processed
            if (deletedUser.deletionExecutedAt) {
                continue;
            }
            
            const scheduledAt = new Date(deletedUser.deletionScheduledAt);
            const daysSinceScheduled = (now - scheduledAt) / (1000 * 60 * 60 * 24);
            const threshold = deletedUser.isTestMode ? 1 : 90;
            
            if (daysSinceScheduled >= threshold) {
                console.log(`Processing cascade deletion for user ${deletedUser.originalUserID}`);
                
                // Delete related data
                await cascadeDeleteUserData(deletedUser.originalUserID);
                
                // Mark as executed
                await dynamodb.send(new UpdateCommand({
                    TableName: process.env.API_RESEARCHMARKETPLACE_DELETEDUSERTABLE_NAME,
                    Key: { id: deletedUser.id },
                    UpdateExpression: 'SET deletionExecutedAt = :now',
                    ExpressionAttributeValues: {
                        ':now': now.toISOString()
                    }
                }));
                
                processedCount++;
                console.log(`Completed cascade deletion for user ${deletedUser.originalUserID}`);
            }
        }
        
        console.log(`Processed ${processedCount} user deletions`);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Processed ${processedCount} user deletions`,
                processedCount
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

async function cascadeDeleteUserData(userID) {
    const tables = [
        { name: process.env.API_RESEARCHMARKETPLACE_APPLICATIONTABLE_NAME, key: 'studentID' },
        { name: process.env.API_RESEARCHMARKETPLACE_PROJECTTABLE_NAME, key: 'facultyID' },
        { name: process.env.API_RESEARCHMARKETPLACE_MESSAGETABLE_NAME, key: 'senderID' },
        { name: process.env.API_RESEARCHMARKETPLACE_MESSAGETABLE_NAME, key: 'receiverID' },
        { name: process.env.API_RESEARCHMARKETPLACE_NOTIFICATIONTABLE_NAME, key: 'userID' },
        { name: process.env.API_RESEARCHMARKETPLACE_ACTIVITYLOGTABLE_NAME, key: 'userID' },
        { name: process.env.API_RESEARCHMARKETPLACE_MESSAGEBOARDTABLE_NAME, key: 'facultyID' },
        { name: process.env.API_RESEARCHMARKETPLACE_STUDENTPOSTTABLE_NAME, key: 'studentID' }
    ];
    
    for (const table of tables) {
        try {
            const result = await dynamodb.send(new ScanCommand({
                TableName: table.name,
                FilterExpression: `${table.key} = :userID`,
                ExpressionAttributeValues: {
                    ':userID': userID
                }
            }));
            
            for (const item of result.Items || []) {
                await dynamodb.send(new DeleteCommand({
                    TableName: table.name,
                    Key: { id: item.id }
                }));
            }
            
            console.log(`Deleted ${result.Items?.length || 0} items from ${table.name}`);
        } catch (error) {
            console.error(`Error deleting from ${table.name}:`, error);
        }
    }
}
const { DynamoDBClient, ScanCommand, DeleteCommand } = require('@aws-sdk/client-dynamodb');
const { S3Client, ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const s3Client = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
    console.log('Starting scheduled cleanup process...');
    
    try {
        const now = new Date();
        const results = {
            processedUsers: 0,
            deletedRecords: 0,
            deletedFiles: 0,
            errors: []
        };

        // Get all DeletedUser records that are ready for cleanup
        const scanParams = {
            TableName: `DeletedUser-${process.env.ENV}`,
            FilterExpression: 'scheduledCleanupAt <= :now AND #status = :status',
            ExpressionAttributeNames: {
                '#status': 'status'
            },
            ExpressionAttributeValues: {
                ':now': { S: now.toISOString() },
                ':status': { S: 'SCHEDULED' }
            }
        };

        const scanResult = await dynamoClient.send(new ScanCommand(scanParams));
        
        for (const item of scanResult.Items || []) {
            const deletedUser = unmarshall(item);
            results.processedUsers++;
            
            try {
                // Parse user data to get file keys
                const userData = JSON.parse(deletedUser.userData);
                
                // Delete S3 files associated with the user
                await deleteUserFiles(userData.id, results);
                
                // Perform cascade deletion of remaining data
                await performCascadeDelete(userData.id, results);
                
                // Mark cleanup as completed
                await dynamoClient.send(new DeleteCommand({
                    TableName: `DeletedUser-${process.env.ENV}`,
                    Key: { id: { S: deletedUser.id } }
                }));
                
                results.deletedRecords++;
                console.log(`Completed cleanup for user: ${userData.id}`);
                
            } catch (error) {
                console.error(`Error cleaning up user ${deletedUser.originalUserID}:`, error);
                results.errors.push({
                    userId: deletedUser.originalUserID,
                    error: error.message
                });
            }
        }
        
        console.log('Cleanup process completed:', results);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                results
            })
        };
        
    } catch (error) {
        console.error('Cleanup process failed:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};

async function deleteUserFiles(userId, results) {
    try {
        const bucketName = process.env.STORAGE_BUCKET_NAME;
        
        // List all objects with the user's ID prefix
        const listParams = {
            Bucket: bucketName,
            Prefix: `public/${userId}/`
        };
        
        const listResult = await s3Client.send(new ListObjectsV2Command(listParams));
        
        if (listResult.Contents && listResult.Contents.length > 0) {
            // Delete all user files
            const deleteParams = {
                Bucket: bucketName,
                Delete: {
                    Objects: listResult.Contents.map(obj => ({ Key: obj.Key }))
                }
            };
            
            await s3Client.send(new DeleteObjectsCommand(deleteParams));
            results.deletedFiles += listResult.Contents.length;
            console.log(`Deleted ${listResult.Contents.length} files for user ${userId}`);
        }
        
    } catch (error) {
        console.error(`Error deleting files for user ${userId}:`, error);
        results.errors.push({
            userId,
            type: 'file_deletion',
            error: error.message
        });
    }
}

async function performCascadeDelete(userId, results) {
    const tables = [
        'Message',
        'Application', 
        'Project',
        'StudentPost',
        'Notification'
    ];
    
    for (const table of tables) {
        try {
            const tableName = `${table}-${process.env.ENV}`;
            
            // Scan for records belonging to the user
            const scanParams = {
                TableName: tableName
            };
            
            // Add appropriate filter based on table
            if (table === 'Message') {
                scanParams.FilterExpression = 'senderID = :userId OR receiverID = :userId';
                scanParams.ExpressionAttributeValues = {
                    ':userId': { S: userId }
                };
            } else if (table === 'Application') {
                scanParams.FilterExpression = 'studentID = :userId';
                scanParams.ExpressionAttributeValues = {
                    ':userId': { S: userId }
                };
            } else if (table === 'Project') {
                scanParams.FilterExpression = 'facultyID = :userId';
                scanParams.ExpressionAttributeValues = {
                    ':userId': { S: userId }
                };
            } else if (table === 'StudentPost') {
                scanParams.FilterExpression = 'authorID = :userId';
                scanParams.ExpressionAttributeValues = {
                    ':userId': { S: userId }
                };
            } else if (table === 'Notification') {
                scanParams.FilterExpression = 'userID = :userId';
                scanParams.ExpressionAttributeValues = {
                    ':userId': { S: userId }
                };
            }
            
            const scanResult = await dynamoClient.send(new ScanCommand(scanParams));
            
            // Delete each record
            for (const item of scanResult.Items || []) {
                await dynamoClient.send(new DeleteCommand({
                    TableName: tableName,
                    Key: { id: item.id }
                }));
            }
            
            console.log(`Deleted ${scanResult.Items?.length || 0} records from ${table} for user ${userId}`);
            
        } catch (error) {
            console.error(`Error deleting from ${table} for user ${userId}:`, error);
            results.errors.push({
                userId,
                table,
                error: error.message
            });
        }
    }
}
const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'us-east-1' }); // Change to your AWS region

exports.handler = async (event) => {
    try {
        const { to, subject, htmlBody, textBody, from } = JSON.parse(event.body);
        
        const params = {
            Destination: {
                ToAddresses: [to]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: htmlBody
                    },
                    Text: {
                        Charset: "UTF-8", 
                        Data: textBody
                    }
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: subject
                }
            },
            Source: from
        };
        
        const result = await ses.sendEmail(params).promise();
        
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({
                success: true,
                messageId: result.MessageId
            })
        };
        
    } catch (error) {
        console.error('Error sending email:', error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*"
            },
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};
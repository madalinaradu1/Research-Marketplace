const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const sesClient = new SESClient({ region: "us-east-1" });

exports.handler = async (event) => {
    try {
        console.log('Received event:', JSON.stringify(event, null, 2));
        
        // Handle both direct invocation and API Gateway
        let requestData;
        if (event.body) {
            requestData = JSON.parse(event.body);
        } else {
            requestData = event; // Direct invocation
        }
        
        const { to, subject, htmlBody, textBody, from } = requestData;
        
        console.log('Email data:', { to, subject, from });
        
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
        
        const command = new SendEmailCommand(params);
        const result = await sesClient.send(command);
        
        console.log('Email sent successfully:', result.MessageId);
        
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
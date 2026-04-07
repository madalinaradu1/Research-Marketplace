import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const sesClient = new SESClient({ region: 'us-west-2' });
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'us-west-2' }));

const STATUS_DESCRIPTIONS = {
  'Coordinator Review': 'Your application has been submitted and is currently being reviewed by the UROP Coordinator for approval.',
  'Faculty Review': 'Your application has been approved by the Coordinator and is now available for the faculty member to review and select students for their research project.',
  'Approved': 'Congratulations! You have been selected by the faculty member for this research opportunity. The faculty member will contact you to begin the project.',
  'Returned': 'Your application has been returned and requires additional information or corrections before it can be approved.',
  'Rejected': 'Your application was not approved for this research opportunity.',
  'Cancelled': 'Your application has been cancelled.',
  'Expired': 'Your application expired because it did not reach a final status by the deadline.'
};

const SUB_REASON_DESCRIPTIONS = {
  'Missing Information': 'Your application is missing required information. Please review the coordinator\'s notes and provide the requested details.',
  'Incomplete Documentation': 'Additional documents or clarifications are needed to complete your application.',
  'Does not meet requirements': 'Your application does not meet the minimum requirements for this research project.',
  'Project capacity reached': 'The research project has reached its maximum number of participants.',
  'Application received late': 'Your application was received after the deadline.',
  'Cancelled by Student': 'You cancelled your application.',
  'Project Cancelled': 'The research project was cancelled by the faculty member.'
};

const VERIFIED_EMAILS = ['madalina.radu1@gcu.edu', 'dlemus4@my.gcu.edu', 'ldycus@my.gcu.edu', 'OFusco@my.gcu.edu', 'bberger7@my.gcu.edu', 'ABrajovic@my.gcu.edu'];

async function getStudentAndProject(studentID, projectID) {
  try {
    const [studentResult, projectResult] = await Promise.all([
      dynamoClient.send(new GetCommand({ TableName: `User-${process.env.ENV || 'dev'}`, Key: { id: studentID } })),
      dynamoClient.send(new GetCommand({ TableName: `Project-${process.env.ENV || 'dev'}`, Key: { id: projectID } }))
    ]);
    return { student: studentResult.Item, project: projectResult.Item };
  } catch (error) {
    console.error('Error fetching student/project:', error);
    return { student: null, project: null };
  }
}

async function sendEmail(to, subject, htmlBody, textBody) {
  const isVerified = VERIFIED_EMAILS.includes(to);
  const recipientEmail = isVerified ? to : 'madalina.radu1@gcu.edu';
  
  await sesClient.send(new SendEmailCommand({
    Source: 'madalina.radu1@gcu.edu',
    Destination: { ToAddresses: [recipientEmail] },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: {
        Html: { Data: htmlBody, Charset: 'UTF-8' },
        Text: { Data: textBody, Charset: 'UTF-8' }
      }
    }
  }));
}

export const handler = async (event) => {
  console.log('DynamoDB Stream event:', JSON.stringify(event, null, 2));
  
  for (const record of event.Records) {
    if (record.eventName === 'INSERT') {
      const newApp = unmarshall(record.dynamodb.NewImage);
      const { student, project } = await getStudentAndProject(newApp.studentID, newApp.projectID);
      
      if (student && project) {
        const isVerified = VERIFIED_EMAILS.includes(student.email);
        const htmlBody = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">${!isVerified ? '<p style="background-color: #fff3cd; padding: 10px; border-radius: 4px;"><strong>Note:</strong> This email was intended for ' + student.email + ' but sent to your verified address for testing.</p>' : ''}<h2 style="color: #552b9a;">Application Submitted Successfully</h2><p>Dear ${student.name},</p><p>Thank you for submitting your application for the research opportunity:</p><div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;"><p><strong>Project:</strong> ${project.title}</p><p><strong>Application ID:</strong> ${newApp.id}</p><p><strong>Status:</strong> ${newApp.status}</p></div><div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="margin: 0;"><strong>What's Next?</strong></p><p style="margin: 10px 0 0 0;">${STATUS_DESCRIPTIONS[newApp.status] || 'Your application is being processed.'}</p></div><div style="margin-top: 20px; padding: 15px; background-color: #f0f8f0; border-radius: 8px;"><p style="margin: 0; font-size: 14px;"><a href="https://master.d33ubw0r59z0k8.amplifyapp.com/?from=email" style="color: #552b9a; text-decoration: none;">View your application status in the Research Marketplace</a></p></div><p style="margin-top: 20px;">Best regards,<br>GCU Research Team</p></div>`;
        const textBody = `Application Submitted Successfully\n\nDear ${student.name},\n\nThank you for submitting your application for: ${project.title}\nApplication ID: ${newApp.id}\nStatus: ${newApp.status}\n\nWhat's Next?\n${STATUS_DESCRIPTIONS[newApp.status] || 'Your application is being processed.'}\n\nView at: https://master.d33ubw0r59z0k8.amplifyapp.com/?from=email\n\nBest regards,\nGCU Research Team`;
        
        await sendEmail(student.email, 'Application Submitted Successfully', htmlBody, textBody);
      }
    } else if (record.eventName === 'MODIFY') {
      const oldApp = unmarshall(record.dynamodb.OldImage);
      const newApp = unmarshall(record.dynamodb.NewImage);
      
      if (oldApp.status !== newApp.status) {
        const { student, project } = await getStudentAndProject(newApp.studentID, newApp.projectID);
        
        if (student && project) {
          const statusDescription = STATUS_DESCRIPTIONS[newApp.status] || '';
          const subReasonDescription = newApp.statusDetail ? SUB_REASON_DESCRIPTIONS[newApp.statusDetail] || newApp.statusDetail : '';
          const notes = newApp.coordinatorNotes || newApp.facultyNotes || '';
          const statusColor = newApp.status === 'Approved' ? '#48bb78' : newApp.status === 'Rejected' ? '#f56565' : newApp.status === 'Returned' ? '#ed8936' : newApp.status === 'Cancelled' ? '#718096' : newApp.status === 'Expired' ? '#a0aec0' : '#552b9a';
          const isVerified = VERIFIED_EMAILS.includes(student.email);
          
          const htmlBody = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">${!isVerified ? '<p style="background-color: #fff3cd; padding: 10px; border-radius: 4px;"><strong>Note:</strong> This email was intended for ' + student.email + ' but sent to your verified address for testing.</p>' : ''}<h2 style="color: #552b9a;">Application Status Update</h2><p>Dear ${student.name},</p><p>Your application status has been updated:</p><div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;"><p><strong>Project:</strong> ${project.title}</p><p><strong>Application ID:</strong> ${newApp.id}</p><p><strong>New Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${newApp.status}</span></p></div><div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="margin: 0; font-weight: bold;">Status Description:</p><p style="margin: 10px 0 0 0;">${statusDescription}</p>${subReasonDescription ? `<p style="margin: 10px 0 0 0; padding-top: 10px; border-top: 1px solid #bee3f8;"><strong>Reason:</strong> ${subReasonDescription}</p>` : ''}</div>${notes ? `<div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="margin: 0; font-weight: bold;">Additional Notes:</p><p style="margin: 10px 0 0 0; white-space: pre-wrap;">${notes}</p></div>` : ''}<div style="margin-top: 20px; padding: 15px; background-color: #f0f8f0; border-radius: 8px;"><p style="margin: 0; font-size: 14px;"><a href="https://master.d33ubw0r59z0k8.amplifyapp.com/?from=email" style="color: #552b9a; text-decoration: none;">View your application in the Research Marketplace</a></p></div><p style="margin-top: 20px;">Best regards,<br>GCU Research Team</p></div>`;
          const textBody = `Application Status Update\n\nDear ${student.name},\n\nYour application status has been updated:\n\nProject: ${project.title}\nApplication ID: ${newApp.id}\nNew Status: ${newApp.status}\n\nStatus Description:\n${statusDescription}\n${subReasonDescription ? '\nReason: ' + subReasonDescription : ''}\n\n${notes ? 'Additional Notes:\n' + notes + '\n\n' : ''}View at: https://master.d33ubw0r59z0k8.amplifyapp.com/?from=email\n\nBest regards,\nGCU Research Team`;
          
          await sendEmail(student.email, `Application Status Update: ${newApp.status}`, htmlBody, textBody);
        }
      }
    }
  }
  
  return { statusCode: 200, body: 'Processed' };
};

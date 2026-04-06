import { API, graphqlOperation } from 'aws-amplify';

//Email Students on Status of Application
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

// Email notification service ready for integration with AWS SES
export const sendEmailNotification = async (recipientEmail, recipientName, senderName, messageSubject, messageBody, projectTitle) => {
  try {
    // This function is ready for AWS SES integration
    // For now, it creates a notification record that can trigger email sending
    
    const emailData = {
      to: 'madalina.radu1@gcu.edu', // Force to verified email for testing
      originalRecipient: recipientEmail, // Keep track of intended recipient
      toName: recipientName,
      from: 'madalina.radu1@gcu.edu', // Use your verified email address
      fromName: 'Research Marketplace',
      subject: `New Message: ${messageSubject}`,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #552b9a;">New Message from ${senderName}</h2>
          <p style="background-color: #fff3cd; padding: 10px; border-radius: 4px;"><strong>Note:</strong> This email was intended for ${recipientEmail} but sent to your verified address for testing.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Project:</strong> ${projectTitle}</p>
            <p><strong>From:</strong> ${senderName}</p>
            <p><strong>Subject:</strong> ${messageSubject}</p>
          </div>
          <div style="background-color: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
            <h3>Message:</h3>
            <p style="white-space: pre-wrap;">${messageBody}</p>
          </div>
          <div style="margin-top: 20px; padding: 15px; background-color: #e7f3ff; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px;">
              <a href="https://master.d33ubw0r59z0k8.amplifyapp.com/?from=email" style="color: #552b9a; text-decoration: none;">
                Click here to view and reply to this message in the Research Marketplace
              </a>
            </p>
          </div>
          <div style="margin-top: 20px; font-size: 12px; color: #6c757d; text-align: center;">
            <p>This is an automated message from the Research Marketplace system.</p>
          </div>
        </div>
      `,
      textBody: `
New Message from ${senderName}

Project: ${projectTitle}
Subject: ${messageSubject}

Message:
${messageBody}

View and reply at: https://master.d33ubw0r59z0k8.amplifyapp.com/?from=email
      `
    };

    // Send email via Lambda function
    await sendSESEmail(emailData);
    
    console.log('Email notification sent:', emailData);
    
    return { success: true, emailData };
    
  } catch (error) {
    console.error('Error preparing email notification:', error);
    throw error;
  }
};

// Function to send email via AWS SES Lambda
export const sendSESEmail = async (emailData) => {
  try {
    const response = await API.post('emailapi', '/send-email', {
      body: emailData
    });
    return response;
  } catch (error) {
    console.error('Error calling email Lambda:', error);
    throw error;
  }
};

// Email preferences management
export const getUserEmailPreferences = async (userId) => {
  // This would fetch user's email notification preferences
  return {
    messageNotifications: true,
    applicationUpdates: true,
    projectUpdates: true,
    systemAnnouncements: true
  };
};

export const updateUserEmailPreferences = async (userId, preferences) => {
  // This would update user's email notification preferences
  console.log('Updating email preferences for user:', userId, preferences);
  return preferences;
};

// Send status change notification
export const sendStatusChangeNotification = async (recipientEmail, recipientName, itemType, itemTitle, oldStatus, newStatus, reviewerName, notes = '') => {
  try {
    const emailData = {
      to: 'madalina.radu1@gcu.edu', // Force to verified email for testing
      originalRecipient: recipientEmail,
      toName: recipientName,
      from: 'madalina.radu1@gcu.edu',
      fromName: 'Research Marketplace',
      subject: `${itemType} Status Update: ${itemTitle}`,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #552b9a;">${itemType} Status Update</h2>
          <p style="background-color: #fff3cd; padding: 10px; border-radius: 4px;"><strong>Note:</strong> This email was intended for ${recipientEmail} but sent to your verified address for testing.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>${itemType}:</strong> ${itemTitle}</p>
            <p><strong>Status Changed:</strong> ${oldStatus} → <span style="color: ${newStatus === 'Approved' ? 'green' : newStatus === 'Rejected' ? 'red' : '#552b9a'}; font-weight: bold;">${newStatus}</span></p>
            <p><strong>Reviewed by:</strong> ${reviewerName}</p>
          </div>
          ${notes ? `
          <div style="background-color: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px; margin: 20px 0;">
            <h3>Review Notes:</h3>
            <p style="white-space: pre-wrap;">${notes}</p>
          </div>
          ` : ''}
          <div style="margin-top: 20px; padding: 15px; background-color: #e7f3ff; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px;">
              <a href="https://master.d33ubw0r59z0k8.amplifyapp.com/?from=email" style="color: #552b9a; text-decoration: none;">
                Click here to view your ${itemType.toLowerCase()} in the Research Marketplace
              </a>
            </p>
          </div>
          <div style="margin-top: 20px; font-size: 12px; color: #6c757d; text-align: center;">
            <p>This is an automated message from the Research Marketplace system.</p>
          </div>
        </div>
      `,
      textBody: `
${itemType} Status Update

${itemType}: ${itemTitle}
Status Changed: ${oldStatus} → ${newStatus}
Reviewed by: ${reviewerName}

${notes ? `Review Notes:\n${notes}\n\n` : ''}View your ${itemType.toLowerCase()} at: https://master.d33ubw0r59z0k8.amplifyapp.com/?from=email
      `
    };

    await sendSESEmail(emailData);
    console.log('Status change notification sent:', emailData);
    return { success: true, emailData };
    
  } catch (error) {
    console.error('Error sending status change notification:', error);
    throw error;
  }
};

// Send new item notification
export const sendNewItemNotification = async (recipientEmail, recipientName, itemType, itemTitle, submitterName, submitterEmail) => {
  try {
    const emailData = {
      to: 'madalina.radu1@gcu.edu', // Force to verified email for testing
      originalRecipient: recipientEmail,
      toName: recipientName,
      from: 'madalina.radu1@gcu.edu',
      fromName: 'Research Marketplace',
      subject: `New ${itemType} Submitted: ${itemTitle}`,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #552b9a;">New ${itemType} Submitted</h2>
          <p style="background-color: #fff3cd; padding: 10px; border-radius: 4px;"><strong>Note:</strong> This email was intended for ${recipientEmail} but sent to your verified address for testing.</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>${itemType}:</strong> ${itemTitle}</p>
            <p><strong>Submitted by:</strong> ${submitterName} (${submitterEmail})</p>
            <p><strong>Status:</strong> Pending Review</p>
          </div>
          <div style="margin-top: 20px; padding: 15px; background-color: #e7f3ff; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px;">
              <a href="https://master.d33ubw0r59z0k8.amplifyapp.com/?from=email" style="color: #552b9a; text-decoration: none;">
                Click here to review this ${itemType.toLowerCase()} in the Research Marketplace
              </a>
            </p>
          </div>
          <div style="margin-top: 20px; font-size: 12px; color: #6c757d; text-align: center;">
            <p>This is an automated message from the Research Marketplace system.</p>
          </div>
        </div>
      `,
      textBody: `
New ${itemType} Submitted

${itemType}: ${itemTitle}
Submitted by: ${submitterName} (${submitterEmail})
Status: Pending Review

Review this ${itemType.toLowerCase()} at: https://master.d33ubw0r59z0k8.amplifyapp.com/?from=email
      `
    };

    await sendSESEmail(emailData);
    console.log('New item notification sent:', emailData);
    return { success: true, emailData };
    
  } catch (error) {
    console.error('Error sending new item notification:', error);
    throw error;
  }
};

export const sendApplicationSubmissionEmail = async (studentEmail, studentName, projectTitle, applicationId) => {
  try {
    const verifiedEmails = ['madalina.radu1@gcu.edu', 'dlemus4@my.gcu.edu', 'ldycus@my.gcu.edu', 'OFusco@my.gcu.edu', 'bberger7@my.gcu.edu', 'ABrajovic@my.gcu.edu'];
    const isVerified = verifiedEmails.includes(studentEmail);
    const recipientEmail = isVerified ? studentEmail : 'madalina.radu1@gcu.edu';
    
    const emailData = {
      to: recipientEmail,
      originalRecipient: studentEmail,
      toName: studentName,
      from: 'madalina.radu1@gcu.edu',
      fromName: 'GCU Research Marketplace',
      subject: 'Application Submitted Successfully',
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${!isVerified ? '<p style="background-color: #fff3cd; padding: 10px; border-radius: 4px;"><strong>Note:</strong> This email was intended for ' + studentEmail + ' but sent to your verified address for testing.</p>' : ''}
          <h2 style="color: #552b9a;">Application Submitted Successfully</h2>
          <p>Dear ${studentName},</p>
          <p>Thank you for submitting your application for the research opportunity:</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Project:</strong> ${projectTitle}</p>
            <p><strong>Application ID:</strong> ${applicationId}</p>
            <p><strong>Status:</strong> Coordinator Review</p>
          </div>
          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>What's Next?</strong></p>
            <p style="margin: 10px 0 0 0;">${STATUS_DESCRIPTIONS['Coordinator Review']}</p>
          </div>
          <div style="margin-top: 20px; padding: 15px; background-color: #f0f8f0; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px;">
              <a href="https://master.d33ubw0r59z0k8.amplifyapp.com/?from=email" style="color: #552b9a; text-decoration: none;">
                View your application status in the Research Marketplace
              </a>
            </p>
          </div>
          <p style="margin-top: 20px;">Best regards,<br>GCU Research Team</p>
        </div>
      `,
      textBody: `Application Submitted Successfully\n\nDear ${studentName},\n\nThank you for submitting your application for: ${projectTitle}\nApplication ID: ${applicationId}\nStatus: Coordinator Review\n\nWhat's Next?\n${STATUS_DESCRIPTIONS['Coordinator Review']}\n\nView at: https://master.d33ubw0r59z0k8.amplifyapp.com/?from=email\n\nBest regards,\nGCU Research Team`
    };

    await sendSESEmail(emailData);
    return { success: true };
  } catch (error) {
    console.error('Error sending application submission email:', error);
    throw error;
  }
};

export const sendApplicationStatusChangeEmail = async (studentEmail, studentName, projectTitle, applicationId, newStatus, statusDetail = null, notes = '') => {
  try {
    const verifiedEmails = ['madalina.radu1@gcu.edu', 'dlemus4@my.gcu.edu', 'ldycus@my.gcu.edu', 'OFusco@my.gcu.edu', 'bberger7@my.gcu.edu', 'ABrajovic@my.gcu.edu'];
    const isVerified = verifiedEmails.includes(studentEmail);
    const recipientEmail = isVerified ? studentEmail : 'madalina.radu1@gcu.edu';
    
    const statusDescription = STATUS_DESCRIPTIONS[newStatus] || '';
    const subReasonDescription = statusDetail ? SUB_REASON_DESCRIPTIONS[statusDetail] || statusDetail : '';
    
    const statusColor = newStatus === 'Approved' ? '#48bb78' : 
                       newStatus === 'Rejected' ? '#f56565' : 
                       newStatus === 'Returned' ? '#ed8936' : 
                       newStatus === 'Cancelled' ? '#718096' : 
                       newStatus === 'Expired' ? '#a0aec0' : '#552b9a';
    
    const emailData = {
      to: recipientEmail,
      originalRecipient: studentEmail,
      toName: studentName,
      from: 'madalina.radu1@gcu.edu',
      fromName: 'GCU Research Marketplace',
      subject: `Application Status Update: ${newStatus}`,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          ${!isVerified ? '<p style="background-color: #fff3cd; padding: 10px; border-radius: 4px;"><strong>Note:</strong> This email was intended for ' + studentEmail + ' but sent to your verified address for testing.</p>' : ''}
          <h2 style="color: #552b9a;">Application Status Update</h2>
          <p>Dear ${studentName},</p>
          <p>Your application status has been updated:</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Project:</strong> ${projectTitle}</p>
            <p><strong>Application ID:</strong> ${applicationId}</p>
            <p><strong>New Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${newStatus}</span></p>
          </div>
          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">Status Description:</p>
            <p style="margin: 10px 0 0 0;">${statusDescription}</p>
            ${subReasonDescription ? `<p style="margin: 10px 0 0 0; padding-top: 10px; border-top: 1px solid #bee3f8;"><strong>Reason:</strong> ${subReasonDescription}</p>` : ''}
          </div>
          ${notes ? `<div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="margin: 0; font-weight: bold;">Additional Notes:</p><p style="margin: 10px 0 0 0; white-space: pre-wrap;">${notes}</p></div>` : ''}
          <div style="margin-top: 20px; padding: 15px; background-color: #f0f8f0; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px;">
              <a href="https://master.d33ubw0r59z0k8.amplifyapp.com/?from=email" style="color: #552b9a; text-decoration: none;">
                View your application in the Research Marketplace
              </a>
            </p>
          </div>
          <p style="margin-top: 20px;">Best regards,<br>GCU Research Team</p>
        </div>
      `,
      textBody: `Application Status Update\n\nDear ${studentName},\n\nYour application status has been updated:\n\nProject: ${projectTitle}\nApplication ID: ${applicationId}\nNew Status: ${newStatus}\n\nStatus Description:\n${statusDescription}\n${subReasonDescription ? '\nReason: ' + subReasonDescription : ''}\n\n${notes ? 'Additional Notes:\n' + notes + '\n\n' : ''}View at: https://master.d33ubw0r59z0k8.amplifyapp.com/?from=email\n\nBest regards,\nGCU Research Team`
    };

    await sendSESEmail(emailData);
    return { success: true };
  } catch (error) {
    console.error('Error sending application status change email:', error);
    throw error;
  }
};


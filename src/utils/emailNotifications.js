import { API, graphqlOperation } from 'aws-amplify';

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
              <a href="https://master.d33ubw0r59z0k8.amplifyapp.com/messages" style="color: #552b9a; text-decoration: none;">
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

View and reply at: https://master.d33ubw0r59z0k8.amplifyapp.com/messages
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
              <a href="https://master.d33ubw0r59z0k8.amplifyapp.com/dashboard" style="color: #552b9a; text-decoration: none;">
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

${notes ? `Review Notes:\n${notes}\n\n` : ''}View your ${itemType.toLowerCase()} at: https://master.d33ubw0r59z0k8.amplifyapp.com/dashboard
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
              <a href="https://master.d33ubw0r59z0k8.amplifyapp.com/dashboard" style="color: #552b9a; text-decoration: none;">
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

Review this ${itemType.toLowerCase()} at: https://master.d33ubw0r59z0k8.amplifyapp.com/dashboard
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
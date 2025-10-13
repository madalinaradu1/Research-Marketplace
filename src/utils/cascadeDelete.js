import { API, graphqlOperation } from 'aws-amplify';
import { 
  deleteUser, deleteProject, deleteApplication, deleteMessage, 
  deleteStudentPost, deleteNotification, createDeletedUser 
} from '../graphql/operations';

/**
 * Marks a user for deletion and schedules cleanup in 90 days
 */
export const scheduleUserDeletion = async (userToDelete, testMode = false) => {
  try {
    const now = new Date();
    const cleanupDate = testMode 
      ? new Date(now.getTime() + (1 * 24 * 60 * 60 * 1000)) // 1 day for testing
      : new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90 days
    
    // Get user data before deletion
    // User data is already provided
    
    // Create deletion record
    await API.graphql(graphqlOperation(createDeletedUser, {
      input: {
        originalUserID: userToDelete.id,
        name: userToDelete.name,
        email: userToDelete.email,
        role: userToDelete.role,
        deletionScheduledAt: cleanupDate.toISOString(),
        isTestMode: testMode,
        userData: JSON.stringify(userToDelete),
        status: 'SCHEDULED'
      }
    }));
    
    // Delete from Cognito first
    try {
      await API.post('emailapi', '/delete-user', {
        body: { 
          userId: userToDelete.id,
          userEmail: userToDelete.email 
        }
      });
      console.log('User deleted from Cognito successfully');
    } catch (cognitoError) {
      console.error('Failed to delete from Cognito:', cognitoError);
      // Continue with database deletion even if Cognito fails
    }
    
    // Delete user account from database
    await API.graphql(graphqlOperation(deleteUser, { input: { id: userToDelete.id } }));
    
    return { success: true, cleanupDate, testMode };
  } catch (error) {
    console.error('Error scheduling user deletion:', error);
    throw error;
  }
};

/**
 * Performs cascade deletion of all user-related data
 */
export const performCascadeDelete = async (originalUserID) => {
  try {
    // Delete messages
    const messagesResult = await API.graphql(graphqlOperation(`
      query ListMessages {
        listMessages(limit: 1000) {
          items { id senderID receiverID }
        }
      }
    `));
    
    const userMessages = messagesResult.data.listMessages.items
      .filter(msg => msg.senderID === originalUserID || msg.receiverID === originalUserID);
    
    for (const message of userMessages) {
      await API.graphql(graphqlOperation(deleteMessage, { input: { id: message.id } }));
    }
    
    // Delete applications
    const applicationsResult = await API.graphql(graphqlOperation(`
      query ListApplications {
        listApplications(limit: 1000) {
          items { id studentID }
        }
      }
    `));
    
    const userApplications = applicationsResult.data.listApplications.items
      .filter(app => app.studentID === originalUserID);
    
    for (const application of userApplications) {
      await API.graphql(graphqlOperation(deleteApplication, { input: { id: application.id } }));
    }
    
    // Delete projects
    const projectsResult = await API.graphql(graphqlOperation(`
      query ListProjects {
        listProjects(limit: 1000) {
          items { id facultyID }
        }
      }
    `));
    
    const userProjects = projectsResult.data.listProjects.items
      .filter(project => project.facultyID === originalUserID);
    
    for (const project of userProjects) {
      await API.graphql(graphqlOperation(deleteProject, { input: { id: project.id } }));
    }
    
    // Delete student posts
    const postsResult = await API.graphql(graphqlOperation(`
      query ListStudentPosts {
        listStudentPosts(limit: 1000) {
          items { id authorID }
        }
      }
    `));
    
    const userPosts = postsResult.data.listStudentPosts.items
      .filter(post => post.authorID === originalUserID);
    
    for (const post of userPosts) {
      await API.graphql(graphqlOperation(deleteStudentPost, { input: { id: post.id } }));
    }
    
    // Delete notifications
    const notificationsResult = await API.graphql(graphqlOperation(`
      query ListNotifications {
        listNotifications(limit: 1000) {
          items { id userID }
        }
      }
    `));
    
    const userNotifications = notificationsResult.data.listNotifications.items
      .filter(notification => notification.userID === originalUserID);
    
    for (const notification of userNotifications) {
      await API.graphql(graphqlOperation(deleteNotification, { input: { id: notification.id } }));
    }
    
    return { success: true, deletedCount: {
      messages: userMessages.length,
      applications: userApplications.length,
      projects: userProjects.length,
      posts: userPosts.length,
      notifications: userNotifications.length
    }};
  } catch (error) {
    console.error('Error performing cascade delete:', error);
    throw error;
  }
};
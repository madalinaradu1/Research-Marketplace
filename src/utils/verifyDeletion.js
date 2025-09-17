import { API, graphqlOperation } from 'aws-amplify';
import { listMessages, listApplications, listProjects, listStudentPosts, listNotifications } from '../graphql/operations';

export const verifyUserDataDeleted = async (userId) => {
  try {
    const results = {
      userId,
      deletionComplete: true,
      remainingData: {}
    };

    // Check Messages
    const messagesResult = await API.graphql(graphqlOperation(listMessages, { limit: 1000 }));
    const userMessages = messagesResult.data.listMessages.items.filter(
      msg => msg.senderID === userId || msg.receiverID === userId
    );
    if (userMessages.length > 0) {
      results.deletionComplete = false;
      results.remainingData.messages = userMessages.length;
    }

    // Check Applications
    const applicationsResult = await API.graphql(graphqlOperation(listApplications, { limit: 1000 }));
    const userApplications = applicationsResult.data.listApplications.items.filter(
      app => app.studentID === userId
    );
    if (userApplications.length > 0) {
      results.deletionComplete = false;
      results.remainingData.applications = userApplications.length;
    }

    // Check Projects
    const projectsResult = await API.graphql(graphqlOperation(listProjects, { limit: 1000 }));
    const userProjects = projectsResult.data.listProjects.items.filter(
      project => project.facultyID === userId
    );
    if (userProjects.length > 0) {
      results.deletionComplete = false;
      results.remainingData.projects = userProjects.length;
    }

    // Check Student Posts
    const postsResult = await API.graphql(graphqlOperation(listStudentPosts, { limit: 1000 }));
    const userPosts = postsResult.data.listStudentPosts.items.filter(
      post => post.authorID === userId
    );
    if (userPosts.length > 0) {
      results.deletionComplete = false;
      results.remainingData.posts = userPosts.length;
    }

    // Check Notifications
    const notificationsResult = await API.graphql(graphqlOperation(listNotifications, { limit: 1000 }));
    const userNotifications = notificationsResult.data.listNotifications.items.filter(
      notification => notification.userID === userId
    );
    if (userNotifications.length > 0) {
      results.deletionComplete = false;
      results.remainingData.notifications = userNotifications.length;
    }

    console.log('Deletion verification results:', results);
    return results;

  } catch (error) {
    console.error('Error verifying deletion:', error);
    throw error;
  }
};

// Check deletion status from DeletedUser table
export const checkDeletionStatus = async (userId) => {
  try {
    const result = await API.graphql(graphqlOperation(`
      query ListDeletedUsers {
        listDeletedUsers(filter: { originalUserID: { eq: "${userId}" } }) {
          items {
            id
            originalUserID
            deletedAt
            scheduledCleanupAt
            status
            createdAt
            updatedAt
          }
        }
      }
    `));
    
    return result.data.listDeletedUsers.items;
  } catch (error) {
    console.error('Error checking deletion status:', error);
    throw error;
  }
};
import { scheduleUserDeletion } from './cascadeDelete';

// Test function to schedule user deletion
export const testUserDeletion = async (userId) => {
  try {
    // Schedule deletion in test mode (1 day)
    const result = await scheduleUserDeletion(userId, true);
    console.log('User scheduled for deletion:', result);
    return result;
  } catch (error) {
    console.error('Error scheduling test deletion:', error);
    throw error;
  }
};

// Function to manually trigger cleanup (for testing)
export const triggerTestCleanup = async () => {
  try {
    const response = await fetch('/api/cleanup-deleted-users', {
      method: 'POST'
    });
    const result = await response.json();
    console.log('Cleanup triggered:', result);
    return result;
  } catch (error) {
    console.error('Error triggering cleanup:', error);
    throw error;
  }
};
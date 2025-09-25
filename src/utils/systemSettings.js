// Utility functions to check system settings
export const getSystemSettings = () => {
  try {
    const savedConfig = localStorage.getItem('adminSystemConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
  } catch (error) {
    console.error('Error loading system settings:', error);
  }
  
  // Default settings
  return {
    maxApplications: 3,
    passwordMinLength: 8,
    sessionTimeout: 30,
    twoFactorRequired: true
  };
};

export const getMaxApplications = () => {
  const settings = getSystemSettings();
  return settings.maxApplications || 3;
};
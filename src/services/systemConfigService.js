import { API, graphqlOperation } from 'aws-amplify';
import { 
  createSystemConfig, 
  updateSystemConfig, 
  getSystemConfigByKey 
} from '../graphql/systemConfig';

export class SystemConfigService {
  static async getConfig(configKey) {
    try {
      const result = await API.graphql(graphqlOperation(getSystemConfigByKey, { configKey }));
      const configs = result.data.listSystemConfigs.items;
      return configs.length > 0 ? configs[0] : null;
    } catch (error) {
      console.error('Error getting config:', error);
      return null;
    }
  }

  static async setConfig(configKey, configValue, description = '') {
    try {
      const existing = await this.getConfig(configKey);
      
      if (existing) {
        const result = await API.graphql(graphqlOperation(updateSystemConfig, {
          input: {
            id: existing.id,
            configKey,
            configValue: String(configValue),
            description
          }
        }));
        return result.data.updateSystemConfig;
      } else {
        const result = await API.graphql(graphqlOperation(createSystemConfig, {
          input: {
            configKey,
            configValue: String(configValue),
            description
          }
        }));
        return result.data.createSystemConfig;
      }
    } catch (error) {
      console.error('Error setting config:', error);
      throw error;
    }
  }

  static async updatePasswordPolicy(minLength) {
    if (minLength < 6 || minLength > 99) {
      throw new Error('Password length must be between 6 and 99 characters');
    }

    try {
      const response = await API.post('emailapi', '/system-config', {
        body: {
          action: 'updatePasswordPolicy',
          configValue: minLength
        }
      });

      if (response.success) {
        await this.setConfig('passwordMinLength', minLength, 'Minimum password length requirement');
        return response;
      } else {
        throw new Error(response.error || 'Failed to update password policy');
      }
    } catch (error) {
      console.error('Error updating password policy:', error);
      throw error;
    }
  }

  static async updateSessionTimeout(timeoutMinutes) {
    if (timeoutMinutes < 5 || timeoutMinutes > 43200) {
      throw new Error('Session timeout must be between 5 minutes and 30 days');
    }

    try {
      const response = await API.post('emailapi', '/system-config', {
        body: {
          action: 'updateSessionTimeout',
          configValue: timeoutMinutes
        }
      });

      if (response.success) {
        await this.setConfig('sessionTimeout', timeoutMinutes, 'Session timeout in minutes');
        return response;
      } else {
        throw new Error(response.error || 'Failed to update session timeout');
      }
    } catch (error) {
      console.error('Error updating session timeout:', error);
      throw error;
    }
  }

  static async loadAllConfigs() {
    try {
      const configs = {};
      const keys = ['passwordMinLength', 'sessionTimeout', 'maxApplications'];
      
      for (const key of keys) {
        const config = await this.getConfig(key);
        if (config) {
          configs[key] = ['passwordMinLength', 'sessionTimeout', 'maxApplications'].includes(key)
            ? parseInt(config.configValue) 
            : config.configValue;
        }
      }
      
      return {
        passwordMinLength: configs.passwordMinLength || 8,
        sessionTimeout: configs.sessionTimeout || 30,
        maxApplications: configs.maxApplications || 3,
        twoFactorRequired: true
      };
    } catch (error) {
      console.error('Error loading configs:', error);
      return {
        passwordMinLength: 8,
        sessionTimeout: 30,
        maxApplications: 3,
        twoFactorRequired: true
      };
    }
  }
}
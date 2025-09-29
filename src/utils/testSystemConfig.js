import { SystemConfigService } from '../services/systemConfigService';

export const testSystemConfig = async () => {
  try {
    console.log('Testing SystemConfig functionality...');
    
    // Test loading configs
    const configs = await SystemConfigService.loadAllConfigs();
    console.log('Loaded configs:', configs);
    
    // Test setting a simple config
    await SystemConfigService.setConfig('maxApplications', 5, 'Test setting');
    console.log('Set maxApplications to 5');
    
    // Test retrieving the config
    const maxApps = await SystemConfigService.getConfig('maxApplications');
    console.log('Retrieved maxApplications:', maxApps);
    
    console.log('SystemConfig test completed successfully!');
    return true;
  } catch (error) {
    console.error('SystemConfig test failed:', error);
    return false;
  }
};
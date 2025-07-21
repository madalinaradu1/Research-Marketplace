import { API, graphqlOperation } from 'aws-amplify';
import { listUsers } from '../graphql/operations';

/**
 * Test function to verify API access
 */
export async function testApiAccess() {
  try {
    console.log('Testing API access...');
    const result = await API.graphql(graphqlOperation(listUsers, { limit: 10 }));
    console.log('API access successful:', result);
    return true;
  } catch (error) {
    console.error('API access test failed:', error);
    return false;
  }
}
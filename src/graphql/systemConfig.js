import { graphqlOperation } from 'aws-amplify';

export const createSystemConfig = /* GraphQL */ `
  mutation CreateSystemConfig($input: CreateSystemConfigInput!) {
    createSystemConfig(input: $input) {
      id
      configKey
      configValue
      description
      createdAt
      updatedAt
    }
  }
`;

export const updateSystemConfig = /* GraphQL */ `
  mutation UpdateSystemConfig($input: UpdateSystemConfigInput!) {
    updateSystemConfig(input: $input) {
      id
      configKey
      configValue
      description
      createdAt
      updatedAt
    }
  }
`;

export const getSystemConfig = /* GraphQL */ `
  query GetSystemConfig($id: ID!) {
    getSystemConfig(id: $id) {
      id
      configKey
      configValue
      description
      createdAt
      updatedAt
    }
  }
`;

export const listSystemConfigs = /* GraphQL */ `
  query ListSystemConfigs($filter: ModelSystemConfigFilterInput) {
    listSystemConfigs(filter: $filter) {
      items {
        id
        configKey
        configValue
        description
        createdAt
        updatedAt
      }
    }
  }
`;

export const getSystemConfigByKey = /* GraphQL */ `
  query GetSystemConfigByKey($configKey: String!) {
    listSystemConfigs(filter: { configKey: { eq: $configKey } }) {
      items {
        id
        configKey
        configValue
        description
        createdAt
        updatedAt
      }
    }
  }
`;
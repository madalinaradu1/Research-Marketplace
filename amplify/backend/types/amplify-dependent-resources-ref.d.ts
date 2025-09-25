export type AmplifyDependentResourcesAttributes = {
  "api": {
    "emailapi": {
      "ApiId": "string",
      "ApiName": "string",
      "RootUrl": "string"
    },
    "researchmarketplace": {
      "GraphQLAPIEndpointOutput": "string",
      "GraphQLAPIIdOutput": "string"
    }
  },
  "auth": {
    "ResearchMarketplace": {
      "AppClientID": "string",
      "AppClientIDWeb": "string",
      "CreatedSNSRole": "string",
      "IdentityPoolId": "string",
      "IdentityPoolName": "string",
      "UserPoolArn": "string",
      "UserPoolId": "string",
      "UserPoolName": "string"
    },
    "userPoolGroups": {
      "AdminGroupRole": "string",
      "CoordinatorGroupRole": "string",
      "FacultyGroupRole": "string",
      "StudentGroupRole": "string"
    }
  },
  "function": {
    "adminCreateUser": {
      "Arn": "string",
      "LambdaExecutionRole": "string",
      "LambdaExecutionRoleArn": "string",
      "Name": "string",
      "Region": "string"
    },
    "cleanupDeletedUsers": {
      "Arn": "string",
      "LambdaExecutionRole": "string",
      "LambdaExecutionRoleArn": "string",
      "Name": "string",
      "Region": "string"
    },
    "sendEmailNotification": {
      "Arn": "string",
      "LambdaExecutionRole": "string",
      "LambdaExecutionRoleArn": "string",
      "Name": "string",
      "Region": "string"
    }
  },
  "storage": {
    "applicationDocuments": {
      "BucketName": "string",
      "Region": "string"
    }
  }
}
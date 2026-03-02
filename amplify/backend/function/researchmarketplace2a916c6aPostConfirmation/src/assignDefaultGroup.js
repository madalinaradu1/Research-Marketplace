const AWS = require("aws-sdk");

const cognito = new AWS.CognitoIdentityServiceProvider({});

exports.handler = async (event) => {
  if (event.triggerSource !== "PostConfirmation_ConfirmSignUp") return event;

  const email = (event.request?.userAttributes?.email || "").toLowerCase().trim();

  let groupName = "Student"; //Default user pool
  if (email.endsWith("@my.gcu.edu")) {
    groupName = "Student";
  } else if (email.endsWith("@gcu.edu")) {
    groupName = "Faculty";
  }

  await cognito
    .adminAddUserToGroup({
      UserPoolId: event.userPoolId,
      Username: event.userName,
      GroupName: groupName,
    })
    .promise();

  return event;
};

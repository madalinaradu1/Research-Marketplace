const AWS = require("aws-sdk");

const cognito = new AWS.CognitoIdentityServiceProvider({});

exports.handler = async (event) => {
  try {
    if (event.triggerSource !== "PostConfirmation_ConfirmSignUp") return event;

    const email = (event.request?.userAttributes?.email || "").toLowerCase().trim();

    let groupName = "Student";
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

    console.log(`Assigned ${event.userName} to group ${groupName}`);
  } catch (error) {
    // Do not block post-confirmation flow if group assignment fails.
    console.error("Failed to assign default group:", error);
  }

  return event;
};

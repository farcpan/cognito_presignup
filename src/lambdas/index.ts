import {
  AdminCreateUserCommand,
  CognitoIdentityProvider,
} from "@aws-sdk/client-cognito-identity-provider";

export const signIn = async (event: any, context: any) => {
  const clientId = process.env["COGNITO_CLIENT_ID"];

  const body = event.body;
  const { username, password } = JSON.parse(body);

  try {
    const cognitoIdpClient = new CognitoIdentityProvider();
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify(e),
    };
  }
};

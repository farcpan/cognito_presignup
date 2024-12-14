import boto3
import pprint
import os
from dotenv import load_dotenv


class UserManager:
    def __init__(self):
        # reading env
        load_dotenv()
        self.client_id = os.environ["COGNITO_CLIENT_ID"]
        session = boto3.Session(profile_name="dev")
        self.cognito_client = session.client('cognito-idp')


    def signIn(self):
        username = input("Please input email for your user account: ")
        password = input("Please input your password: ")

        response = self.cognito_client.initiate_auth(
            ClientId=self.client_id,
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={
                "USERNAME": username,
                "PASSWORD": password
            }
        )

        print("=" * 30)
        pprint.pprint(response)

        if "Session" in response and "ChallengeName" in response:
            session = response["Session"]
            challenge_name = response["ChallengeName"]

            new_password = input("Please input new password: ")
            response = self.cognito_client.respond_to_auth_challenge(
                ClientId=self.client_id,
                ChallengeName=challenge_name,
                ChallengeResponses={
                    "NEW_PASSWORD": new_password,
                    "USERNAME": username,
                },
                Session=session
            )
            print("=" * 30)
            pprint.pprint(response)


if __name__ == '__main__':
    user_manager = UserManager()
    user_manager.signIn()

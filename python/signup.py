import boto3
import os
from dotenv import load_dotenv


def signup(username):
    # load .env
    load_dotenv()
    profile_name = os.environ["PROFILE_NAME"]

    # boto3 setup
    session = boto3.Session(profile_name=profile_name)
    cognito_client = session.client('cognito-idp')

    # AdminCreateUser
    response = cognito_client.admin_create_user(
        UserPoolId="ap-northeast-1_WOEUT3NaG",
        Username=username,
        UserAttributes=[
            {
                'Name': 'email',
                'Value': username
            },
        ],
    )
    print(response)


if __name__ == '__main__':
    username = input("Please input email address for user account creation: ")
    signup(username=username)

# cognito_presignup

## Deployment

```
cdk deploy --all --require-approval=never --profile=<user profile>
```

---

## Signup, Signin

- python/signup.py
  - Calling AdminCreateUser
- python/signin.py
  - Calling InitiateAuth & RespondToAuthChallenge

---

## Python

The following packages are required (pip install \*).

- boto3
- python-dotenv

---

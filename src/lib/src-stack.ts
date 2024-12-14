import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";

import { getResourceId } from "../utils/context";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";
import {
  AccountRecovery,
  OAuthScope,
  UserPool,
  UserPoolEmail,
} from "aws-cdk-lib/aws-cognito";
import { join } from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";

interface SrcStackProps extends StackProps {}

export class SrcStack extends Stack {
  constructor(scope: Construct, id: string, props: SrcStackProps) {
    super(scope, id, props);

    // DynamoDB
    const tableName = getResourceId("table");
    const table = new Table(this, tableName, {
      tableName: tableName,
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "dataType",
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    // Lambda
    const presignupLambdaPath = join(
      __dirname,
      "../lambdas/index-presignup.ts"
    );
    const presignupLambdaFunctionName = getResourceId("presignup");
    const presignupFunction = new NodejsFunction(
      this,
      presignupLambdaFunctionName,
      {
        functionName: presignupLambdaFunctionName,
        runtime: Runtime.NODEJS_LATEST,
        entry: presignupLambdaPath,
        handler: "presignupHandler",
        timeout: Duration.seconds(30),
        logRetention: RetentionDays.ONE_DAY,
        environment: {},
      }
    );
    table.grantReadWriteData(presignupFunction);

    // Cognito
    const userPoolName = getResourceId("user-pool");
    const userPool = new UserPool(this, userPoolName, {
      userPoolName: userPoolName,
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      autoVerify: {
        email: true,
        phone: false,
      },
      deletionProtection: false,
      email: UserPoolEmail.withCognito(),
      removalPolicy: RemovalPolicy.DESTROY,
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireDigits: true,
        tempPasswordValidity: Duration.days(1),
      },

      selfSignUpEnabled: true,
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
      signInAliases: {
        email: true,
      },
      userVerification: undefined,
      lambdaTriggers: {
        preSignUp: presignupFunction,
      },
      keepOriginal: {
        email: true,
      },
    });

    const userPoolClientName = getResourceId("user-pool-client");
    userPool.addClient(userPoolClientName, {
      userPoolClientName: userPoolClientName,
      generateSecret: false,
      enableTokenRevocation: true,
      preventUserExistenceErrors: true,
      authFlows: {
        userPassword: true,
        // custom: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: true,
        },
        scopes: [
          OAuthScope.EMAIL,
          OAuthScope.PHONE,
          OAuthScope.OPENID,
          OAuthScope.PROFILE,
        ],
      },
      idTokenValidity: Duration.hours(24),
      refreshTokenValidity: Duration.days(30),
    });
  }
}

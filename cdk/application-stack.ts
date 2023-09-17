import * as cdk from "aws-cdk-lib";
import { IRole } from "aws-cdk-lib/aws-iam";
import { CfnParameter } from "aws-cdk-lib";

export class ApplicationStack {
  stack: cdk.Stack;
  AWS_ENV_Parameter: CfnParameter;
  lambdaExecutionRole: cdk.aws_iam.Role;
  mergeDocumentAndDataLambda: cdk.aws_lambda.Function;

  constructor(app, id: string) {
    this.stack = new cdk.Stack(app, id);

    this.AWS_ENV_Parameter = new CfnParameter(this.stack, "AWS_ENV", {
      type: "String",
      description: "The AWS environment deployed to",
      default: "DEV",
      allowedValues: ["DEV", "TEST", "STAGING", "PROD"],
    });

    this.lambdaExecutionRole = new cdk.aws_iam.Role(
      this.stack,
      "LambdaExecutionRole",
      {
        assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
        description: "Lambda Execution Role",
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole",
          ),
        ],
      },
    );

    this.mergeDocumentAndDataLambda = new cdk.aws_lambda.Function(
      this.stack,
      "mergeDocumentAndData",
      {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: "mergeDocumentAndData.handler",
        code: cdk.aws_lambda.Code.fromAsset(
          "build/handlers/mergeDocumentAndData",
        ),
        environment: {
          AWS_ENV: this.AWS_ENV_Parameter.valueAsString,
          GOTENBERG_BASE_URL: cdk.Fn.sub(
            "{{resolve:ssm:/${AWS_ENV}/document-templating-service/gotenberg-base-url:1}}",
            {
              AWS_ENV: this.AWS_ENV_Parameter.valueAsString,
            },
          ),
        },
        role: this.lambdaExecutionRole as IRole,
      },
    );
  }
}

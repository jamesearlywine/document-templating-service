import * as cdk from "aws-cdk-lib";
import {IRole} from "aws-cdk-lib/aws-iam";

export class ApplicationStack {
  stack: cdk.Stack;
  lambdaExecutionRole: cdk.aws_iam.Role;
  mergeDocumentAndDataLambda: cdk.aws_lambda.Function;

  constructor(app, id: string) {
    this.stack = new cdk.Stack(app, id);

    this.lambdaExecutionRole = new cdk.aws_iam.Role(this.stack, "LambdaExecutionRole", {
      assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
      description: "Lambda Execution Role",
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
      ]
    });

    this.mergeDocumentAndDataLambda = new cdk.aws_lambda.Function(this.stack, "mergeDocumentAndData", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      handler: "mergeDocumentAndData.handler",
      code: cdk.aws_lambda.Code.fromAsset(`${__dirname}/../build/handlers/mergeDocumentAndData`),
      role: this.lambdaExecutionRole as IRole,
    });
  }
}



import * as cdk from "aws-cdk-lib";
import { IRole } from "aws-cdk-lib/aws-iam";
import { CfnParameter } from "aws-cdk-lib";
import { FunctionProps } from "aws-cdk-lib/aws-lambda";
import { InstanceProps, SecurityGroupProps } from "aws-cdk-lib/aws-ec2";

export class ApplicationStack {
  stack: cdk.Stack;
  vpc: cdk.aws_ec2.IVpc;
  AWS_ENV_Parameter: CfnParameter;
  lambdaExecutionRole: cdk.aws_iam.Role;
  mergeDocumentAndDataLambda: cdk.aws_lambda.Function;
  gotenbergServiceSecurityGroup: cdk.aws_ec2.SecurityGroup;
  gotenbergServiceSecurityGroupIngress: cdk.aws_ec2.CfnSecurityGroupIngress;
  gotenbergServiceInstance: cdk.aws_ec2.Instance;

  constructor(app, id: string) {
    this.stack = new cdk.Stack(app, id, {
      env: {
        account: "546515125053",
        region: "us-east-2",
      },
    });

    /*********************
     * Pipeline-Provided Parameters
     */

    this.AWS_ENV_Parameter = new CfnParameter(this.stack, "AWS_ENV", {
      type: "String",
      description: "The AWS environment deployed to",
      default: "DEV",
      allowedValues: ["DEV", "TEST", "STAGING", "PROD"],
    });

    /*********************
     * VPC
     */
    this.vpc = cdk.aws_ec2.Vpc.fromLookup(this.stack, "VPC", {
      vpcId: "vpc-55c2b13c",
    });

    /*********************
     * Gotenberg Service
     */
    const gotenbergServiceSecurityGroupName = "GotenbergServiceSecurityGroup";
    this.gotenbergServiceSecurityGroup = new cdk.aws_ec2.SecurityGroup(
      this.stack,
      "GotenbergServiceSecurityGroup",
      {
        vpc: this.vpc,
        securityGroupName: gotenbergServiceSecurityGroupName,
      } as SecurityGroupProps,
    );
    this.gotenbergServiceSecurityGroupIngress =
      new cdk.aws_ec2.CfnSecurityGroupIngress(
        this.stack,
        "GotenbergServiceSecurityGroupIngress",
        {
          cidrIp: "0.0.0.0/0", // temporary until I have time to do the networking properly
          ipProtocol: "tcp",
          toPort: 3000,
          sourceSecurityGroupId:
            this.gotenbergServiceSecurityGroup.securityGroupId,
        },
      );

    this.gotenbergServiceInstance = new cdk.aws_ec2.Instance(
      this.stack,
      "GotenbergServiceInstance",
      {
        instanceType: cdk.aws_ec2.InstanceType.of(
          cdk.aws_ec2.InstanceClass.C6GD,
          cdk.aws_ec2.InstanceSize.MEDIUM,
        ),
        machineImage: cdk.aws_ec2.MachineImage.latestAmazonLinux2(),
        vpc: this.vpc,
        securityGroup: this.gotenbergServiceSecurityGroup,
      } as InstanceProps,
    );

    /******************
     * mergeDocumentAndData Lambda
     */
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
        userData: cdk.aws_ec2.UserData.forLinux().addCommands(
          "yum install -y docker",
          "service docker start",
          "docker run -p 3000:3000 thecodingmachine/gotenberg:7",
        ),
        environment: {
          AWS_ENV: this.AWS_ENV_Parameter.valueAsString,
          GOTENBERG_BASE_URL: cdk.Fn.sub(
            "{{resolve:ssm:/${AWS_ENV}/document-templating-service/gotenberg-base-url}}",
            {
              AWS_ENV: this.AWS_ENV_Parameter.valueAsString,
            },
          ),
          PROCESSPROOF_GENERAL_PRIVATE_BUCKET_ARN: cdk.Fn.sub(
            "{{resolve:ssm:/${AWS_ENV}/processproof-s3-buckets/general-private-bucket-arn}}",
            {
              AWS_ENV: this.AWS_ENV_Parameter.valueAsString,
            },
          ),
          PROCESSPROOF_PUBLIC_DOCUMENTS_BUCKET_ARN: cdk.Fn.sub(
            "{{resolve:ssm:/${AWS_ENV}/processproof-s3-buckets/public-documents-bucket-arn}}",
            {
              AWS_ENV: this.AWS_ENV_Parameter.valueAsString,
            },
          ),
        },
        role: this.lambdaExecutionRole as IRole,
      } as FunctionProps,
    );
  }
}

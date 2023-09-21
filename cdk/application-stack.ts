import * as cdk from "aws-cdk-lib";
import { IRole } from "aws-cdk-lib/aws-iam";
import { CfnParameter } from "aws-cdk-lib";
import { FunctionProps } from "aws-cdk-lib/aws-lambda";
import { InstanceProps, SecurityGroupProps } from "aws-cdk-lib/aws-ec2";

export class ApplicationStack {
  stack: cdk.Stack;
  vpc: cdk.aws_ec2.IVpc;
  privateSubnetUsEast2A: cdk.aws_ec2.ISubnet;
  AWS_ENV_Parameter: CfnParameter;
  lambdaExecutionRole: cdk.aws_iam.Role;
  mergeDocumentAndDataLambda: cdk.aws_lambda.Function;
  gotenbergServiceSecurityGroup: cdk.aws_ec2.SecurityGroup;
  gotenbergServiceSecurityGroupHttpIngress: cdk.aws_ec2.CfnSecurityGroupIngress;
  gotenbergServiceSecurityGroupSshIngress: cdk.aws_ec2.CfnSecurityGroupIngress;
  gotenbergServiceInstance: cdk.aws_ec2.Instance;
  gotenbergServiceInstanceEnableSshCondition: cdk.CfnCondition;
  gotenbergServiceInstanceEnableSshParam: CfnParameter;
  gotenbergServiceInstanceBaseUrl: cdk.aws_ssm.StringParameter;

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
     * Private Subnet
     */
    this.privateSubnetUsEast2A = new cdk.aws_ec2.PrivateSubnet(
      this.stack,
      "PrivateSubnetUsEast2A",
      {
        availabilityZone: "us-east-2a",
        cidrBlock: "10.0.0.0/24",
        vpcId: this.vpc.vpcId,
        mapPublicIpOnLaunch: false,
      },
    );

    /*********************
     * Gotenberg Service
     */
    this.gotenbergServiceSecurityGroup = new cdk.aws_ec2.SecurityGroup(
      this.stack,
      "GotenbergServiceSecurityGroup",
      {
        vpc: this.vpc,
      } as SecurityGroupProps,
    );
    this.gotenbergServiceSecurityGroupHttpIngress =
      new cdk.aws_ec2.CfnSecurityGroupIngress(
        this.stack,
        "GotenbergServiceSecurityGroupHttpIngress",
        {
          cidrIp: "0.0.0.0/0", // temporary until I have time to do the networking properly
          ipProtocol: "tcp",
          toPort: 3000,
          fromPort: 3000,
          groupId: this.gotenbergServiceSecurityGroup.securityGroupId,
        },
      );
    this.gotenbergServiceSecurityGroupSshIngress =
      new cdk.aws_ec2.CfnSecurityGroupIngress(
        this.stack,
        "GotenbergServiceSecurityGroupSshIngress",
        {
          cidrIp: "0.0.0.0/0", // temporary until I have time to do the networking properly
          ipProtocol: "tcp",
          toPort: 22,
          fromPort: 22,
          groupId: this.gotenbergServiceSecurityGroup.securityGroupId,
        },
      );

    this.gotenbergServiceInstanceEnableSshParam = new CfnParameter(
      this.stack,
      "GotenbergServiceInstanceEnableSsh",
      {
        type: "String",
        description:
          "Whether to enable SSH access to the Gotenberg service instance",
        default: "false",
        allowedValues: ["true", "false"],
      },
    );
    this.gotenbergServiceInstanceEnableSshCondition = new cdk.CfnCondition(
      this.stack,
      "GotenbergServiceInstanceEnableSshCondition",
      {
        expression: cdk.Fn.conditionEquals(
          "true",
          this.gotenbergServiceInstanceEnableSshParam.valueAsString,
        ),
      },
    );
    this.gotenbergServiceSecurityGroupSshIngress.cfnOptions.condition =
      this.gotenbergServiceInstanceEnableSshCondition;

    const userData = cdk.aws_ec2.UserData.forLinux();
    userData.addCommands(
      "yum update -y",
      "yum -y install docker",
      "service docker start",
      "usermod -a -G docker ec2-user",
      "chkconfig docker on",
      "docker container run --name gotenbergInstance -p 3000:3000 public.ecr.aws/citizensadvice/gotenberg:latest",
    );
    this.gotenbergServiceInstance = new cdk.aws_ec2.Instance(
      this.stack,
      "GotenbergServiceInstance",
      {
        instanceType: cdk.aws_ec2.InstanceType.of(
          cdk.aws_ec2.InstanceClass.C6GD,
          cdk.aws_ec2.InstanceSize.MEDIUM,
        ),
        machineImage: cdk.aws_ec2.MachineImage.latestAmazonLinux2023({
          cpuType: cdk.aws_ec2.AmazonLinuxCpuType.ARM_64,
        }),
        vpc: this.vpc,
        vpcSubnets: {
          subnets: [this.privateSubnetUsEast2A],
        },
        securityGroup: this.gotenbergServiceSecurityGroup,
        keyName: "TempKeypair",
        userData: userData,
        userDataCausesReplacement: true,
        associatePublicIpAddress: false,
      } as InstanceProps,
    );
    this.gotenbergServiceInstanceBaseUrl = new cdk.aws_ssm.StringParameter(
      this.stack,
      "GotenbergServiceInstanceBaseUrl",
      {
        parameterName: cdk.Fn.sub(
          "/${AWS_ENV}/document-templating-service/gotenberg-base-url",
          {
            AWS_ENV: this.AWS_ENV_Parameter.valueAsString,
          },
        ),
        stringValue: cdk.Fn.sub("http://${GOTENBERG_IP}:3000", {
          GOTENBERG_IP: this.gotenbergServiceInstance.instancePrivateIp,
        }),
        simpleName: false,
      },
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
        environment: {
          AWS_ENV: this.AWS_ENV_Parameter.valueAsString,
          GOTENBERG_BASE_URL: this.gotenbergServiceInstanceBaseUrl.stringValue,
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

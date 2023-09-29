import * as cdk from "aws-cdk-lib";
import { IRole } from "aws-cdk-lib/aws-iam";
import { FunctionProps } from "aws-cdk-lib/aws-lambda";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { GotenbergServiceInstance } from "./GotenbergServiceInstance.cdk";
import { ApplicationConfig } from "cdk/cdk";

export class ApplicationStack extends cdk.Stack {
  AWS_ENV_Parameter: cdk.CfnParameter;
  gotenbergServiceInstanceEnableSshParam: cdk.CfnParameter;

  // consider refactor to parameters passed in from pipeline
  config: ApplicationConfig;

  vpc: cdk.aws_ec2.IVpc;
  privateSubnet: cdk.aws_ec2.ISubnet;

  lambdaExecutionRole: cdk.aws_iam.Role;

  gotenbergServiceInstance: GotenbergServiceInstance;

  generateDocumentLambda: cdk.aws_lambda.Function;
  createOrUpdateDocumentTemplateLambda: cdk.aws_lambda.Function;

  api: HttpApi;

  constructor(app, id: string, props) {
    super(app, id, props);

    this.config = props.config;

    /*********************
     * Pipeline-Provided Parameters
     */
    this.AWS_ENV_Parameter = new cdk.CfnParameter(this, "AWS_ENV", {
      type: "String",
      description: "The AWS environment deployed to",
      default: "DEV",
      allowedValues: ["DEV", "TEST", "STAGING", "PROD"],
    });
    this.gotenbergServiceInstanceEnableSshParam = new cdk.CfnParameter(
      this,
      "GotenbergServiceInstanceEnableSsh",
      {
        type: "String",
        description:
          "Whether to enable SSH access to the Gotenberg service instance",
        default: "false",
        allowedValues: ["true", "false"],
      },
    );

    /*********************
     * VPC
     */
    this.vpc = cdk.aws_ec2.Vpc.fromLookup(this, "VPC", {
      vpcId: this.config.vpcId,
    });

    /*********************
     * Private Subnet
     */
    this.privateSubnet = cdk.aws_ec2.Subnet.fromSubnetAttributes(
      this,
      "PrivateSubnet",
      this.config.privateSubnetAttributes,
    );

    /******************
     * Gotenberg Service Instance
     */
    this.gotenbergServiceInstance = new GotenbergServiceInstance(
      this,
      "GotenbergServiceInstance",
      {
        AWS_ENV: this.AWS_ENV_Parameter.valueAsString,
        vpc: this.vpc,
        subnet: this.privateSubnet,
        registerResources: !!props.ephemeralPrefix,
      },
    );

    /******************
     * Lambda Execution Role
     */
    this.lambdaExecutionRole = new cdk.aws_iam.Role(
      this,
      "LambdaExecutionRole",
      {
        assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
        description: "Lambda Execution Role",
        managedPolicies: [
          cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole",
          ),
          cdk.aws_iam.ManagedPolicy.fromManagedPolicyName(
            this,
            "LambdaPrivateSubnetExecutionRolePolicyReference",
            "LambdaPrivateSubnetExecutionRolePolicy",
          ),
        ],
      },
    );

    /******************
     * generateDocument Lambda
     */
    this.generateDocumentLambda = new cdk.aws_lambda.Function(
      this,
      "generatedDocumentLambda",
      {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: "index.handler",
        code: cdk.aws_lambda.Code.fromAsset("build/handlers/generateDocument"),
        vpc: this.vpc,
        vpcSubnets: [this.privateSubnet],
        environment: {
          AWS_ENV: this.AWS_ENV_Parameter.valueAsString,
          GOTENBERG_BASE_URL:
            this.gotenbergServiceInstance.gotenbergServiceInstanceBaseUrl
              .stringValue,
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

    /******************
     * CreateOrUpdate DocumentTemplate Lambda
     */
    this.createOrUpdateDocumentTemplateLambda = new cdk.aws_lambda.Function(
      this,
      "createOrUpdateDocumentTemplateLambda",
      {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: "index.handler",
        code: cdk.aws_lambda.Code.fromAsset(
          "build/handlers/createOrUpdateDocumentTemplate",
        ),
        vpc: this.vpc,
        vpcSubnets: [this.privateSubnet],
        environment: {
          AWS_ENV: this.AWS_ENV_Parameter.valueAsString,
          PROCESSPROOF_GENERAL_PRIVATE_BUCKET_ARN: cdk.Fn.sub(
            "{{resolve:ssm:/${AWS_ENV}/processproof-s3-buckets/general-private-bucket-arn}}",
            {
              AWS_ENV: this.AWS_ENV_Parameter.valueAsString,
            },
          ),
          SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN: cdk.Fn.sub(
            "{{resolve:ssm:/${AWS_ENV}/processproof-dynamodb-tables/document-templates-table-arn}}",
            {
              AWS_ENV: this.AWS_ENV_Parameter.valueAsString,
            },
          ),
        },
        role: this.lambdaExecutionRole as IRole,
      } as FunctionProps,
    );

    /******************
     * API Gateway
     */
    this.api = new HttpApi(this, "Api", {
      apiName: cdk.Fn.sub(
        "processproof-${AWS_ENV}-document-templating-service",
        {
          AWS_ENV: this.AWS_ENV_Parameter.valueAsString,
        },
      ),
    });
    this.api.addRoutes({
      path: "/generateDocument",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        "generateDocumentLambdaHttpIntegration",
        this.generateDocumentLambda,
      ),
    });
    this.api.addRoutes({
      path: "/documentTemplate",
      methods: [HttpMethod.PUT],
      integration: new HttpLambdaIntegration(
        "createOrUpdateDocumentTemplateLambdaHttpIntegration",
        this.createOrUpdateDocumentTemplateLambda,
      ),
    });
  }
}

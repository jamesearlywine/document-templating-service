import * as cdk from "aws-cdk-lib";
import { IRole } from "aws-cdk-lib/aws-iam";
import { FunctionProps } from "aws-cdk-lib/aws-lambda";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { GotenbergServiceInstance } from "./GotenbergServiceInstance.cdk";
import { ApplicationConfig } from "cdk/cdk";
import { RuleProps } from "aws-cdk-lib/aws-events";
import { aws_events_targets } from "aws-cdk-lib";

export class ApplicationStack extends cdk.Stack {
  AWS_ENV_Parameter: cdk.CfnParameter;
  gotenbergServiceInstanceEnableSshParam: cdk.CfnParameter;

  // consider refactor to parameters passed in from pipeline
  config: ApplicationConfig;
  ephemeralPrefix: string;

  isEphemeralStack = () => {
    return !!this.ephemeralPrefix;
  };

  vpc: cdk.aws_ec2.IVpc;
  privateSubnet: cdk.aws_ec2.ISubnet;

  lambdaExecutionRole: cdk.aws_iam.Role;

  gotenbergServiceInstance: GotenbergServiceInstance;

  generateDocumentLambda: cdk.aws_lambda.Function;
  createOrUpdateDocumentTemplateLambda: cdk.aws_lambda.Function;
  afterDocumentTemplateFileUploadedLambda: cdk.aws_lambda.Function;
  afterDocumentTemplateFileUploadedEventRule: cdk.aws_events.Rule;

  api: HttpApi;

  defaultAccountEventbus: cdk.aws_events.IEventBus;

  constructor(app, id: string, props) {
    super(app, id, props);

    this.config = props.config;
    this.ephemeralPrefix = props.ephemeralPrefix;

    /*********************
     * Pipeline-Provided Parameters
     */
    this.AWS_ENV_Parameter = new cdk.CfnParameter(this, "AWS_ENV", {
      type: "String",
      description: "The AWS environment deployed to",
      default: this.isEphemeralStack() ? "DEV" : "DEV",
      allowedValues: ["EPHEMERAL", "DEV", "TEST", "STAGING", "PROD"],
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
     * Eventbus
     */
    this.defaultAccountEventbus = cdk.aws_events.EventBus.fromEventBusArn(
      this,
      "DefaultAccountEventbus",
      cdk.Fn.sub(
        "arn:aws:events:${AWS_Region}:${AWS_AccountId}:event-bus/default",
        {
          AWS_Region: cdk.Aws.REGION,
          AWS_AccountId: cdk.Aws.ACCOUNT_ID,
        },
      ),
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
        registerResources: !this.isEphemeralStack(),
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
          cdk.aws_iam.ManagedPolicy.fromManagedPolicyName(
            this,
            "LambdaGeneralExecutionRolePolicyReference",
            "LambdaGeneralExecutionRolePolicy",
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
          GOTENBERG_BASE_URL: this.gotenbergServiceInstance.gotenburgBaseUrl,
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
     * CreateOrUpdateDocumentTemplate Lambda
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
          PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION: cdk.Fn.sub(
            "{{resolve:ssm:/${AWS_ENV}/processproof-s3-buckets-primary-region}}",
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
          PROCESSPROOF_DOCUMENT_TEMPLATES_S3_KEY_PREFIX: cdk.Fn.sub(
            "{{resolve:ssm:/${AWS_ENV}/processproof-s3-bucket/general-private-bucket/s3-key-prefixes/document-templates}}",
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
     * afterDocumentTemplateFileUploaded Lambda
     */
    this.afterDocumentTemplateFileUploadedLambda = new cdk.aws_lambda.Function(
      this,
      "afterDocumentTemplateFileUploadedLambda",
      {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: "index.handler",
        code: cdk.aws_lambda.Code.fromAsset(
          "build/handlers/afterDocumentTemplateFileUploaded",
        ),
        vpc: this.vpc,
        vpcSubnets: [this.privateSubnet],
        environment: {
          AWS_ENV: this.AWS_ENV_Parameter.valueAsString,
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

    this.afterDocumentTemplateFileUploadedEventRule = new cdk.aws_events.Rule(
      this,
      "afterDocumentTemplateFileUploadedEventRule",
      {
        eventBus: this.defaultAccountEventbus,
        targets: [
          new aws_events_targets.LambdaFunction(
            this.afterDocumentTemplateFileUploadedLambda,
          ),
        ],
        eventPattern: {
          source: ["aws.s3"],
          detailType: ["Object Created"],
          resources: [
            cdk.Fn.sub(
              "{{resolve:ssm:/${AWS_ENV}/processproof-s3-buckets/general-private-bucket-arn}}",
              {
                AWS_ENV: this.AWS_ENV_Parameter.valueAsString,
              },
            ),
          ],
          detail: {
            object: {
              key: [
                {
                  prefix: cdk.Fn.sub(
                    "{{resolve:ssm:/${AWS_ENV}/processproof-s3-bucket/general-private-bucket/s3-key-prefixes/document-templates}}",
                    {
                      AWS_ENV: this.AWS_ENV_Parameter.valueAsString,
                    },
                  ),
                },
              ],
            },
          },
        },
      } as RuleProps,
    );
    aws_events_targets.addLambdaPermission(
      this.afterDocumentTemplateFileUploadedEventRule,
      this.afterDocumentTemplateFileUploadedLambda,
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
    this.api.addRoutes({
      path: "/documentTemplate/{id}",
      methods: [HttpMethod.PUT],
      integration: new HttpLambdaIntegration(
        "createOrUpdateDocumentTemplateLambdaHttpIntegration",
        this.createOrUpdateDocumentTemplateLambda,
      ),
    });
  }
}

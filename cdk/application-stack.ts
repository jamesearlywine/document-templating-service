import * as cdk from "aws-cdk-lib";
import { IRole } from "aws-cdk-lib/aws-iam";
import { FunctionProps, Handler, IFunction } from "aws-cdk-lib/aws-lambda";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { GotenbergServiceInstance } from "./GotenbergServiceInstance.cdk";
import { ApplicationConfig } from "cdk/cdk";
import { RuleProps } from "aws-cdk-lib/aws-events";
import { aws_ecr, aws_events_targets, RemovalPolicy } from "aws-cdk-lib";
import * as ecr_assets from "aws-cdk-lib/aws-ecr-assets";

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
  lambdaEnvVariables: Record<string, unknown>;
  gotenbergServiceInstance: GotenbergServiceInstance;

  createGeneratedDocumentLambda: cdk.aws_lambda.Function;
  createOrUpdateDocumentTemplateLambda: cdk.aws_lambda.Function;
  getDocumentTemplatePresignedUploadUrlLambda: cdk.aws_lambda.Function;
  getDocumentTemplatesLambda: cdk.aws_lambda.Function;
  getDocumentTemplateLambda: cdk.aws_lambda.Function;
  deleteDocumentTemplateLambda: cdk.aws_lambda.Function;

  afterDocumentTemplateFileUploadedEventRule: cdk.aws_events.Rule;
  afterDocumentTemplateFileUploadedLambda: cdk.aws_lambda.Function;

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
     * Lambda Config Parameters
     */
    this.lambdaEnvVariables = {
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
      PROCESSPROOF_GENERATED_DOCUMENTS_S3_KEY_PREFIX: cdk.Fn.sub(
        "{{resolve:ssm:/${AWS_ENV}/processproof-s3-bucket/general-private-bucket/s3-key-prefixes/generated-documents}}",
        {
          AWS_ENV: this.AWS_ENV_Parameter.valueAsString,
        },
      ),
      DOCUMENT_TEMPLATE_SERVICE_DATASTORE_DYNAMODB_TABLE_ARN: cdk.Fn.sub(
        "{{resolve:ssm:/${AWS_ENV}/processproof-dynamodb-tables/document-template-service-datastore-table-arn}}",
        {
          AWS_ENV: this.AWS_ENV_Parameter.valueAsString,
        },
      ),
    };

    /******************
     * createGeneratedDocument Lambda
     */
    this.createGeneratedDocumentLambda = new cdk.aws_lambda.Function(
      this,
      "createGeneratedDocumentLambda",
      {
        // runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        // handler: "index.handler",
        // code: cdk.aws_lambda.Code.fromAsset(
        //   "build/handlers/createGeneratedDocument",
        // ),
        description: `createGeneratedDocumentLambda--containerCacheBuster-${new Date().toISOString()}`,
        handler: Handler.FROM_IMAGE,
        runtime: cdk.aws_lambda.Runtime.FROM_IMAGE,
        code: cdk.aws_lambda.Code.fromEcrImage(
          aws_ecr.Repository.fromRepositoryName(
            this,
            "ECRRepositoryForCreateGeneratedDocumentLambdaExecution",
            "create-generated-document-lambda-execution-environment",
          ),
        ), // Replace with the desired image tag
        vpc: this.vpc,
        vpcSubnets: [this.privateSubnet],
        environment: {
          ...this.lambdaEnvVariables,
          GOTENBERG_BASE_URL: this.gotenbergServiceInstance.gotenbergBaseUrl,
        },
        role: this.lambdaExecutionRole as IRole,
        timeout: cdk.Duration.seconds(30),
        dependsOn: [this.gotenbergServiceInstance],
      } as FunctionProps,
    );

    /******************
     * createOrUpdateDocumentTemplate Lambda
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
        environment: this.lambdaEnvVariables,
        role: this.lambdaExecutionRole as IRole,
      } as FunctionProps,
    );

    /******************
     * getDocumentTemplatePresignedUploadUrl Lambda
     */
    this.getDocumentTemplatePresignedUploadUrlLambda =
      new cdk.aws_lambda.Function(
        this,
        "getDocumentTemplatePresignedUploadUrlLambda",
        {
          runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
          handler: "index.handler",
          code: cdk.aws_lambda.Code.fromAsset(
            "build/handlers/getDocumentTemplatePresignedUploadUrl",
          ),
          vpc: this.vpc,
          vpcSubnets: [this.privateSubnet],
          environment: this.lambdaEnvVariables,
          role: this.lambdaExecutionRole as IRole,
        } as FunctionProps,
      );

    /******************
     * getDocumentTemplates Lambda
     */
    this.getDocumentTemplatesLambda = new cdk.aws_lambda.Function(
      this,
      "getDocumentTemplatesLambda",
      {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: "index.handler",
        code: cdk.aws_lambda.Code.fromAsset(
          "build/handlers/getDocumentTemplates",
        ),
        vpc: this.vpc,
        vpcSubnets: [this.privateSubnet],
        environment: this.lambdaEnvVariables,
        role: this.lambdaExecutionRole as IRole,
      } as FunctionProps,
    );

    /******************
     * getDocumentTemplate Lambda
     */
    this.getDocumentTemplateLambda = new cdk.aws_lambda.Function(
      this,
      "getDocumentTemplateLambda",
      {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: "index.handler",
        code: cdk.aws_lambda.Code.fromAsset(
          "build/handlers/getDocumentTemplate",
        ),
        vpc: this.vpc,
        vpcSubnets: [this.privateSubnet],
        environment: this.lambdaEnvVariables,
        role: this.lambdaExecutionRole as IRole,
      } as FunctionProps,
    );

    /******************
     * deleteDocumentTemplate Lambda
     */
    this.deleteDocumentTemplateLambda = new cdk.aws_lambda.Function(
      this,
      "deleteDocumentTemplateLambda",
      {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: "index.handler",
        code: cdk.aws_lambda.Code.fromAsset(
          "build/handlers/deleteDocumentTemplate",
        ),
        vpc: this.vpc,
        vpcSubnets: [this.privateSubnet],
        environment: this.lambdaEnvVariables,
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
        environment: this.lambdaEnvVariables,
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
            this.afterDocumentTemplateFileUploadedLambda as IFunction,
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
      path: "/generatedDocument/{id}",
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration(
        "createdGeneratedDocumentLambdaHttpIntegration",
        this.createGeneratedDocumentLambda,
      ),
    });

    // put without id in the path
    this.api.addRoutes({
      path: "/documentTemplate",
      methods: [HttpMethod.PUT],
      integration: new HttpLambdaIntegration(
        "createOrUpdateDocumentTemplateLambdaHttpIntegration",
        this.createOrUpdateDocumentTemplateLambda,
      ),
    });
    // put with id in the path
    this.api.addRoutes({
      path: "/documentTemplate/{id}",
      methods: [HttpMethod.PUT],
      integration: new HttpLambdaIntegration(
        "createOrUpdateDocumentTemplateLambdaHttpIntegration",
        this.createOrUpdateDocumentTemplateLambda,
      ),
    });

    this.api.addRoutes({
      path: "/documentTemplatePresignedUploadUrl/{id}",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        "getDocumentTemplatePresignedUploadUrlLambdaHttpIntegration",
        this.getDocumentTemplatePresignedUploadUrlLambda,
      ),
    });

    this.api.addRoutes({
      path: "/documentTemplate",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        "getDocumentTemplatesLambdaHttpIntegration",
        this.getDocumentTemplatesLambda,
      ),
    });

    this.api.addRoutes({
      path: "/documentTemplate/{id}",
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        "getDocumentTemplateLambdaHttpIntegration",
        this.getDocumentTemplateLambda,
      ),
    });

    this.api.addRoutes({
      path: "/documentTemplate/{id}",
      methods: [HttpMethod.DELETE],
      integration: new HttpLambdaIntegration(
        "deleteDocumentTemplateLambdaHttpIntegration",
        this.deleteDocumentTemplateLambda,
      ),
    });
  }
}

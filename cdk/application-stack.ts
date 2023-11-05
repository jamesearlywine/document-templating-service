import * as cdk from "aws-cdk-lib";
import { IRole } from "aws-cdk-lib/aws-iam";
import { FunctionProps, Handler, IFunction } from "aws-cdk-lib/aws-lambda";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { StackConfig } from "cdk/cdk";
import { RuleProps } from "aws-cdk-lib/aws-events";
import { aws_ecr, aws_events_targets } from "aws-cdk-lib";

export class ApplicationStack extends cdk.Stack {
  AWS_ENV_PARAMETER: cdk.CfnParameter;
  stackParameters: {
    AWS_ENV: cdk.CfnParameter;
    S3_PRIMARY_REGION: cdk.CfnParameter;
    DOCUMENT_TEMPLATES_BUCKET_ARN: cdk.CfnParameter;
    DOCUMENT_TEMPLATES_S3_KEY_PREFIX: cdk.CfnParameter;
    DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN: cdk.CfnParameter;
    DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX: cdk.CfnParameter;
    GENERATED_DOCUMENTS_BUCKET_ARN: cdk.CfnParameter;
    GENERATED_DOCUMENTS_S3_KEY_PREFIX: cdk.CfnParameter;
    GENERATED_DOCUMENTS_DYNAMODB_TABLE_ARN: cdk.CfnParameter;
    GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX: cdk.CfnParameter;
  };

  config: StackConfig;

  // consider refactor to parameters passed in from pipeline

  ephemeralPrefix: string;

  isEphemeralStack = () => {
    return !!this.ephemeralPrefix;
  };

  vpc: cdk.aws_ec2.IVpc;
  privateSubnet: cdk.aws_ec2.ISubnet;

  lambdaExecutionRole: cdk.aws_iam.Role;
  lambdaEnvVariables: Record<string, unknown>;

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
     * Stack Parameters (defaults values, can be overridden by pipeline)
     */
    this.AWS_ENV_PARAMETER = new cdk.CfnParameter(this, "AWS_ENV", {
      type: "String",
      description: "The AWS environment deployed to",
      default: this.isEphemeralStack() ? "DEV" : "DEV",
      allowedValues: ["EPHEMERAL", "DEV", "TEST", "STAGING", "PROD"],
    });

    this.stackParameters = {
      AWS_ENV: this.AWS_ENV_PARAMETER,
      S3_PRIMARY_REGION: new cdk.CfnParameter(this, "S3_PRIMARY_REGION", {
        type: "String",
        description: "Primary region for s3 buckets/client",
        default: cdk.Fn.sub("{{resolve:ssm:/${AWS_ENV}/processproof-s3-buckets-primary-region}}", {
          AWS_ENV: this.AWS_ENV_PARAMETER.valueAsString,
        }),
      }),
      DOCUMENT_TEMPLATES_BUCKET_ARN: new cdk.CfnParameter(this, "DOCUMENT_TEMPLATES_BUCKET_ARN", {
        type: "String",
        description: "ARN of the document templates bucket",
        default: cdk.Fn.sub("{{resolve:ssm:/${AWS_ENV}/processproof-s3-buckets/general-private-bucket-arn}}", {
          AWS_ENV: this.AWS_ENV_PARAMETER.valueAsString,
        }),
      }),
      DOCUMENT_TEMPLATES_S3_KEY_PREFIX: new cdk.CfnParameter(this, "DOCUMENT_TEMPLATES_S3_KEY_PREFIX", {
        type: "String",
        description: "S3 key prefix for document templates",
        default: cdk.Fn.sub(
          "{{resolve:ssm:/${AWS_ENV}/processproof-s3-bucket/general-private-bucket/s3-key-prefixes/document-templates}}",
          {
            AWS_ENV: this.AWS_ENV_PARAMETER.valueAsString,
          },
        ),
      }),
      DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN: new cdk.CfnParameter(this, "DOCUMENT_TEMPLATES_DYNAMO_TABLE_ARN", {
        type: "String",
        description: "ARN of the document templates dynamodb table",
        default: cdk.Fn.sub(
          "{{resolve:ssm:/${AWS_ENV}/processproof-dynamodb-tables/document-template-service-datastore-table-arn}}",
          {
            AWS_ENV: this.AWS_ENV_PARAMETER.valueAsString,
          },
        ),
      }),
      DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX: new cdk.CfnParameter(
        this,
        "DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX",
        {
          type: "String",
          description: "Partition key prefix for document templates",
          default: "DOCUMENT_TEMPLATE",
        },
      ),
      GENERATED_DOCUMENTS_BUCKET_ARN: new cdk.CfnParameter(this, "GENERATED_DOCUMENTS_BUCKET_ARN", {
        type: "String",
        description: "ARN of the generated documents bucket",
        default: cdk.Fn.sub("{{resolve:ssm:/${AWS_ENV}/processproof-s3-buckets/general-private-bucket-arn}}", {
          AWS_ENV: this.AWS_ENV_PARAMETER.valueAsString,
        }),
      }),
      GENERATED_DOCUMENTS_S3_KEY_PREFIX: new cdk.CfnParameter(this, "GENERATED_DOCUMENTS_S3_KEY_PREFIX", {
        type: "String",
        description: "S3 key prefix for generated documents",
        default: cdk.Fn.sub(
          "{{resolve:ssm:/${AWS_ENV}/processproof-s3-bucket/general-private-bucket/s3-key-prefixes/generated-documents}}",
          {
            AWS_ENV: this.AWS_ENV_PARAMETER.valueAsString,
          },
        ),
      }),
      GENERATED_DOCUMENTS_DYNAMODB_TABLE_ARN: new cdk.CfnParameter(this, "GENERATED_DOCUMENTS_DYNAMO_TABLE_ARN", {
        type: "String",
        description: "ARN of the generated documents dynamodb table",
        default: cdk.Fn.sub(
          "{{resolve:ssm:/${AWS_ENV}/processproof-dynamodb-tables/document-template-service-datastore-table-arn}}",
          {
            AWS_ENV: this.AWS_ENV_PARAMETER.valueAsString,
          },
        ),
      }),
      GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX: new cdk.CfnParameter(
        this,
        "GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX",
        {
          type: "String",
          description: "Partition key prefix for generated documents",
          default: "GENERATED_DOCUMENT",
        },
      ),
    };

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
      cdk.Fn.sub("arn:aws:events:${AWS::Region}:${AWS_AccountId}:event-bus/default", {
        AWS_Region: cdk.Aws.REGION,
        AWS_AccountId: cdk.Aws.ACCOUNT_ID,
      }),
    );

    /******************
     * Lambda Execution Role
     */
    this.lambdaExecutionRole = new cdk.aws_iam.Role(this, "LambdaExecutionRole", {
      assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
      description: "Lambda Execution Role",
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
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
    });

    /******************
     * Lambda Config
     */
    this.lambdaEnvVariables = {
      AWS_ENV: this.stackParameters.AWS_ENV.valueAsString,
      S3_PRIMARY_REGION: this.stackParameters.S3_PRIMARY_REGION.valueAsString,

      // Document Templates
      DOCUMENT_TEMPLATES_BUCKET_ARN: this.stackParameters.DOCUMENT_TEMPLATES_BUCKET_ARN.valueAsString,
      DOCUMENT_TEMPLATES_S3_KEY_PREFIX: this.stackParameters.DOCUMENT_TEMPLATES_S3_KEY_PREFIX.valueAsString,
      DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN: this.stackParameters.DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN.valueAsString,
      DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX:
        this.stackParameters.DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX.valueAsString,

      // Generated Documents
      GENERATED_DOCUMENTS_BUCKET_ARN: this.stackParameters.GENERATED_DOCUMENTS_BUCKET_ARN.valueAsString,
      GENERATED_DOCUMENTS_S3_KEY_PREFIX: this.stackParameters.GENERATED_DOCUMENTS_S3_KEY_PREFIX.valueAsString,
      GENERATED_DOCUMENTS_DYNAMODB_TABLE_ARN: this.stackParameters.GENERATED_DOCUMENTS_DYNAMODB_TABLE_ARN.valueAsString,
      GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX: "GENERATED_DOCUMENT",
    };

    /******************
     * createGeneratedDocument Lambda
     */
    this.createGeneratedDocumentLambda = new cdk.aws_lambda.Function(this, "createGeneratedDocumentLambda", {
      description: `createGeneratedDocumentLambda--containerCacheBuster-${new Date().toISOString()}`,
      handler: Handler.FROM_IMAGE,
      runtime: cdk.aws_lambda.Runtime.FROM_IMAGE,
      code: cdk.aws_lambda.Code.fromEcrImage(
        aws_ecr.Repository.fromRepositoryName(
          this,
          "ECRRepositoryForCreateGeneratedDocumentLambdaExecution",
          "create-generated-document-lambda-execution-environment",
        ),
      ),
      vpc: this.vpc,
      vpcSubnets: [this.privateSubnet],
      environment: {
        ...this.lambdaEnvVariables,
      },
      role: this.lambdaExecutionRole as IRole,
      timeout: cdk.Duration.seconds(600),
      memorySize: 1600,
    } as FunctionProps);

    /******************
     * createOrUpdateDocumentTemplate Lambda
     */
    this.createOrUpdateDocumentTemplateLambda = new cdk.aws_lambda.Function(
      this,
      "createOrUpdateDocumentTemplateLambda",
      {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: "index.handler",
        code: cdk.aws_lambda.Code.fromAsset("build/handlers/createOrUpdateDocumentTemplate"),
        vpc: this.vpc,
        vpcSubnets: [this.privateSubnet],
        environment: this.lambdaEnvVariables,
        role: this.lambdaExecutionRole as IRole,
      } as FunctionProps,
    );

    /******************
     * getDocumentTemplatePresignedUploadUrl Lambda
     */
    this.getDocumentTemplatePresignedUploadUrlLambda = new cdk.aws_lambda.Function(
      this,
      "getDocumentTemplatePresignedUploadUrlLambda",
      {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: "index.handler",
        code: cdk.aws_lambda.Code.fromAsset("build/handlers/getDocumentTemplatePresignedUploadUrl"),
        vpc: this.vpc,
        vpcSubnets: [this.privateSubnet],
        environment: this.lambdaEnvVariables,
        role: this.lambdaExecutionRole as IRole,
      } as FunctionProps,
    );

    /******************
     * getDocumentTemplates Lambda
     */
    this.getDocumentTemplatesLambda = new cdk.aws_lambda.Function(this, "getDocumentTemplatesLambda", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: cdk.aws_lambda.Code.fromAsset("build/handlers/getDocumentTemplates"),
      vpc: this.vpc,
      vpcSubnets: [this.privateSubnet],
      environment: this.lambdaEnvVariables,
      role: this.lambdaExecutionRole as IRole,
    } as FunctionProps);

    /******************
     * getDocumentTemplate Lambda
     */
    this.getDocumentTemplateLambda = new cdk.aws_lambda.Function(this, "getDocumentTemplateLambda", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: cdk.aws_lambda.Code.fromAsset("build/handlers/getDocumentTemplate"),
      vpc: this.vpc,
      vpcSubnets: [this.privateSubnet],
      environment: this.lambdaEnvVariables,
      role: this.lambdaExecutionRole as IRole,
    } as FunctionProps);

    /******************
     * deleteDocumentTemplate Lambda
     */
    this.deleteDocumentTemplateLambda = new cdk.aws_lambda.Function(this, "deleteDocumentTemplateLambda", {
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      handler: "index.handler",
      code: cdk.aws_lambda.Code.fromAsset("build/handlers/deleteDocumentTemplate"),
      vpc: this.vpc,
      vpcSubnets: [this.privateSubnet],
      environment: this.lambdaEnvVariables,
      role: this.lambdaExecutionRole as IRole,
    } as FunctionProps);

    /******************
     * afterDocumentTemplateFileUploaded Lambda
     */
    this.afterDocumentTemplateFileUploadedLambda = new cdk.aws_lambda.Function(
      this,
      "afterDocumentTemplateFileUploadedLambda",
      {
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        handler: "index.handler",
        code: cdk.aws_lambda.Code.fromAsset("build/handlers/afterDocumentTemplateFileUploaded"),
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
        targets: [new aws_events_targets.LambdaFunction(this.afterDocumentTemplateFileUploadedLambda as IFunction)],
        eventPattern: {
          source: ["aws.s3"],
          detailType: ["Object Created"],
          resources: [
            cdk.Fn.sub("{{resolve:ssm:/${AWS_ENV}/processproof-s3-buckets/general-private-bucket-arn}}", {
              AWS_ENV: this.stackParameters.AWS_ENV.valueAsString,
            }),
          ],
          detail: {
            object: {
              key: [
                {
                  prefix: cdk.Fn.sub(
                    "{{resolve:ssm:/${AWS_ENV}/processproof-s3-bucket/general-private-bucket/s3-key-prefixes/document-templates}}",
                    {
                      AWS_ENV: this.stackParameters.AWS_ENV.valueAsString,
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
      apiName: cdk.Fn.sub("processproof-${AWS_ENV}-document-templating-service", {
        AWS_ENV: this.stackParameters.AWS_ENV.valueAsString,
      }),
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

import * as cdk from "aws-cdk-lib";
import { aws_ecr, aws_events_targets } from "aws-cdk-lib";
import { IRole } from "aws-cdk-lib/aws-iam";
import { FunctionProps, Handler, IFunction } from "aws-cdk-lib/aws-lambda";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { HttpApi, HttpMethod } from "@aws-cdk/aws-apigatewayv2-alpha";
import { RuleProps } from "aws-cdk-lib/aws-events";
import { ConfigKeys, initializeStackConfig, AwsEnvParameter } from "./stack-config";
import { StackConfig } from "./stack-config-builder";

export class Stack extends cdk.Stack {
  // consider refactor to parameters passed in from pipeline

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

  stackConfig: StackConfig;

  ephemeralPrefix: string;
  isEphemeralStack = () => !!this.ephemeralPrefix;

  constructor(app, id: string, props) {
    super(app, id, props); /**

     /*********************
     * Ephemeral Prefix
     */
    this.ephemeralPrefix = props.ephemeralPrefix;

    /*********************
     * Stack Config
     */
    this.stackConfig = initializeStackConfig(this);

    /*********************
     * VPC
     */
    this.vpc = cdk.aws_ec2.Vpc.fromLookup(this, "VPC", {
      vpcId: this.stackConfig.get(ConfigKeys.VpcId) as string,
    });

    /*********************
     * Private Subnet
     */
    this.privateSubnet = cdk.aws_ec2.Subnet.fromSubnetAttributes(this, "PrivateSubnet", {
      subnetId: this.stackConfig.get(ConfigKeys.PrivateSubnetId) as string,
      availabilityZone: this.stackConfig.get(ConfigKeys.PrivateSubnetAvailabilityZone) as string,
      routeTableId: this.stackConfig.get(ConfigKeys.PrivateSubnetRouteTableId) as string,
    });

    /******************
     * Eventbus
     */
    this.defaultAccountEventbus = cdk.aws_events.EventBus.fromEventBusArn(
      this,
      "DefaultAccountEventbus",
      cdk.Fn.sub("arn:aws:events:${AWS::Region}:${AWS::AccountId}:event-bus/default"),
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
      AWS_ENV: this.stackConfig.get(ConfigKeys.AwsEnv),
      S3_PRIMARY_REGION: this.stackConfig.get(ConfigKeys.S3PrimaryRegion),

      // Document Templates
      DOCUMENT_TEMPLATES_BUCKET_ARN: this.stackConfig.get(ConfigKeys.DocumentTemplatesBucketArn),
      DOCUMENT_TEMPLATES_S3_KEY_PREFIX: this.stackConfig.get(ConfigKeys.DocumentTemplatesS3KeyPrefix),
      DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN: this.stackConfig.get(ConfigKeys.DocumentTemplatesDynamodbTableArn),
      DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX: this.stackConfig.get(
        ConfigKeys.DocumentTemplatesDynamodbPartitionKeyPrefix,
      ),

      // Generated Documents
      GENERATED_DOCUMENTS_BUCKET_ARN: this.stackConfig.get(ConfigKeys.GeneratedDocumentsBucketArn),
      GENERATED_DOCUMENTS_S3_KEY_PREFIX: this.stackConfig.get(ConfigKeys.GeneratedDocumentsS3KeyPrefix),
      GENERATED_DOCUMENTS_DYNAMODB_TABLE_ARN: this.stackConfig.get(ConfigKeys.GeneratedDocumentsDynamodbTableArn),
      GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX: this.stackConfig.get(
        ConfigKeys.GeneratedDocumentsDynamodbPartitionKeyPrefix,
      ),
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
              AWS_ENV: AwsEnvParameter.valueAsString,
            }),
          ],
          detail: {
            object: {
              key: [
                {
                  prefix: cdk.Fn.sub(
                    "{{resolve:ssm:/${AWS_ENV}/processproof-s3-bucket/general-private-bucket/s3-key-prefixes/document-templates}}",
                    {
                      AWS_ENV: AwsEnvParameter.valueAsString,
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
        AWS_ENV: AwsEnvParameter.valueAsString,
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

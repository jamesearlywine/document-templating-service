import * as cdk from "aws-cdk-lib";
import { aws_ecr, aws_events_targets, CfnOutput } from "aws-cdk-lib";
import { IRole } from "aws-cdk-lib/aws-iam";
import { FunctionProps, Handler, IFunction } from "aws-cdk-lib/aws-lambda";
import { RuleProps } from "aws-cdk-lib/aws-events";
import { ConfigKeys, initializeStackConfig, AwsEnvParameter, stackConfig } from "./stack-config";
import { StackConfig } from "./stack-config-builder";
import { ApiKey, LambdaIntegration, Resource, RestApi, UsagePlan } from "aws-cdk-lib/aws-apigateway";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export class Stack extends cdk.Stack {
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

  api: RestApi;
  apiUsagePlan: UsagePlan;
  restApiKey: ApiKey;
  restApiResources: Record<string, Resource>;

  defaultAccountEventbus: cdk.aws_events.IEventBus;

  stackConfig: StackConfig;

  ephemeralPrefix: string;
  isEphemeralStack = () => !!this.ephemeralPrefix;

  resourceRegistrations: Record<string, StringParameter>;

  outputs: Record<string, cdk.CfnOutput> = {};

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
          "LambdaPrivateSubnetExecutionRolePolicy", // @todo, make this a config item
        ),
        cdk.aws_iam.ManagedPolicy.fromManagedPolicyName(
          this,
          "LambdaGeneralExecutionRolePolicyReference",
          "LambdaGeneralExecutionRolePolicy", // @todo, make this a config item
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
          "create-generated-document-lambda-execution-environment", // @todo, make this a config item
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
          resources: [this.stackConfig.get(ConfigKeys.DocumentTemplatesBucketArn) as string],
          detail: {
            object: {
              key: [
                {
                  prefix: `${this.stackConfig.get(ConfigKeys.DocumentTemplatesS3KeyPrefix)}`,
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
    this.api = new RestApi(this, "Api", {
      restApiName: cdk.Fn.sub("${AWS_ENV}-document-templating-service-api", {
        AWS_ENV: AwsEnvParameter.valueAsString,
      }),
      description: "Document Templating Service API",
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"],
        allowMethods: ["GET", "PUT", "POST", "DELETE"],
        allowHeaders: ["*"],
      },
    });
    this.restApiKey = new ApiKey(this, "RestApiKey", {
      value: stackConfig.get(ConfigKeys.ApiKey),
      enabled: true,
    });
    this.apiUsagePlan = new UsagePlan(this, "DocumentTemplatingServiceUsagePlan", {
      name: "GeneralDocumentTemplatingServiceUsagePlan",
      description: "General Document Templating Service Usage Plan",
    });
    this.apiUsagePlan.addApiKey(this.restApiKey);

    // REST Resources
    this.restApiResources = {
      documentTemplate: this.api.root.addResource("documentTemplate"),
      documentTemplates: this.api.root.addResource("documentTemplates"),
      documentTemplatePresignedUploadUrl: this.api.root.addResource("documentTemplatePresignedUploadUrl"),
      generatedDocument: this.api.root.addResource("generatedDocument"),
    };

    // DocumentTemplate
    this.restApiResources.documentTemplate.addMethod(
      "PUT",
      new LambdaIntegration(this.createOrUpdateDocumentTemplateLambda),
    );
    this.restApiResources.documentTemplate.addMethod("GET", new LambdaIntegration(this.getDocumentTemplateLambda));
    this.restApiResources.documentTemplate.addMethod(
      "DELETE",
      new LambdaIntegration(this.deleteDocumentTemplateLambda),
    );
    this.restApiResources.documentTemplates.addMethod("GET", new LambdaIntegration(this.getDocumentTemplatesLambda));
    this.restApiResources.documentTemplates.addMethod(
      "POST",
      new LambdaIntegration(this.createOrUpdateDocumentTemplateLambda),
    );

    // DocumentTemplatePresignedUploadUrl
    this.restApiResources.documentTemplatePresignedUploadUrl.addMethod(
      "GET",
      new LambdaIntegration(this.getDocumentTemplatePresignedUploadUrlLambda),
    );

    // GeneratedDocument
    this.restApiResources.generatedDocument.addMethod(
      "POST",
      new LambdaIntegration(this.createGeneratedDocumentLambda),
    );

    /******************
     * Resource Registration
     */
    this.resourceRegistrations = {
      documentTemplatingServiceApiBaseUrl: new StringParameter(
        this,
        "DocumentTemplatingServiceApiBaseUrlSsmRegistration",
        {
          description: "The base URL of the Document Templating Service REST API",
          stringValue: this.api.url,
          parameterName: "/document-templating-service/rest-api-base-url",
        },
      ),
      documentTemplatingServiceApiKey: new StringParameter(this, "DocumentTemplatingServiceApiKeySsmRegistration", {
        description: "The API key for the Document Templating Service REST API",
        stringValue: this.api.url,
        parameterName: "/document-templating-service/rest-api-key",
      }),
    };

    /******************
     * Stack Outputs
     */
    this.outputs = {
      apiUrl: new CfnOutput(this, "OutputsApiUrl", {
        value: stackConfig.get(ConfigKeys.ApiKey),
        description: "The base URL of the Document Templating Service REST API",
        exportName: "DocumentTemplatingServiceApiBaseUrl",
      }),
      apiKey: new CfnOutput(this, "OutputsApiKey", {
        value: stackConfig.get(ConfigKeys.ApiKey),
        description: "The API key for the Document Templating Service REST API",
        exportName: "DocumentTemplatingServiceApiKey",
      }),
    };
  }
}

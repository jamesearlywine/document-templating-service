import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { CompileTimeConfig } from "./cdk";

export enum ConfigKey {
  AwsEnv = "AwsEnv",
  S3PrimaryRegion = "S3PrimaryRegion",
  DocumentTemplatesBucketArn = "DocumentTemplatesBucketArn",
  DocumentTemplatesS3KeyPrefix = "DocumentTemplatesS3KeyPrefix",
  DocumentTemplatesDynamodbTableArn = "DocumentTemplatesDynamodbTableArn",
  DocumentTemplatesDynamodbPartitionKeyPrefix = "DocumentTemplatesDynamodbPartitionKeyPrefix",
  GeneratedDocumentsBucketArn = "GeneratedDocumentsBucketArn",
  GeneratedDocumentsS3KeyPrefix = "GeneratedDocumentsS3KeyPrefix",
  GeneratedDocumentsDynamodbTableArn = "GeneratedDocumentsDynamodbTableArn",
  GeneratedDocumentsDynamodbPartitionKeyPrefix = "GeneratedDocumentsDynamodbPartitionKeyPrefix",
}

export enum ParamType {
  StackParameter = "stackParameter",
  FetchParameter = "fetchParameter",
}

export class StackConfig extends Construct {
  ephemeralPrefix: string;
  isEphemeralStack = () => {
    return !!this.ephemeralPrefix;
  };

  AwsEnvParameter: cdk.CfnParameter;
  stackParameters: Partial<Record<ConfigKey, cdk.CfnParameter>>;
  stackParameterNotNullConditions: Partial<Record<ConfigKey, cdk.CfnCondition>>;
  fetchParameters: Partial<Record<ConfigKey, string>>;
  configMapping: cdk.CfnMapping;
  getConfigValue: (key: ConfigKey) => unknown;

  constructor(scope: Construct, id: string, compileTimeConfig: CompileTimeConfig) {
    super(scope, id);

    this.ephemeralPrefix = compileTimeConfig.ephemeralPrefix;

    /*********************
     * Stack Parameters - Injected by Pipeline
     */
    this.AwsEnvParameter = new cdk.CfnParameter(this, "AwsEnv", {
      type: "String",
      description: "The AWS environment deployed to",
      default: this.isEphemeralStack() ? "DEV" : "DEV",
      allowedValues: ["EPHEMERAL", "DEV", "TEST", "STAGING", "PROD"],
    });

    this.stackParameters = {
      [ConfigKey.AwsEnv]: this.AwsEnvParameter,
      [ConfigKey.S3PrimaryRegion]: new cdk.CfnParameter(this, "S3PrimaryRegion", {
        type: "String",
        description: "Primary region for s3 buckets/client",
        default: "",
      }),
      [ConfigKey.DocumentTemplatesBucketArn]: new cdk.CfnParameter(this, "DocumentTemplatesBucketArn", {
        type: "String",
        description: "ARN of the document templates bucket",
        default: "",
      }),
      [ConfigKey.DocumentTemplatesS3KeyPrefix]: new cdk.CfnParameter(this, "DocumentTemplatesS3KeyPrefix", {
        type: "String",
        description: "S3 key prefix for document templates",
        default: "",
      }),
      [ConfigKey.DocumentTemplatesDynamodbTableArn]: new cdk.CfnParameter(this, "DocumentTemplatesDynamodbTableArn", {
        type: "String",
        description: "ARN of the document templates dynamodb table",
        default: "",
      }),
      [ConfigKey.DocumentTemplatesDynamodbPartitionKeyPrefix]: new cdk.CfnParameter(
        this,
        "DocumentTemplatesDynamodbPartitionKeyPrefix",
        {
          type: "String",
          description: "Partition key prefix for document templates",
          default: "DOCUMENT_TEMPLATE",
        },
      ),
      [ConfigKey.GeneratedDocumentsBucketArn]: new cdk.CfnParameter(this, "GeneratedDocumentsBucketArn", {
        type: "String",
        description: "ARN of the generated documents bucket",
        default: "",
      }),
      [ConfigKey.GeneratedDocumentsS3KeyPrefix]: new cdk.CfnParameter(this, "GeneratedDocumentsS3KeyPrefix", {
        type: "String",
        description: "S3 key prefix for generated documents",
        default: "",
      }),
      [ConfigKey.GeneratedDocumentsDynamodbTableArn]: new cdk.CfnParameter(this, "GeneratedDocumentsDynamodbTableArn", {
        type: "String",
        description: "ARN of the generated documents dynamodb table",
        default: "",
      }),
      [ConfigKey.GeneratedDocumentsDynamodbPartitionKeyPrefix]: new cdk.CfnParameter(
        this,
        "GeneratedDocumentsDynamodbPartitionKeyPrefix",
        {
          type: "String",
          description: "Partition key prefix for generated documents",
          default: "GENERATED_DOCUMENT",
        },
      ),
    };
    this.stackParameters[ConfigKey.AwsEnv].overrideLogicalId("AwsEnv");
    this.stackParameters[ConfigKey.S3PrimaryRegion].overrideLogicalId("S3PrimaryRegion");
    this.stackParameters[ConfigKey.DocumentTemplatesBucketArn].overrideLogicalId(ConfigKey.DocumentTemplatesBucketArn);
    this.stackParameters[ConfigKey.DocumentTemplatesS3KeyPrefix].overrideLogicalId(
      ConfigKey.DocumentTemplatesS3KeyPrefix,
    );
    this.stackParameters[ConfigKey.DocumentTemplatesDynamodbTableArn].overrideLogicalId(
      ConfigKey.DocumentTemplatesDynamodbTableArn,
    );
    this.stackParameters[ConfigKey.DocumentTemplatesDynamodbPartitionKeyPrefix].overrideLogicalId(
      ConfigKey.DocumentTemplatesDynamodbPartitionKeyPrefix,
    );
    this.stackParameters[ConfigKey.GeneratedDocumentsBucketArn].overrideLogicalId(
      ConfigKey.GeneratedDocumentsBucketArn,
    );
    this.stackParameters[ConfigKey.GeneratedDocumentsS3KeyPrefix].overrideLogicalId(
      ConfigKey.GeneratedDocumentsS3KeyPrefix,
    );
    this.stackParameters[ConfigKey.GeneratedDocumentsDynamodbTableArn].overrideLogicalId(
      ConfigKey.GeneratedDocumentsDynamodbTableArn,
    );
    this.stackParameters[ConfigKey.GeneratedDocumentsDynamodbPartitionKeyPrefix].overrideLogicalId(
      ConfigKey.GeneratedDocumentsDynamodbPartitionKeyPrefix,
    );

    /*********************
     * Fetch Parameter Values (from SSM, etc.)
     */
    this.fetchParameters = {
      [ConfigKey.S3PrimaryRegion]: cdk.Fn.sub("{{resolve:ssm:/${AwsEnv}/processproof-s3-buckets-primary-region}}", {
        AwsEnv: this.AwsEnvParameter.valueAsString,
      }),
      [ConfigKey.DocumentTemplatesBucketArn]: cdk.Fn.sub(
        "{{resolve:ssm:/${AwsEnv}/processproof-s3-buckets/general-private-bucket-arn}}",
        {
          AwsEnv: this.AwsEnvParameter.valueAsString,
        },
      ),
      [ConfigKey.DocumentTemplatesS3KeyPrefix]: cdk.Fn.sub(
        "{{resolve:ssm:/${AwsEnv}/processproof-s3-bucket/general-private-bucket/s3-key-prefixes/document-templates}}",
        {
          AwsEnv: this.AwsEnvParameter.valueAsString,
        },
      ),
      [ConfigKey.DocumentTemplatesDynamodbTableArn]: cdk.Fn.sub(
        "{{resolve:ssm:/${AwsEnv}/processproof-dynamodb-tables/document-template-service-datastore-table-arn}}",
        {
          AwsEnv: this.AwsEnvParameter.valueAsString,
        },
      ),
      [ConfigKey.GeneratedDocumentsBucketArn]: cdk.Fn.sub(
        "{{resolve:ssm:/${AwsEnv}/processproof-s3-buckets/general-private-bucket-arn}}",
        {
          AwsEnv: this.AwsEnvParameter.valueAsString,
        },
      ),
      [ConfigKey.GeneratedDocumentsS3KeyPrefix]: cdk.Fn.sub(
        "{{resolve:ssm:/${AwsEnv}/processproof-s3-bucket/general-private-bucket/s3-key-prefixes/generated-documents}}",
        {
          AwsEnv: this.AwsEnvParameter.valueAsString,
        },
      ),
      [ConfigKey.GeneratedDocumentsDynamodbTableArn]: cdk.Fn.sub(
        "{{resolve:ssm:/${AwsEnv}/processproof-dynamodb-tables/document-template-service-datastore-table-arn}}",
        {
          AwsEnv: this.AwsEnvParameter.valueAsString,
        },
      ),
    };

    /*********************
     * Config Map
     */
    this.configMapping = new cdk.CfnMapping(this, "ResolvedValues", {
      mapping: {
        [ConfigKey.AwsEnv]: {
          [ParamType.StackParameter]: this.stackParameters.AwsEnv.valueAsString,
          [ParamType.FetchParameter]: "",
        },
        [ConfigKey.S3PrimaryRegion]: {
          [ParamType.StackParameter]: this.stackParameters[ConfigKey.S3PrimaryRegion].valueAsString,
          [ParamType.FetchParameter]: this.fetchParameters[ConfigKey.S3PrimaryRegion],
        },
        [ConfigKey.DocumentTemplatesBucketArn]: {
          [ParamType.StackParameter]: this.stackParameters[ConfigKey.DocumentTemplatesBucketArn].valueAsString,
          [ParamType.FetchParameter]: this.fetchParameters[ConfigKey.DocumentTemplatesBucketArn],
        },
        [ConfigKey.DocumentTemplatesS3KeyPrefix]: {
          [ParamType.StackParameter]: this.stackParameters[ConfigKey.DocumentTemplatesS3KeyPrefix].valueAsString,
          [ParamType.FetchParameter]: this.fetchParameters[ConfigKey.DocumentTemplatesS3KeyPrefix],
        },
        [ConfigKey.DocumentTemplatesDynamodbTableArn]: {
          [ParamType.StackParameter]: this.stackParameters[ConfigKey.DocumentTemplatesDynamodbTableArn].valueAsString,
          [ParamType.FetchParameter]: this.fetchParameters[ConfigKey.DocumentTemplatesDynamodbTableArn],
        },
        [ConfigKey.DocumentTemplatesDynamodbPartitionKeyPrefix]: {
          [ParamType.StackParameter]:
            this.stackParameters[ConfigKey.DocumentTemplatesDynamodbPartitionKeyPrefix].valueAsString,
          [ParamType.FetchParameter]: "",
        },
        [ConfigKey.GeneratedDocumentsBucketArn]: {
          [ParamType.StackParameter]: this.stackParameters[ConfigKey.GeneratedDocumentsBucketArn].valueAsString,
          [ParamType.FetchParameter]: this.fetchParameters[ConfigKey.GeneratedDocumentsBucketArn],
        },
        [ConfigKey.GeneratedDocumentsS3KeyPrefix]: {
          [ParamType.StackParameter]: this.stackParameters[ConfigKey.GeneratedDocumentsS3KeyPrefix].valueAsString,
          [ParamType.FetchParameter]: this.fetchParameters[ConfigKey.GeneratedDocumentsS3KeyPrefix],
        },
        [ConfigKey.GeneratedDocumentsDynamodbTableArn]: {
          [ParamType.StackParameter]: this.stackParameters[ConfigKey.GeneratedDocumentsDynamodbTableArn].valueAsString,
          [ParamType.FetchParameter]: this.fetchParameters[ConfigKey.GeneratedDocumentsDynamodbTableArn],
        },
        [ConfigKey.GeneratedDocumentsDynamodbPartitionKeyPrefix]: {
          [ParamType.StackParameter]:
            this.stackParameters[ConfigKey.GeneratedDocumentsDynamodbPartitionKeyPrefix].valueAsString,
          [ParamType.FetchParameter]: "",
        },
      },
      lazy: true,
    });

    /*********************
     * Get Config Value
     */
    this.stackParameterNotNullConditions = {};

    const buildStackParameterNotNullConditionLogicalId = (key: ConfigKey) => {
      return `${key}ParameterNotNullCondition`;
    };

    const createIfNotExistsStackParameterNotNullCondition = (key: ConfigKey) => {
      const stackParameterNotNullConditionLogicalId = buildStackParameterNotNullConditionLogicalId(key);
      if (!this.stackParameterNotNullConditions[key]) {
        this.stackParameterNotNullConditions[key] = new cdk.CfnCondition(
          this,
          stackParameterNotNullConditionLogicalId,
          {
            expression: cdk.Fn.conditionNot(
              cdk.Fn.conditionEquals(this.configMapping.findInMap(key, ParamType.StackParameter), ""),
            ),
          },
        );
      }
    };

    this.getConfigValue = (key: ConfigKey) => {
      createIfNotExistsStackParameterNotNullCondition(key);

      return cdk.Fn.conditionIf(
        this.stackParameterNotNullConditions[key]?.logicalId,
        this.configMapping.findInMap(key, ParamType.StackParameter),
        this.configMapping.findInMap(key, ParamType.FetchParameter),
      );
    };
  }
}

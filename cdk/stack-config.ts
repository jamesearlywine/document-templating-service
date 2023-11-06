import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { CompileTimeConfig } from "./cdk";

export const enum ConfigKey {
  AWS_ENV = "AWS_ENV",
  S3_PRIMARY_REGION = "S3_PRIMARY_REGION",
  DOCUMENT_TEMPLATES_BUCKET_ARN = "DOCUMENT_TEMPLATES_BUCKET_ARN",
  DOCUMENT_TEMPLATES_S3_KEY_PREFIX = "DOCUMENT_TEMPLATES_S3_KEY_PREFIX",
  DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN = "DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN",
  DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX = "DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX",
  GENERATED_DOCUMENTS_BUCKET_ARN = "GENERATED_DOCUMENTS_BUCKET_ARN",
  GENERATED_DOCUMENTS_S3_KEY_PREFIX = "GENERATED_DOCUMENTS_S3_KEY_PREFIX",
  GENERATED_DOCUMENTS_DYNAMODB_TABLE_ARN = "GENERATED_DOCUMENTS_DYNAMODB_TABLE_ARN",
  GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX = "GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX",
}

export const enum ParamType {
  STACK_PARAMETER = "stackParameter",
  FETCH_PARAMETER = "fetchParameter",
}

export class StackConfig extends Construct {
  ephemeralPrefix: string;

  isEphemeralStack = () => {
    return !!this.ephemeralPrefix;
  };

  AWS_ENV_PARAMETER: cdk.CfnParameter;

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
    this.AWS_ENV_PARAMETER = new cdk.CfnParameter(this, "AWS_ENV", {
      type: "String",
      description: "The AWS environment deployed to",
      default: this.isEphemeralStack() ? "DEV" : "DEV",
      allowedValues: ["EPHEMERAL", "DEV", "TEST", "STAGING", "PROD"],
    });

    this.stackParameters = {
      [ConfigKey.AWS_ENV]: this.AWS_ENV_PARAMETER,
      [ConfigKey.S3_PRIMARY_REGION]: new cdk.CfnParameter(this, "S3_PRIMARY_REGION_PARAMETER", {
        type: "String",
        description: "Primary region for s3 buckets/client",
        default: "",
      }),
      [ConfigKey.DOCUMENT_TEMPLATES_BUCKET_ARN]: new cdk.CfnParameter(this, "DOCUMENT_TEMPLATES_BUCKET_ARN_PARAMETER", {
        type: "String",
        description: "ARN of the document templates bucket",
        default: "",
      }),
      [ConfigKey.DOCUMENT_TEMPLATES_S3_KEY_PREFIX]: new cdk.CfnParameter(
        this,
        "DOCUMENT_TEMPLATES_S3_KEY_PREFIX_PARAMETER",
        {
          type: "String",
          description: "S3 key prefix for document templates",
          default: "",
        },
      ),
      [ConfigKey.DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN]: new cdk.CfnParameter(
        this,
        "DOCUMENT_TEMPLATES_DYNAMO_TABLE_ARN_PARAMETER",
        {
          type: "String",
          description: "ARN of the document templates dynamodb table",
          default: "",
        },
      ),
      [ConfigKey.DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX]: new cdk.CfnParameter(
        this,
        "DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX_PARAMETER",
        {
          type: "String",
          description: "Partition key prefix for document templates",
          default: "DOCUMENT_TEMPLATE",
        },
      ),
      [ConfigKey.GENERATED_DOCUMENTS_BUCKET_ARN]: new cdk.CfnParameter(
        this,
        "GENERATED_DOCUMENTS_BUCKET_ARN_PARAMETER",
        {
          type: "String",
          description: "ARN of the generated documents bucket",
          default: "",
        },
      ),
      [ConfigKey.GENERATED_DOCUMENTS_S3_KEY_PREFIX]: new cdk.CfnParameter(
        this,
        "GENERATED_DOCUMENTS_S3_KEY_PREFIX_PARAMETER",
        {
          type: "String",
          description: "S3 key prefix for generated documents",
          default: "",
        },
      ),
      [ConfigKey.GENERATED_DOCUMENTS_DYNAMODB_TABLE_ARN]: new cdk.CfnParameter(
        this,
        "GENERATED_DOCUMENTS_DYNAMO_TABLE_ARN_PARAMETER",
        {
          type: "String",
          description: "ARN of the generated documents dynamodb table",
          default: "",
        },
      ),
      [ConfigKey.GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX]: new cdk.CfnParameter(
        this,
        "GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX_PARAMETER",
        {
          type: "String",
          description: "Partition key prefix for generated documents",
          default: "GENERATED_DOCUMENT",
        },
      ),
    };

    /*********************
     * Fetch Parameter Values (from SSM, etc.)
     */
    this.fetchParameters = {
      [ConfigKey.S3_PRIMARY_REGION]: cdk.Fn.sub("{{resolve:ssm:/${AWS_ENV}/processproof-s3-buckets-primary-region}}", {
        AWS_ENV: this.AWS_ENV_PARAMETER.valueAsString,
      }),
      [ConfigKey.DOCUMENT_TEMPLATES_BUCKET_ARN]: cdk.Fn.sub(
        "{{resolve:ssm:/${AWS_ENV}/processproof-s3-buckets/general-private-bucket-arn}}",
        {
          AWS_ENV: this.AWS_ENV_PARAMETER.valueAsString,
        },
      ),
      [ConfigKey.DOCUMENT_TEMPLATES_S3_KEY_PREFIX]: cdk.Fn.sub(
        "{{resolve:ssm:/${AWS_ENV}/processproof-s3-bucket/general-private-bucket/s3-key-prefixes/document-templates}}",
        {
          AWS_ENV: this.AWS_ENV_PARAMETER.valueAsString,
        },
      ),
      [ConfigKey.DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN]: cdk.Fn.sub(
        "{{resolve:ssm:/${AWS_ENV}/processproof-dynamodb-tables/document-template-service-datastore-table-arn}}",
        {
          AWS_ENV: this.AWS_ENV_PARAMETER.valueAsString,
        },
      ),
      [ConfigKey.GENERATED_DOCUMENTS_BUCKET_ARN]: cdk.Fn.sub(
        "{{resolve:ssm:/${AWS_ENV}/processproof-s3-buckets/general-private-bucket-arn}}",
        {
          AWS_ENV: this.AWS_ENV_PARAMETER.valueAsString,
        },
      ),
      [ConfigKey.GENERATED_DOCUMENTS_S3_KEY_PREFIX]: cdk.Fn.sub(
        "{{resolve:ssm:/${AWS_ENV}/processproof-s3-bucket/general-private-bucket/s3-key-prefixes/generated-documents}}",
        {
          AWS_ENV: this.AWS_ENV_PARAMETER.valueAsString,
        },
      ),
      [ConfigKey.GENERATED_DOCUMENTS_DYNAMODB_TABLE_ARN]: cdk.Fn.sub(
        "{{resolve:ssm:/${AWS_ENV}/processproof-dynamodb-tables/document-template-service-datastore-table-arn}}",
        {
          AWS_ENV: this.AWS_ENV_PARAMETER.valueAsString,
        },
      ),
    };

    /*********************
     * Config Map
     */
    this.configMapping = new cdk.CfnMapping(this, "ResolvedValues", {
      mapping: {
        [ConfigKey.AWS_ENV]: {
          [ParamType.STACK_PARAMETER]: this.stackParameters.AWS_ENV.valueAsString,
          [ParamType.FETCH_PARAMETER]: "",
        },
        [ConfigKey.S3_PRIMARY_REGION]: {
          [ParamType.STACK_PARAMETER]: this.stackParameters.S3_PRIMARY_REGION.valueAsString,
          [ParamType.FETCH_PARAMETER]: this.fetchParameters.S3_PRIMARY_REGION,
        },
        [ConfigKey.DOCUMENT_TEMPLATES_BUCKET_ARN]: {
          [ParamType.STACK_PARAMETER]: this.stackParameters.DOCUMENT_TEMPLATES_BUCKET_ARN.valueAsString,
          [ParamType.FETCH_PARAMETER]: this.fetchParameters.DOCUMENT_TEMPLATES_BUCKET_ARN,
        },
        [ConfigKey.DOCUMENT_TEMPLATES_S3_KEY_PREFIX]: {
          [ParamType.STACK_PARAMETER]: this.stackParameters.DOCUMENT_TEMPLATES_S3_KEY_PREFIX.valueAsString,
          [ParamType.FETCH_PARAMETER]: this.fetchParameters.DOCUMENT_TEMPLATES_S3_KEY_PREFIX,
        },
        [ConfigKey.DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN]: {
          [ParamType.STACK_PARAMETER]: this.stackParameters.DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN.valueAsString,
          [ParamType.FETCH_PARAMETER]: this.fetchParameters.DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN,
        },
        [ConfigKey.DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX]: {
          [ParamType.STACK_PARAMETER]:
            this.stackParameters.DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX.valueAsString,
          [ParamType.FETCH_PARAMETER]: "",
        },
        [ConfigKey.GENERATED_DOCUMENTS_BUCKET_ARN]: {
          [ParamType.STACK_PARAMETER]: this.stackParameters.GENERATED_DOCUMENTS_BUCKET_ARN.valueAsString,
          [ParamType.FETCH_PARAMETER]: this.fetchParameters.GENERATED_DOCUMENTS_BUCKET_ARN,
        },
        [ConfigKey.GENERATED_DOCUMENTS_S3_KEY_PREFIX]: {
          [ParamType.STACK_PARAMETER]: this.stackParameters.GENERATED_DOCUMENTS_S3_KEY_PREFIX.valueAsString,
          [ParamType.FETCH_PARAMETER]: this.fetchParameters.GENERATED_DOCUMENTS_S3_KEY_PREFIX,
        },
        [ConfigKey.GENERATED_DOCUMENTS_DYNAMODB_TABLE_ARN]: {
          [ParamType.STACK_PARAMETER]: this.stackParameters.GENERATED_DOCUMENTS_DYNAMODB_TABLE_ARN.valueAsString,
          [ParamType.FETCH_PARAMETER]: this.fetchParameters.GENERATED_DOCUMENTS_DYNAMODB_TABLE_ARN,
        },
        [ConfigKey.GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX]: {
          [ParamType.STACK_PARAMETER]:
            this.stackParameters.GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX.valueAsString,
          [ParamType.FETCH_PARAMETER]: "",
        },
      },
      lazy: true,
    });

    /*********************
     * Get Config Value
     */
    this.stackParameterNotNullConditions = {};

    const buildStackParameterNotNullConditionLogicalId = (key: ConfigKey) => {
      return `${key}_PARAMETER_NOT_NULL_CONDITION`;
    };

    const createIfNotExistsStackParameterNotNullCondition = (key: ConfigKey) => {
      const stackParameterNotNullConditionLogicalId = buildStackParameterNotNullConditionLogicalId(key);
      if (!this.stackParameterNotNullConditions[key]) {
        this.stackParameterNotNullConditions[key] = new cdk.CfnCondition(
          this,
          stackParameterNotNullConditionLogicalId,
          {
            expression: cdk.Fn.conditionNot(
              cdk.Fn.conditionEquals(this.configMapping.findInMap(key, ParamType.STACK_PARAMETER), ""),
            ),
          },
        );
      }
    };

    this.getConfigValue = (key: ConfigKey) => {
      createIfNotExistsStackParameterNotNullCondition(key);

      return cdk.Fn.conditionIf(
        this.stackParameterNotNullConditions[key]?.logicalId,
        this.configMapping.findInMap(key, ParamType.STACK_PARAMETER),
        this.configMapping.findInMap(key, ParamType.FETCH_PARAMETER),
      );
    };
  }
}

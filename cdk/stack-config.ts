import { StackConfig } from "./stack-config-builder/stack-config";
import { Stack } from "./stack";
import * as cdk from "aws-cdk-lib";
import { v4 as uuid } from "uuid";

export const ConfigKeys = {
  EphemeralPrefix: "EphemeralPrefix",
  PrivateSubnetId: "PrivateSubnetId",
  PrivateSubnetAvailabilityZone: "PrivateSubnetAvailabilityZone",
  PrivateSubnetRouteTableId: "PrivateSubnetRouteTableId",
  VpcId: "VpcId",
  AwsEnv: "AwsEnv",
  S3PrimaryRegion: "S3PrimaryRegion",
  DocumentTemplatesBucketArn: "DocumentTemplatesBucketArn",
  DocumentTemplatesS3KeyPrefix: "DocumentTemplatesS3KeyPrefix",
  DocumentTemplatesDynamodbTableArn: "DocumentTemplatesDynamodbTableArn",
  DocumentTemplatesDynamodbPartitionKeyPrefix: "DocumentTemplatesDynamodbPartitionKeyPrefix",
  GeneratedDocumentsBucketArn: "GeneratedDocumentsBucketArn",
  GeneratedDocumentsS3KeyPrefix: "GeneratedDocumentsS3KeyPrefix",
  GeneratedDocumentsDynamodbTableArn: "GeneratedDocumentsDynamodbTableArn",
  GeneratedDocumentsDynamodbPartitionKeyPrefix: "GeneratedDocumentsDynamodbPartitionKeyPrefix",
  ApiKey: "ApiKey",
};

export const DEFAULT_VALUES = {
  AWS_ENV: "DEV",
  AWS_ENV_EPHEMERAL: "DEV",
  DOCUMENT_TEMPLATES_S3_KEY_PREFIX: "document_templates",
  DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX: "DOCUMENT_TEMPLATE",
  GENERATED_DOCUMENTS_S3_KEY_PREFIX: "generated_documents",
  GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX: "GENERATED_DOCUMENT",
};

export let AwsEnvParameter: cdk.CfnParameter;
export let stackConfig;

export const initializeStackConfig = (stack: Stack) => {
  AwsEnvParameter = new cdk.CfnParameter(stack, "AwsEnvParameter", {
    type: "String",
    description: "The AWS environment deployed to",
    default: stack.isEphemeralStack() ? DEFAULT_VALUES.AWS_ENV_EPHEMERAL : DEFAULT_VALUES.AWS_ENV,
    allowedValues: ["EPHEMERAL", "DEV", "TEST", "STAGING", "PROD"],
  });

  stackConfig = StackConfig.create(stack)
    .set(ConfigKeys.EphemeralPrefix, stack.ephemeralPrefix)
    .set(ConfigKeys.VpcId, "vpc-058c5ee1e09681197")
    .set(ConfigKeys.PrivateSubnetId, "subnet-036f5f2f9c607cf2a")
    .set(ConfigKeys.PrivateSubnetAvailabilityZone, "us-east-2a")
    .set(ConfigKeys.PrivateSubnetRouteTableId, "rtb-00b7d5ea4cdb82c73")
    .set(ConfigKeys.AwsEnv, {
      cfnParameter: AwsEnvParameter,
    })
    .set(ConfigKeys.S3PrimaryRegion, {
      cfnParameter: new cdk.CfnParameter(stack, "S3PrimaryRegion", {
        type: "String",
        description: "Primary region for s3 buckets/client",
        default: "",
      }),
      query: cdk.Fn.sub("{{resolve:ssm:/${AwsEnv}/processproof-s3-buckets-primary-region}}", {
        AwsEnv: AwsEnvParameter.valueAsString,
      }),
    })
    .set(ConfigKeys.DocumentTemplatesBucketArn, {
      cfnParameter: new cdk.CfnParameter(stack, "DocumentTemplatesBucketArn", {
        type: "String",
        description: "ARN of the document templates bucket",
        default: "",
      }),
      query: cdk.Fn.sub(
        "{{resolve:ssm:/${AwsEnv}/processproof-s3-buckets/document-template-service-filestore-bucket-arn}}",
        {
          AwsEnv: AwsEnvParameter.valueAsString,
        },
      ),
    })
    .set(ConfigKeys.DocumentTemplatesS3KeyPrefix, {
      cfnParameter: new cdk.CfnParameter(stack, "DocumentTemplatesS3KeyPrefix", {
        type: "String",
        description: "S3 key prefix for document templates",
        default: DEFAULT_VALUES.DOCUMENT_TEMPLATES_S3_KEY_PREFIX,
      }),
    })
    .set(ConfigKeys.DocumentTemplatesDynamodbTableArn, {
      cfnParameter: new cdk.CfnParameter(stack, "DocumentTemplatesDynamodbTableArn", {
        type: "String",
        description: "ARN of the document templates dynamodb table",
        default: "",
      }),
      query: cdk.Fn.sub(
        "{{resolve:ssm:/${AwsEnv}/processproof-dynamodb-tables/document-template-service-datastore-table-arn}}",
        {
          AwsEnv: AwsEnvParameter.valueAsString,
        },
      ),
    })
    .set(ConfigKeys.DocumentTemplatesDynamodbPartitionKeyPrefix, {
      cfnParameter: new cdk.CfnParameter(stack, "DocumentTemplatesDynamodbPartitionKeyPrefix", {
        type: "String",
        description: "Partition key prefix for document templates dynamodb table",
        default: DEFAULT_VALUES.DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX,
      }),
    })
    .set(ConfigKeys.GeneratedDocumentsBucketArn, {
      cfnParameter: new cdk.CfnParameter(stack, "GeneratedDocumentsBucketArn", {
        type: "String",
        description: "ARN of the generated documents bucket",
        default: "",
      }),
      query: cdk.Fn.sub(
        "{{resolve:ssm:/${AwsEnv}/processproof-s3-buckets/document-template-service-filestore-bucket-arn}}",
        {
          AwsEnv: AwsEnvParameter.valueAsString,
        },
      ),
    })
    .set(ConfigKeys.GeneratedDocumentsS3KeyPrefix, {
      cfnParameter: new cdk.CfnParameter(stack, "GeneratedDocumentsS3KeyPrefix", {
        type: "String",
        description: "S3 key prefix for generated documents",
        default: DEFAULT_VALUES.GENERATED_DOCUMENTS_S3_KEY_PREFIX,
      }),
    })
    .set(ConfigKeys.GeneratedDocumentsDynamodbTableArn, {
      cfnParameter: new cdk.CfnParameter(stack, "GeneratedDocumentsDynamodbTableArn", {
        type: "String",
        description: "ARN of the generated documents dynamodb table",
        default: "",
      }),
      query: cdk.Fn.sub(
        "{{resolve:ssm:/${AwsEnv}/processproof-dynamodb-tables/document-template-service-datastore-table-arn}}",
        {
          AwsEnv: AwsEnvParameter.valueAsString,
        },
      ),
    })
    .set(ConfigKeys.GeneratedDocumentsDynamodbPartitionKeyPrefix, {
      cfnParameter: new cdk.CfnParameter(stack, "GeneratedDocumentsDynamodbPartitionKeyPrefix", {
        type: "String",
        description: "Partition key prefix for generated documents dynamodb table",
        default: DEFAULT_VALUES.GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX,
      }),
    })
    .set(ConfigKeys.ApiKey, {
      cfnParameter: new cdk.CfnParameter(stack, "ApiKey", {
        type: "String",
        description: "API key for the document template service",
        default: uuid(),
      }),
    });

  return stackConfig;
};

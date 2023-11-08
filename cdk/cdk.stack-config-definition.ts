import { StackConfig } from "./stack-config/stack-config";
import * as cdk from "aws-cdk-lib";

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
};

export const ephemeralPrefix = null; // "JLE-Ephemeral-3";
export const isEphemeralStack = () => !!ephemeralPrefix;

export let AwsEnvParameter: cdk.CfnParameter;
export let stackConfig;

export const initializeStackConfig = (stack: cdk.Stack) => {
  AwsEnvParameter = new cdk.CfnParameter(stack, "AwsEnvParameter", {
    type: "String",
    description: "The AWS environment deployed to",
    default: isEphemeralStack() ? "DEV" : "DEV",
    allowedValues: ["EPHEMERAL", "DEV", "TEST", "STAGING", "PROD"],
  });

  stackConfig = StackConfig.create(stack)
    .set(ConfigKeys.EphemeralPrefix, { value: ephemeralPrefix })
    .set(ConfigKeys.VpcId, { value: "vpc-058c5ee1e09681197" })
    .set(ConfigKeys.PrivateSubnetId, { value: "subnet-036f5f2f9c607cf2a" })
    .set(ConfigKeys.PrivateSubnetAvailabilityZone, { value: "us-east-2a" })
    .set(ConfigKeys.PrivateSubnetRouteTableId, { value: "rtb-00b7d5ea4cdb82c73" })
    .set(ConfigKeys.AwsEnv, {
      cfnParameter: AwsEnvParameter,
    })
    .set(ConfigKeys.S3PrimaryRegion, {
      cfnParameter: new cdk.CfnParameter(stack, "S3PrimaryRegion", {
        type: "String",
        description: "Primary region for s3 buckets/client",
        default: "",
      }),
      paramQuery: cdk.Fn.sub("{{resolve:ssm:/${AwsEnv}/processproof-s3-buckets-primary-region}}", {
        AwsEnv: AwsEnvParameter.valueAsString,
      }),
    })
    .set(ConfigKeys.DocumentTemplatesBucketArn, {
      cfnParameter: new cdk.CfnParameter(stack, "DocumentTemplatesBucketArn", {
        type: "String",
        description: "ARN of the document templates bucket",
        default: "",
      }),
      paramQuery: cdk.Fn.sub("{{resolve:ssm:/${AwsEnv}/processproof-s3-buckets/general-private-bucket-arn}}", {
        AwsEnv: AwsEnvParameter.valueAsString,
      }),
    })
    .set(ConfigKeys.DocumentTemplatesS3KeyPrefix, {
      cfnParameter: new cdk.CfnParameter(stack, "DocumentTemplatesS3KeyPrefix", {
        type: "String",
        description: "S3 key prefix for document templates",
        default: "",
      }),
      paramQuery: cdk.Fn.sub(
        "{{resolve:ssm:/${AwsEnv}/processproof-s3-bucket/general-private-bucket/s3-key-prefixes/document-templates}}",
        {
          AwsEnv: AwsEnvParameter.valueAsString,
        },
      ),
    })
    .set(ConfigKeys.DocumentTemplatesDynamodbTableArn, {
      cfnParameter: new cdk.CfnParameter(stack, "DocumentTemplatesDynamodbTableArn", {
        type: "String",
        description: "ARN of the document templates dynamodb table",
        default: "",
      }),
      paramQuery: cdk.Fn.sub(
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
        default: "DOCUMENT_TEMPLATE",
      }),
    })
    .set(ConfigKeys.GeneratedDocumentsBucketArn, {
      cfnParameter: new cdk.CfnParameter(stack, "GeneratedDocumentsBucketArn", {
        type: "String",
        description: "ARN of the generated documents bucket",
        default: "",
      }),
      paramQuery: cdk.Fn.sub("{{resolve:ssm:/${AwsEnv}/processproof-s3-buckets/general-private-bucket-arn}}", {
        AwsEnv: AwsEnvParameter.valueAsString,
      }),
    })
    .set(ConfigKeys.GeneratedDocumentsS3KeyPrefix, {
      cfnParameter: new cdk.CfnParameter(stack, "GeneratedDocumentsS3KeyPrefix", {
        type: "String",
        description: "S3 key prefix for generated documents",
        default: "",
      }),
      paramQuery: cdk.Fn.sub(
        "{{resolve:ssm:/${AwsEnv}/processproof-s3-bucket/general-private-bucket/s3-key-prefixes/generated-documents}}",
        {
          AwsEnv: AwsEnvParameter.valueAsString,
        },
      ),
    })
    .set(ConfigKeys.GeneratedDocumentsDynamodbTableArn, {
      cfnParameter: new cdk.CfnParameter(stack, "GeneratedDocumentsDynamodbTableArn", {
        type: "String",
        description: "ARN of the generated documents dynamodb table",
        default: "",
      }),
      paramQuery: cdk.Fn.sub(
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
        default: "GENERATED_DOCUMENT",
      }),
    });

  return stackConfig;
};

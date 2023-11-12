import * as cdk from "aws-cdk-lib";
import { Stack } from "../stack";

/**
 * I have not found a way to resolve CfnParameter default value from ssm at deploy time
 * - we could do it at synth time, but I don't like that.
 * - I will pick this back up later, for now:
 *  - I'll just use an ifNotNullCondition to failover to a string value, when CfnParameter is null
 *    - string value may be a {{resolve:ssm}} query
 */

export const ephemeralPrefix = "jle";

export class StackConfig {
  static DEFAULT_VALUES = {
    AWS_ENV: "dev",
    AWS_ENV_EPHEMERAL: "dev",
    DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX: "DOCUMENT_TEMPLATE",
    GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX: "GENERATED_DOCUMENT",
  };

  awsEnv: cdk.CfnParameter;

  vpcId: string;
  privateSubnetId: string;
  privateSubnetAvailabilityZone: string;
  privateSubnetRouteTableId: string;

  s3PrimaryRegion: cdk.CfnParameter;
  documentTemplatesBucketArn: cdk.CfnParameter;
  documentTemplatesS3KeyPrefix: cdk.CfnParameter;
  documentTemplatesDynamodbTableArn: cdk.CfnParameter;
  documentTemplatesDynamodbPartitionKeyPrefix: cdk.CfnParameter;
  generatedDocumentsBucketArn: cdk.CfnParameter;
  generatedDocumentsS3KeyPrefix: cdk.CfnParameter;
  generatedDocumentsDynamodbTableArn: cdk.CfnParameter;
  generatedDocumentsDynamodbPartitionKeyPrefix: cdk.CfnParameter;

  constructor(stack: Stack) {
    this.awsEnv = new cdk.CfnParameter(stack, "AwsEnv", {
      type: "String",
      description: "The AWS application environment",
      default: stack.isEphemeralStack()
        ? StackConfig.DEFAULT_VALUES.AWS_ENV_EPHEMERAL
        : StackConfig.DEFAULT_VALUES.AWS_ENV,
      allowedValues: ["dev", "qa", "prod"],
    });

    this.vpcId = "vpc-058c5ee1e09681197";
    this.privateSubnetId = "subnet-036f5f2f9c607cf2a";
    this.privateSubnetAvailabilityZone = "us-east-2a";
    this.privateSubnetRouteTableId = "rtb-00b7d5ea4cdb82c73";

    this.s3PrimaryRegion = new cdk.CfnParameter(stack, "S3PrimaryRegion", {
      type: "String",
      description: "Primary region for s3 buckets/client",
      default: cdk.Fn.sub("{{resolve:ssm:/${AwsEnv}/processproof-s3-buckets-primary-region}}", {
        AwsEnv: this.awsEnv.valueAsString,
      }),
    });

    this.documentTemplatesBucketArn = new cdk.CfnParameter(stack, "DocumentTemplatesBucketArn", {
      type: "String",
      description: "ARN of the document templates bucket",
      default: cdk.Fn.sub("{{resolve:ssm:/${AwsEnv}/processproof-s3-buckets/general-private-bucket-arn}}", {
        AwsEnv: this.awsEnv.valueAsString,
      }),
    });

    this.documentTemplatesS3KeyPrefix = new cdk.CfnParameter(stack, "DocumentTemplatesS3KeyPrefix", {
      type: "String",
      description: "S3 key prefix for document templates",
      default: cdk.Fn.sub(
        "{{resolve:ssm:/${AwsEnv}/processproof-s3-bucket/general-private-bucket/s3-key-prefixes/document-templates}}",
        {
          AwsEnv: this.awsEnv.valueAsString,
        },
      ),
    });

    this.documentTemplatesDynamodbTableArn = new cdk.CfnParameter(stack, "DocumentTemplatesDynamodbTableArn", {
      type: "String",
      description: "ARN of the document templates dynamodb table",
      default: cdk.Fn.sub(
        "{{resolve:ssm:/${AwsEnv}/processproof-dynamodb-tables/document-template-service-datastore-table-arn}}",
        {
          AwsEnv: this.awsEnv.valueAsString,
        },
      ),
    });

    this.documentTemplatesDynamodbPartitionKeyPrefix = new cdk.CfnParameter(
      stack,
      "DocumentTemplatesDynamodbPartitionKeyPrefix",
      {
        type: "String",
        description: "Partition key prefix for document templates dynamodb table",
        default: StackConfig.DEFAULT_VALUES.DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX,
      },
    );

    this.generatedDocumentsBucketArn = new cdk.CfnParameter(stack, "GeneratedDocumentsBucketArn", {
      type: "String",
      description: "ARN of the generated documents bucket",
      default: cdk.Fn.sub("{{resolve:ssm:/${AwsEnv}/processproof-s3-buckets/general-private-bucket-arn}}", {
        AwsEnv: this.awsEnv.valueAsString,
      }),
    });

    this.generatedDocumentsS3KeyPrefix = new cdk.CfnParameter(stack, "GeneratedDocumentsS3KeyPrefix", {
      type: "String",
      description: "S3 key prefix for generated documents",
      default: cdk.Fn.sub(
        "{{resolve:ssm:/${AwsEnv}/processproof-s3-bucket/general-private-bucket/s3-key-prefixes/generated-documents}}",
        {
          AwsEnv: this.awsEnv.valueAsString,
        },
      ),
    });

    this.generatedDocumentsDynamodbTableArn = new cdk.CfnParameter(stack, "GeneratedDocumentsDynamodbTableArn", {
      type: "String",
      description: "ARN of the generated documents dynamodb table",
      default: cdk.Fn.sub("{{resolve:ssm:/${AwsEnv}/processproof-s3-buckets/general-private-bucket-arn}}", {
        AwsEnv: this.awsEnv.valueAsString,
      }),
    });

    this.generatedDocumentsDynamodbPartitionKeyPrefix = new cdk.CfnParameter(stack, "GeneratedDocumentsS3KeyPrefix", {
      type: "String",
      description: "S3 key prefix for generated documents",
      default: StackConfig.DEFAULT_VALUES.GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX,
    });
  }
}

import * as cdk from "aws-cdk-lib";
import { Stack } from "./stack";

export class StackConfig {
  vpcId: string;
  privateSubnetId: string;
  privateSubnetAvailabilityZone: string;
  privateSubnetRouteTableId: string;

  awsEnv: cdk.CfnParameter;
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
    this.vpcId = "vpc-058c5ee1e09681197";
    this.privateSubnetId = "subnet-036f5f2f9c607cf2a";
    this.privateSubnetAvailabilityZone = "us-east-2a";
    this.privateSubnetRouteTableId = "rtb-00b7d5ea4cdb82c73";

    this.awsEnv = new cdk.CfnParameter(stack, "AwsEnv", {
      type: "String",
      description: "The AWS application environment",
      default: "dev",
      allowedValues: ["dev", "qa", "prod"],
    });

    this.s3PrimaryRegion = new cdk.CfnParameter(stack, "S3PrimaryRegion", {
      type: "String",
      description: "Primary region for s3 buckets/client",
      default: "{{resolve:ssm:/dev/processproof-s3-buckets-primary-region}}",
    });

    this.documentTemplatesBucketArn = new cdk.CfnParameter(stack, "DocumentTemplatesBucketArn", {
      type: "String",
      description: "ARN of the document templates bucket",
      default: "{{resolve:ssm:/dev/processproof-s3-buckets/general-private-bucket-arn}}",
    });

    this.documentTemplatesS3KeyPrefix = new cdk.CfnParameter(stack, "DocumentTemplatesS3KeyPrefix", {
      type: "String",
      description: "S3 key prefix for document templates",
      default: "{{resolve:ssm:/dev/processproof-s3-bucket/general-private-bucket/s3-key-prefixes/document-templates}}",
    });

    this.documentTemplatesDynamodbTableArn = new cdk.CfnParameter(stack, "DocumentTemplatesDynamodbTableArn", {
      type: "String",
      description: "ARN of the document templates dynamodb table",
      default: "{{resolve:ssm:/dev/processproof-dynamodb-tables/document-template-service-datastore-table-arn}}",
    });

    this.documentTemplatesDynamodbPartitionKeyPrefix = new cdk.CfnParameter(
      stack,
      "DocumentTemplatesDynamodbPartitionKeyPrefix",
      {
        type: "String",
        description: "Partition key prefix for document templates dynamodb table",
        default: "DOCUMENT_TEMPLATE",
      },
    );

    this.generatedDocumentsBucketArn = new cdk.CfnParameter(stack, "GeneratedDocumentsBucketArn", {
      type: "String",
      description: "ARN of the generated documents bucket",
      default: "{{resolve:ssm:/dev/processproof-s3-buckets/general-private-bucket-arn}}",
    });

    this.generatedDocumentsS3KeyPrefix = new cdk.CfnParameter(stack, "GeneratedDocumentsS3KeyPrefix", {
      type: "String",
      description: "S3 key prefix for generated documents",
      default: "{{resolve:ssm:/dev/processproof-s3-bucket/general-private-bucket/s3-key-prefixes/generated-documents}}",
    });

    this.generatedDocumentsDynamodbTableArn = new cdk.CfnParameter(stack, "GeneratedDocumentsDynamodbTableArn", {
      type: "String",
      description: "ARN of the generated documents dynamodb table",
      default: "{{resolve:ssm:/dev/processproof-s3-buckets/general-private-bucket-arn}}",
    });

    this.generatedDocumentsDynamodbPartitionKeyPrefix = new cdk.CfnParameter(
      stack,
      "GeneratedDocumentsDynamodbPartitionKeyPrefix",
      {
        type: "String",
        description: "S3 key prefix for generated documents",
        default: "GENERATED_DOCUMENT",
      },
    );
  }
}

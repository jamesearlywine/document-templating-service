import * as cdk from "aws-cdk-lib";

export const ephemeralPrefix = "jle";

export class StackConfig {
  ephemeralPrefix: string;
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

  constructor(stack: cdk.Stack) {
    this.ephemeralPrefix = ephemeralPrefix;
    this.awsEnv = new cdk.CfnParameter(stack, "AwsEnv", {
      type: "String",
      description: "The AWS application environment",
      default: "dev",
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
  }
}

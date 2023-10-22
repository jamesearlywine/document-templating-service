// string value indicating the type of storage to use for document templates
export const StorageTypes = {
  AWS_S3: "aws.s3",
};

export type StorageType = keyof typeof StorageTypes;
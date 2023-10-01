import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { RequestPresigningArguments } from "@smithy/types/dist-types/signature";

const DEFAULT_PRESIGNED_URL_OPTIONS: Partial<RequestPresigningArguments> = {
  expiresIn: 60 * 60, // 1 hour
};
export const createPresignedUrl = ({
  region,
  bucket,
  key,
  options,
}: {
  region: string;
  bucket: string;
  key: string;
  options?: RequestPresigningArguments;
}) => {
  const client = new S3Client({ region });
  const command = new PutObjectCommand({ Bucket: bucket, Key: key });

  return getSignedUrl(client, command, {
    ...DEFAULT_PRESIGNED_URL_OPTIONS,
    ...options,
  });
};

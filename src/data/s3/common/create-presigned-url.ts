import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { RequestPresigningArguments } from "@smithy/types/dist-types/signature";
import { ONE_HOUR_SECONDS } from "src/utility/datetime";

export type PresignedUrlData = {
  presignedUrl: string;
  expiresAt: string;
  issuedAt: string;
};

const DEFAULT_PRESIGNED_URL_OPTIONS: Partial<RequestPresigningArguments> = {
  expiresIn: ONE_HOUR_SECONDS, // 1 hour
};
export const createPresignedUrl = async ({
  region,
  bucket,
  key,
  options,
  method,
}: {
  region: string;
  bucket: string;
  key: string;
  options?: RequestPresigningArguments;
  method?: string;
}): Promise<PresignedUrlData> => {
  const client = new S3Client({ region });

  let command;
  switch (method) {
    case "GET":
      command = new GetObjectCommand({ Bucket: bucket, Key: key });
      break;

    case "PUT":
      command = new PutObjectCommand({ Bucket: bucket, Key: key });
      break;

    default:
      command = new GetObjectCommand({ Bucket: bucket, Key: key });
  }

  const presignedUrl = await getSignedUrl(client, command, {
    ...DEFAULT_PRESIGNED_URL_OPTIONS,
    ...options,
  });

  const issuedAt = new Date();
  const expiresAt = new Date(
    issuedAt.getTime() + DEFAULT_PRESIGNED_URL_OPTIONS.expiresIn * 1000,
  );

  return {
    presignedUrl,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
};

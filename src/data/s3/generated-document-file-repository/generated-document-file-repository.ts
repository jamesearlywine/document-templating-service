import GeneratedDocumentFileRepositoryConfig from "./generated-document-file-repository.config";
import { extractFileExtension } from "src/utility/s3/extract-file-name";
import { StorageTypes } from "src/utility/types/storage-types";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { GeneratedDocumentFile } from "./generated-document-file.type";
import { createPresignedUrl } from "src/utility/s3";
import { RequestPresigningArguments } from "@smithy/types/dist-types/signature";
import { GeneratedDocument } from "src/data/domain/generated-document.type";

let initialized: Promise<unknown>;

export const initialize = async () => {
  if (!initialized) {
    initialized = Promise.all([
      await GeneratedDocumentFileRepositoryConfig.initialize(),
    ]);
  }

  return initialized;
};

export const uploadGeneratedDocumentFile = async ({
  id,
  localFilepath,
}: {
  id: string;
  localFilepath: string;
}): Promise<GeneratedDocumentFile> => {
  await GeneratedDocumentFileRepositoryConfig.initialize();

  const fileExtension = extractFileExtension(localFilepath).toLowerCase();
  const filename = `${id}.${fileExtension}`;

  const s3BucketName =
    GeneratedDocumentFileRepositoryConfig.PROCESSPROOF_GENERAL_PRIVATE_BUCKET_NAME;
  const s3Key = `${GeneratedDocumentFileRepositoryConfig.PROCESSPROOF_GENERATED_DOCUMENTS_S3_KEY_PREFIX}/${filename}`;

  const client = new S3Client({
    region:
      GeneratedDocumentFileRepositoryConfig.PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION,
  });
  const command = new PutObjectCommand({ Bucket: s3BucketName, Key: s3Key });
  await client.send(command);

  const storageType = StorageTypes.AWS_S3;

  return {
    documentId: id,
    localFilepath: localFilepath,
    storageType,
    storageLocation: s3BucketName,
    filename,
    fileExtension,
  };
};

export const generatePresignedDownlaodUrlForGeneratedDocument = async ({
  generatedDocument,
  options,
}: {
  generatedDocument: GeneratedDocument;
  options?: RequestPresigningArguments;
}) => {
  return await createPresignedUrl({
    region:
      GeneratedDocumentFileRepositoryConfig.PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION,
    bucket:
      GeneratedDocumentFileRepositoryConfig.PROCESSPROOF_GENERAL_PRIVATE_BUCKET_NAME,
    key: `${GeneratedDocumentFileRepositoryConfig.PROCESSPROOF_GENERATED_DOCUMENTS_S3_KEY_PREFIX}/${generatedDocument.filename}`,
    options,
  });
};

export const GeneratedDocumentFileRepository = {
  initialize,
  uploadGeneratedDocumentFile,
  generatePresignedDownlaodUrlForGeneratedDocument,
};

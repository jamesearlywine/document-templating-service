import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { RequestPresigningArguments } from "@smithy/types/dist-types/signature";
import GeneratedDocumentFileRepositoryConfig from "./generated-document-file-repository.config";
import { extractFileExtension, FileExtension, FileExtensions } from "src/utility/file-management";
import { createPresignedUrl } from "src/data/s3/common";
import { GeneratedDocumentFile } from "./generated-document-file.type";
import { GeneratedDocument } from "src/data/domain/generated-document.type";

import fs from "fs";
import { Readable } from "stream";

let initialized: Promise<unknown>;

export const initialize = async () => {
  if (!initialized) {
    initialized = Promise.all([await GeneratedDocumentFileRepositoryConfig.initialize()]);
  }

  return initialized;
};

export const DEFAULT_FILE_EXTENSION = FileExtensions.PDF;

export const uploadGeneratedDocumentFile = async ({
  id,
  localFilepath,
  fileExtension,
}: {
  id: string;
  localFilepath: string;
  fileExtension?: FileExtension;
}): Promise<GeneratedDocumentFile> => {
  await GeneratedDocumentFileRepositoryConfig.initialize();

  const extractedFileExtension = extractFileExtension(localFilepath).toLowerCase();
  const filename = `${id}.${fileExtension ?? extractedFileExtension ?? DEFAULT_FILE_EXTENSION}`;

  const s3BucketName = GeneratedDocumentFileRepositoryConfig.GENERATED_DOCUMENTS_BUCKET_NAME;
  const s3Key = `${GeneratedDocumentFileRepositoryConfig.GENERATED_DOCUMENTS_S3_KEY_PREFIX}/${filename}`;

  const client = new S3Client({
    region: GeneratedDocumentFileRepositoryConfig.S3_BUCKETS_PRIMARY_REGION,
  });

  const fileStream = fs.createReadStream(localFilepath);
  const fileReadStream = Readable.from(fileStream);
  const fileStat = fs.statSync(localFilepath);
  const contentLength = fileStat.size;
  const command = new PutObjectCommand({
    Bucket: s3BucketName,
    Key: s3Key,
    Body: fileReadStream,
    ContentLength: contentLength,
  });
  await client.send(command);

  return {
    documentId: id,
    localFilepath,
    s3Key,
    s3BucketName,
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
    region: GeneratedDocumentFileRepositoryConfig.S3_BUCKETS_PRIMARY_REGION,
    bucket: GeneratedDocumentFileRepositoryConfig.GENERATED_DOCUMENTS_BUCKET_NAME,
    key: `${GeneratedDocumentFileRepositoryConfig.GENERATED_DOCUMENTS_S3_KEY_PREFIX}/${generatedDocument.filename}`,
    options,
  });
};

export const GeneratedDocumentFileRepository = {
  initialize,
  uploadGeneratedDocumentFile,
  generatePresignedDownlaodUrlForGeneratedDocument,
};

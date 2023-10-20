import GeneratedDocumentFileRepositoryConfig from "./generated-document-file-repository.config";
import { extractFileExtension } from "src/utility/s3/extract-file-name";
import { StorageTypes } from "src/utility/types/storage-types";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { GeneratedDocumentFile } from "./generated-document-file.type";
import { createPresignedUrl } from "src/utility/s3";
import { RequestPresigningArguments } from "@smithy/types/dist-types/signature";
import { GeneratedDocument } from "src/data/domain/generated-document.type";
import {
  FileExtension,
  FileExtensions,
} from "../../../utility/types/file-extension.type";
import fs from "fs";
import {Readable} from "stream";

let initialized: Promise<unknown>;

export const initialize = async () => {
  if (!initialized) {
    initialized = Promise.all([
      await GeneratedDocumentFileRepositoryConfig.initialize(),
    ]);
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

  const extractedFileExtension =
    extractFileExtension(localFilepath).toLowerCase();
  const filename = `${id}.${
    fileExtension ?? extractedFileExtension ?? DEFAULT_FILE_EXTENSION
  }`;

  const s3BucketName =
    GeneratedDocumentFileRepositoryConfig.PROCESSPROOF_GENERAL_PRIVATE_BUCKET_NAME;
  const s3Key = `${GeneratedDocumentFileRepositoryConfig.PROCESSPROOF_GENERATED_DOCUMENTS_S3_KEY_PREFIX}/${filename}`;

  const client = new S3Client({
    region:
      GeneratedDocumentFileRepositoryConfig.PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION,
  });

  const fileStream = fs.createReadStream(localFilepath);
  const fileReadStream = Readable.from(fileStream);
  const fileStat = fs.statSync(localFilepath);
  const contentLength = fileStat.size;
  const command = new PutObjectCommand({ Bucket: s3BucketName, Key: s3Key, Body: fileReadStream, ContentLength: contentLength});
  await client.send(command);

  const storageType = StorageTypes.AWS_S3;

  return {
    documentId: id,
    localFilepath,
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

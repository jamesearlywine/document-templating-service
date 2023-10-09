import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { RequestPresigningArguments } from "@smithy/types/dist-types/signature";
import { DocumentTemplate } from "src/data/domain/document-template.type";
import { createPresignedUrl } from "src/utility/s3/create-presigned-url";
import { ONE_HOUR_SECONDS } from "src/utility/datetime";
import { StorageTypes } from "src/utility/types/storage-types";
import DocumentTemplateFileRepositoryConfig from "./document-template-file-repository.config";

export const ErrorMessages = {
  UNSUPPORTED_STORAGE_TYPE: "Unsupported storage type",
};

let initialized: Promise<unknown>;

export const initialize = async () => {
  if (!initialized) {
    initialized = Promise.all([
      await DocumentTemplateFileRepositoryConfig.initialize(),
    ]);
  }

  return initialized;
};

export const getDocumentTemplateFilePresignedUploadUrl = async (
  id: string,
  options?: RequestPresigningArguments,
): Promise<string> => {
  await DocumentTemplateFileRepository.initialize();

  return await createPresignedUrl({
    bucket:
      DocumentTemplateFileRepositoryConfig.PROCESSPROOF_GENERAL_PRIVATE_BUCKET_NAME,
    key: `${DocumentTemplateFileRepositoryConfig.PROCESSPROOF_DOCUMENT_TEMPLATES_S3_KEY_PREFIX}/${id}/template.docx`,
    region:
      DocumentTemplateFileRepositoryConfig.PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION,
    options: {
      expiresIn: ONE_HOUR_SECONDS,
      ...options,
    },
  });
};

export const getDocumentTemplateFile = async (
  documentTemplate: DocumentTemplate,
) => {
  await DocumentTemplateFileRepository.initialize();

  if (documentTemplate.storageType === StorageTypes.AWS_S3) {
    const s3Client = new S3Client({
      region:
        DocumentTemplateFileRepositoryConfig.PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION,
    });

    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: documentTemplate.storageLocation,
        Key: documentTemplate.storageLocation,
      }),
    );

    return response.Body.transformToString();
  }

  throw new Error(
    `${ErrorMessages.UNSUPPORTED_STORAGE_TYPE}: ${documentTemplate.storageType}`,
  );
};

export const DocumentTemplateFileRepository = {
  initialize,
  getDocumentTemplateFilePresignedUploadUrl,
  getDocumentTemplateFile,
};

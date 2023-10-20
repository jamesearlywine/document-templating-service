import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { RequestPresigningArguments } from "@smithy/types/dist-types/signature";
import { NodeJsClient } from "@smithy/types";
import { DocumentTemplate } from "src/data/domain/document-template.type";
import { createPresignedUrl } from "src/utility/s3/create-presigned-url";
import { ONE_HOUR_SECONDS } from "src/utility/datetime";
import { StorageTypes } from "src/utility/types/storage-types";
import DocumentTemplateFileRepositoryConfig from "./document-template-file-repository.config";
import { PresignedUrlData } from "../../../utility/s3/presigned-url-data.type";
import fs from "fs";
import { Readable } from "stream";

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
): Promise<PresignedUrlData> => {
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
    method: "PUT",
  });
};

const getDocumentTemplateFileFromS3 = async (documentTemplate: DocumentTemplate, localFilepath: string) => {
  const s3Client = new S3Client({
    region:
    DocumentTemplateFileRepositoryConfig.PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION,
  }) as NodeJsClient<S3Client>;

  let response;
  const getObjectCommand=
    new GetObjectCommand({
      Bucket: documentTemplate.storageLocation,
      Key: documentTemplate.filepath,
      ResponseContentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

  try {
    const response = await s3Client.send(getObjectCommand);

    if (response.Body instanceof Readable) {
      const fileStream = fs.createWriteStream(localFilepath);

      response.Body.pipe(fileStream);

      await new Promise((resolve, reject) => {
        fileStream.on("finish", resolve);
        fileStream.on("error", reject);
      });

      console.log(`File downloaded to ${localFilepath}`);
      return true;
    } else {
      console.error("Error: Response body is not a readable stream");
      return false;
    }
  } catch (err) {
    console.error("Error downloading file from S3:", err);
    return false;
  }

  return false;
}

export const getDocumentTemplateFile = async (
  documentTemplate: DocumentTemplate,
  localFilepath: string
) => {
  await DocumentTemplateFileRepository.initialize();

  if (documentTemplate.storageType === StorageTypes.AWS_S3) {
    return getDocumentTemplateFileFromS3(documentTemplate, localFilepath);
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

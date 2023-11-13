import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { RequestPresigningArguments } from "@smithy/types/dist-types/signature";
import { NodeJsClient } from "@smithy/types";
import { DocumentTemplate } from "src/data/domain/document-template.type";
import { createPresignedUrl } from "src/data/s3/common/create-presigned-url";
import { ONE_HOUR_SECONDS } from "src/utility/datetime";
import DocumentTemplateFileRepositoryConfig from "./document-template-file-repository.config";
import { PresignedUrlData } from "../common/";
import fs from "fs";
import { Readable } from "stream";

let initialized: Promise<unknown>;

export const initialize = async () => {
  if (!initialized) {
    initialized = Promise.all([await DocumentTemplateFileRepositoryConfig.initialize()]);
  }

  return initialized;
};

export const getDocumentTemplateFilePresignedUploadUrl = async (
  id: string,
  options?: RequestPresigningArguments,
): Promise<PresignedUrlData> => {
  await DocumentTemplateFileRepository.initialize();

  return await createPresignedUrl({
    bucket: DocumentTemplateFileRepositoryConfig.DOCUMENT_TEMPLATES_BUCKET_NAME,
    key: `${DocumentTemplateFileRepositoryConfig.DOCUMENT_TEMPLATES_S3_KEY_PREFIX}/${id}/template.docx`,
    region: DocumentTemplateFileRepositoryConfig.S3_BUCKETS_PRIMARY_REGION,
    options: {
      expiresIn: ONE_HOUR_SECONDS,
      ...options,
    },
    method: "PUT",
  });
};

const getDocumentTemplateFileFromS3 = async (documentTemplate: DocumentTemplate, localFilepath: string) => {
  const s3Client = new S3Client({
    region: DocumentTemplateFileRepositoryConfig.S3_BUCKETS_PRIMARY_REGION,
  }) as NodeJsClient<S3Client>;

  let response;
  const getObjectCommand = new GetObjectCommand({
    Bucket: documentTemplate.storageLocation,
    Key: documentTemplate.filepath,
    ResponseContentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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
};

export const getDocumentTemplateFile = async (documentTemplate: DocumentTemplate, localFilepath: string) => {
  await DocumentTemplateFileRepository.initialize();

  return getDocumentTemplateFileFromS3(documentTemplate, localFilepath);
};

export const DocumentTemplateFileRepository = {
  initialize,
  getDocumentTemplateFilePresignedUploadUrl,
  getDocumentTemplateFile,
};

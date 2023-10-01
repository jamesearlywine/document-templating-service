import { RequestPresigningArguments } from "@smithy/types/dist-types/signature";
import { createPresignedUrl } from "src/utility/s3/presigned-url";
import DocumentTemplateFileRepositoryConfig from "./document-template-file-repository.config";
import { ONE_HOUR_SECONDS } from "src/utility/datetime";

export const getDocumentTemplateFilePresignedUploadUrl = async (
  id: string,
  options?: RequestPresigningArguments,
): Promise<string> => {
  await DocumentTemplateFileRepositoryConfig.initialize();

  const randomCharacters: string = Math.random().toString(36).substring(2, 15);

  return await createPresignedUrl({
    bucket:
      DocumentTemplateFileRepositoryConfig.PROCESSPROOF_GENERAL_PRIVATE_BUCKET_NAME,
    key: `${DocumentTemplateFileRepositoryConfig.PROCESSPROOF_DOCUMENT_TEMPLATES_S3_KEY_PREFIX}/${id}/template-${randomCharacters}.docx`,
    region:
      DocumentTemplateFileRepositoryConfig.PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION,
    options: {
      expiresIn: ONE_HOUR_SECONDS,
      ...options,
    },
  });
};

export const DocumentTemplateFileRepository = {
  getDocumentTemplateFilePresignedUploadUrl,
};

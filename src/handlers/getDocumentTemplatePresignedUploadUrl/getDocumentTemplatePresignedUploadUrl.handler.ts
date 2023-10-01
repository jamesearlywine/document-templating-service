import { DocumentTemplateRepository } from "src/data/dynamo/document-template-repository";
import { DocumentTemplateFileRepository } from "src/data/s3/document-template-file-repository";
import { GetDocumentTemplatePresignedUploadUrlController } from "src/handlers/getDocumentTemplatePresignedUploadUrl/getDocumentTemplatePresignedUploadUrl.controller";

DocumentTemplateRepository.initialize();
DocumentTemplateFileRepository.initialize();

export const handler = async (event: Record<string, unknown>) => {
  const id = (event.pathParameters ?? {})["id"];

  return GetDocumentTemplatePresignedUploadUrlController.GET(id);
};

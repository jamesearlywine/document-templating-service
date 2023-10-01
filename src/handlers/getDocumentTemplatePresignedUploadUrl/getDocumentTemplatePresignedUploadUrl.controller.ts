import { DocumentTemplateFileRepository } from "src/data/s3/document-template-file-repository/document-template-file-repository";
import { DocumentTemplateRepository } from "src/data/dynamo/document-template-repository";

export class GetDocumentTemplatePresignedUploadUrlController {
  static GET = async (templateId: string) => {
    const response =
      await DocumentTemplateRepository.getDocumentTemplateRecordById(
        templateId,
      );
    const template = response.results[0];

    if (!template) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: `No template found with id ${templateId}`,
        }),
      };
    }

    const presignedUploadUrl =
      await DocumentTemplateFileRepository.getDocumentTemplateFilePresignedUploadUrl(
        templateId,
      );

    return { presignedUploadUrl };
  };
}

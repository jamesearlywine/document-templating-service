import { DocumentTemplateFileRepository } from "src/data/s3/document-template-file-repository/document-template-file-repository";
import { DocumentTemplateRepository } from "src/data/dynamo/document-template-repository";
import { getValidationErrors } from "src/handlers/getDocumentTemplatePresignedUploadUrl";

export class GetDocumentTemplatePresignedUploadUrlController {
  static GET = async (templateId: string) => {
    const validationErrors = getValidationErrors(templateId);
    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid request",
          validationErrors,
        }),
      };
    }

    console.log(
      "GetDocumentTemplatePresignedUploadUrlController.GET, templateId: ",
      templateId,
    );

    const response =
      await DocumentTemplateRepository.getDocumentTemplateRecordById(
        templateId,
      );

    console.log("fetched template from dynamodb, response: ", response);
    const template = response.results[0];

    if (!template) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: `No template found with id ${templateId}`,
        }),
      };
    }

    const presignedUploadUrlData =
      await DocumentTemplateFileRepository.getDocumentTemplateFilePresignedUploadUrl(
        templateId,
      );
    const presignedUploadUrl = presignedUploadUrlData.presignedUrl;

    return { presignedUploadUrl };
  };
}

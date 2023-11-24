import { DocumentTemplateRepository } from "src/data/dynamo/document-template-repository";
import { getValidationErrors } from "./getDocumentTemplates.inputValidator";

export class GetDocumentTemplateController {
  static GET = async (docType: string) => {
    console.log("GetDocumentTemplatesController.GET, docType: ", docType);

    const validationErrors = getValidationErrors(docType);
    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid request",
          validationErrors,
        }),
      };
    }

    const response = docType
      ? await DocumentTemplateRepository.getDocumentTemplateRecordsByDocType(docType)
      : await DocumentTemplateRepository.getAllDocumentTemplateRecords();

    const documentTemplates = response.results;

    if (!documentTemplates || documentTemplates.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: `No template found with docType: '${docType}'`,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        documentTemplates,
      }),
    };
  };
}

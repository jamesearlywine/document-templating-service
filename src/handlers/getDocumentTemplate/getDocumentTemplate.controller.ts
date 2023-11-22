import { DocumentTemplateRepository } from "src/data/dynamo/document-template-repository";
import { getValidationErrors } from "./getDocumentTemplate.inputValidator";

export class GetDocumentTemplateController {
  static GET = async (id: string) => {
    console.log("GetDocumentTemplateController.GET, id: ", id);

    const validationErrors = getValidationErrors(id);
    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid request",
          validationErrors,
        }),
      };
    }

    const response = await DocumentTemplateRepository.getDocumentTemplateRecordById(id);

    if (!response || response.results.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: `No template found with id: '${id}'`,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(response.results[0]),
    };
  };
}

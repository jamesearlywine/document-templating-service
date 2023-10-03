import { DocumentTemplateRepository } from "src/data/dynamo/document-template-repository";
import { getValidationErrors } from "./deleteDocumentTemplate.inputValidator";

export class DeleteDocumentTemplateController {
  static DELETE = async (id: string) => {
    console.log("DeleteDocumentTemplateController.DELETE, id: ", id);

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

    const response =
      await DocumentTemplateRepository.deleteDocumentTemplateRecordById(id);

    if (
      !response?.Attributes ||
      Object.keys(response.Attributes).length === 0
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `Template not deleted, template id: '${id}'`,
        }),
      };
    }

    return { statusCode: 200 };
  };
}

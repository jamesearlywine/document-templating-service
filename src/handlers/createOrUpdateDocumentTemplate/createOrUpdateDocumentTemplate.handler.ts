import DocumentTemplateRepositoryConfig from "src/data/dynamo/document-template-repository/document-template-repository.config";
import { CreateOrUpdateDocumentTemplateController } from "src/handlers/createOrUpdateDocumentTemplate/createOrUpdateDocumentTemplate.controller";
import { DocumentTemplate } from "src/data/domain/document-template.type";
import { Optional } from "utility-types";
import { getValidationErrors } from "src/handlers/createOrUpdateDocumentTemplate/createOrUpdateDocumentTemplate.inputValidator";

DocumentTemplateRepositoryConfig.initialize();

export const handler = async (event: Record<string, unknown>) => {
  console.log("createOrUpdateDocumentTemplate.handler, event", event);

  const requestBody = JSON.parse(event.body as string) as Optional<
    DocumentTemplate,
    "id"
  >;
  const id = (event.pathParameters ?? {})["id"] || requestBody.id || null;

  return CreateOrUpdateDocumentTemplateController.PUT(id, requestBody);
};

import { DocumentTemplateRepository } from "src/data/dynamo/document-template-repository";
import { DeleteDocumentTemplateController } from "src/handlers/deleteDocumentTemplate/deleteDocumentTemplate.controller";

DocumentTemplateRepository.initialize();

export const handler = async (event: Record<string, unknown>) => {
  console.log("deleteDocumentTemplate.handler, event", event);

  const id = (event.pathParameters ?? {})["id"];

  return DeleteDocumentTemplateController.DELETE(id);
};

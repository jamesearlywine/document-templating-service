import { DocumentTemplateRepository } from "src/data/dynamo/document-template-repository";
import { GetDocumentTemplateController } from "./getDocumentTemplate.controller";

DocumentTemplateRepository.initialize();

export const handler = async (event: Record<string, unknown>) => {
  console.log("getDocumentTemplate.handler, event", event);

  const docType = (event.pathParameters ?? {})["id"];

  return GetDocumentTemplateController.GET(docType);
};

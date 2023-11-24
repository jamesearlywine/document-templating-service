import { DocumentTemplateRepository } from "src/data/dynamo/document-template-repository";
import { GetDocumentTemplateController } from "./getDocumentTemplates.controller";

DocumentTemplateRepository.initialize();

export const handler = async (event: Record<string, unknown>) => {
  console.log("getDocumentTemplates.handler, *** event", event);

  const docType = (event.queryStringParameters ?? {})["docType"];

  return GetDocumentTemplateController.GET(docType);
};

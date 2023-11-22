import { DocumentTemplateRepository } from "src/data/dynamo/document-template-repository";
import { GetDocumentTemplateController } from "./getDocumentTemplate.controller";

DocumentTemplateRepository.initialize();
export const handler = async (event: Record<string, unknown>) => {
  console.log("getDocumentTemplate.handler, event", event);

  const id = (event.pathParameters ?? {})["id"];

  let response;
  try {
    response = GetDocumentTemplateController.GET(id);
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }

  return response;
};

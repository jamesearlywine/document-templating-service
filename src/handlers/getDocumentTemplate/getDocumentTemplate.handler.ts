import { DocumentTemplateRepository } from "src/data/dynamo/document-template-repository";
import { GetDocumentTemplateController } from "./getDocumentTemplate.controller";

DocumentTemplateRepository.initialize();
export const handler = async (event: Record<string, unknown>) => {
  console.log("getDocumentTemplate.handler, event", event);

  const id = (event.pathParameters ?? {})["id"];

  let responseBody;
  try {
    responseBody = GetDocumentTemplateController.GET(id);
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(responseBody),
    headers: {
      "Content-Type": "application/json",
    },
  };
};

import { GeneratedDocumentController } from "./generatedDocument.controller";
import { DocumentConversionService } from "src/services/document-conversion-service";

DocumentConversionService.initialize();

export const handler = async (event: Record<string, unknown>) => {
  const templateId = (event.pathParameters ?? {})["templateId"];
  const data = JSON.parse(event.body as string) as Record<string, string>;

  const response = GeneratedDocumentController.POST(templateId, data);
  console.log("createGeneratedDocument.handler, response: ", response);

  return response;
};

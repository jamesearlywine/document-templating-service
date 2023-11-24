import { GeneratedDocumentController } from "./generatedDocument.controller";
import { DocumentConversionService } from "src/services/document-conversion-service";

DocumentConversionService.initialize();

export const handler = async (event: Record<string, unknown>) => {
  console.log("createGeneratedDocument.handler, event", event);

  const templateId = (event.pathParameters ?? {})["templateId"];
  const data = JSON.parse(event.body as string) as Record<string, string>;

  return GeneratedDocumentController.POST(templateId, data);
};

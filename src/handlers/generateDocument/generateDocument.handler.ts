import { GenerateDocumentController } from "./generateDocument.controller";
import { DocumentConversionService } from "src/services/document-conversion-service";

DocumentConversionService.initialize();

export const handler = async (event: Record<string, unknown>) => {
  console.log("hello, from :: postGeneratedDocument.handler, event", event);

  const templateId = (event.pathParameters ?? {})["id"];
  const data = JSON.parse(event.body as string) as Record<string, string>;

  return GenerateDocumentController.POST(templateId, data);
};

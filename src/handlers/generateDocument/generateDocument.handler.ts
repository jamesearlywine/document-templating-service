import axios from "axios";
import DocumentConversionServiceConfig from "src/services/document-conversion-service/document-conversion-service.config";
import { GenerateDocumentController } from "./generateDocument.controller";
import { Optional } from "utility-types";
import { DocumentTemplate } from "../../data/domain/document-template.type";

// DocumentConversionServiceConfig.initialize();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler = async (event: Record<string, unknown>) => {
  console.log("hello, from :: postGeneratedDocument.handler, event", event);

  const templateId = (event.pathParameters ?? {})["id"];
  const data = JSON.parse(event.body as string) as Record<string, string>;

  // await DocumentConversionServiceConfig.initialize();

  // return GenerateDocumentController.POST(templateId, data);
};

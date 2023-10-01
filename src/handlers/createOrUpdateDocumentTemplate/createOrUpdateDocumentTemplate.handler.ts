import { DocumentTemplateRepository } from "src/data/dynamo/document-template-repository";
import { DocumentTemplateFileRepository } from "src/data/s3/document-template-file-repository";
import { CreateOrUpdateDocumentTemplateController } from "src/handlers/createOrUpdateDocumentTemplate/createOrUpdateDocumentTemplate.controller";
import { DocumentTemplate } from "src/data/domain/document-template.type";
import { Optional } from "utility-types";
import { v4 as uuid } from "uuid";

DocumentTemplateRepository.initialize();
DocumentTemplateFileRepository.initialize();

export const handler = async (event: Record<string, unknown>) => {
  console.log("createOrUpdateDocumentTemplate.handler, event", event);

  const requestBody = JSON.parse(event.body as string) as Optional<
    DocumentTemplate,
    "id"
  >;
  const id = (event.pathParameters ?? {})["id"] || requestBody.id || uuid();

  return CreateOrUpdateDocumentTemplateController.PUT(id, requestBody);
};

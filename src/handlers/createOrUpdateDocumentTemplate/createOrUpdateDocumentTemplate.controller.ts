import { DocumentTemplateRepository } from "src/data/dynamo/document-template-repository/document-template-repository";
import {
  DOCUMENT_TEMPLATE_LATEST_SCHEMA_VERSION,
  DocumentTemplate,
} from "src/data/domain/document-template.type";
import { Optional } from "utility-types";
import { getValidationErrors } from "src/handlers/createOrUpdateDocumentTemplate/createOrUpdateDocumentTemplate.inputValidator";
import { sampleDocumentDataByDocumentType } from "src/data/domain/fixtures/sample-document-data-by-document-type";
import { mapDocumentTemplateDynamoRecord } from "src/data/dynamo/document-template-repository/document-template-dynamo-record";
import { DocumentTemplateFileRepository } from "src/data/s3/document-template-file-repository/document-template-file-repository";

export class CreateOrUpdateDocumentTemplateController {
  static PUT = async (
    id: string,
    requestBody: Optional<DocumentTemplate, "id">,
  ) => {
    const templateId = id || requestBody.id || null;

    const validationErrors = getValidationErrors(id, requestBody);
    if (validationErrors.length > 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Invalid request",
          validationErrors,
        }),
      };
    }

    const [
      documentTemplateByIdResponse,
      documentTemplateByTemplateNameResponse,
    ] = await Promise.all([
      DocumentTemplateRepository.getDocumentTemplateRecordById(templateId),
      DocumentTemplateRepository.getDocumentTemplateRecordByTemplateName(
        requestBody.templateName,
      ),
    ]);

    const existingDocumentTemplate =
      documentTemplateByIdResponse.Count === 1
        ? documentTemplateByIdResponse.results[0]
        : null;

    if (
      documentTemplateByTemplateNameResponse.Count > 0 &&
      documentTemplateByTemplateNameResponse.results[0].id !== templateId
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: `A template with the name ${requestBody.templateName} already exists`,
        }),
      };
    }

    const sampleDocumentData =
      requestBody.sampleDocumentData ||
      sampleDocumentDataByDocumentType[requestBody.docType.toLowerCase()] ||
      {};

    const templateKeyDescriptions =
      requestBody.templateKeyDescriptions ||
      Object.keys(sampleDocumentData).reduce((acc, key) => {
        acc[key] = key;
        return acc;
      }, {});

    const presignedUploadUrl =
      await DocumentTemplateFileRepository.getDocumentTemplateFilePresignedUploadUrl(
        templateId,
      );

    const newDocumentTemplate = {
      ...documentTemplateByIdResponse.results[0],
      ...requestBody,
      id: templateId,
      type: "processproof:DocumentTemplate" as const,
      schemaVersion:
        requestBody.schemaVersion || DOCUMENT_TEMPLATE_LATEST_SCHEMA_VERSION,

      sampleDocumentData,
      templateKeyDescriptions,
      updated: new Date().toISOString(),
      created:
        documentTemplateByIdResponse.Count > 0
          ? documentTemplateByIdResponse.results[0].created
          : new Date().toISOString(),
    };

    const dynamoResponse = await DocumentTemplateRepository.putDocumentTemplate(
      mapDocumentTemplateDynamoRecord.fromDocumentTemplate(newDocumentTemplate),
    );

    return { documentTemplate: newDocumentTemplate, presignedUploadUrl };
  };
}

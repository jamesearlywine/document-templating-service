import { DocumentTemplateDynamoRecord } from "src/data/dynamo/document-template-repository";

export type DocumentTemplate = DocumentTemplateV1;

export const PROCESSPROOF_DOCUMENT_TEMPLATE_TYPE =
  "processproof:DocumentTemplate";

export const DOCUMENT_TEMPLATE_LATEST_SCHEMA_VERSION = "V1";

export type DocumentTemplateV1 = {
  id: string;
  type: "processproof:DocumentTemplate";
  schemaVersion: "V1";
  docType: string;
  templateName: string;
  description: string;
  templateKeyDescriptions?: Record<string, string>;
  sampleDocumentData?: Record<string, string>;
  sampleGeneratedDocumentUrl?: string;
  storageType?: string;
  storageLocation?: string;
  filepath?: string;
  fileExtension?: string;
  documentTemplateFileUploadedAt?: string;
  documentTemplateFileHash?: string;
  created?: string;
  updated?: string;
};

export const isDocumentTemplateV1 = (
  maybeDocumentTemplateV1: unknown,
): maybeDocumentTemplateV1 is DocumentTemplateV1 => {
  const documentTemplateV1 = maybeDocumentTemplateV1 as DocumentTemplateV1;
  return (
    documentTemplateV1?.type === PROCESSPROOF_DOCUMENT_TEMPLATE_TYPE &&
    documentTemplateV1?.schemaVersion === "V1"
  );
};

export const isDocumentTemplate = (
  maybeDocumentTemplate: unknown,
): maybeDocumentTemplate is DocumentTemplate => {
  return isDocumentTemplateV1(maybeDocumentTemplate);
};

export const hasDocumentTemplateFile = (
  documentTemplate: DocumentTemplate,
): boolean => {
  return (
    !!documentTemplate.storageType &&
    !!documentTemplate.storageLocation &&
    !!documentTemplate.filepath
  );
};

export const DocumentTemplateMapper = {
  fromDocumentTemplateDynamoRecord: (
    documentTemplateDynamoRecord: DocumentTemplateDynamoRecord,
  ): DocumentTemplate => {
    const documentTemplate = {
      ...documentTemplateDynamoRecord,
    };

    delete documentTemplate.PK;
    delete documentTemplate.SK;

    return documentTemplate;
  },
};

export const CreationStatus = {
  PENDING_UPLOAD: "PENDING_UPLOAD",
  COMPLETE: "COMPLETE",
};
export type CreationStatus =
  (typeof CreationStatus)[keyof typeof CreationStatus];

export const PROCESSPROOF_DOCUMENT_TEMPLATE_TYPE =
  "processproof:DocumentTemplate";

export const DOCUMENT_TEMPLATE_LATEST_SCHEMA_VERSION = "V1";

export type DocumentTemplateV1 = {
  type: "processproof:DocumentTemplate";
  schemaVersion: "V1";
  id: string;
  docType: string;
  templateName: string;
  description: string;
  storageType?: string;
  storageLocation?: string;
  filepath?: string;
  fileExtension?: string;
  templateKeyDescriptions?: Record<string, string>;
  sampleDocumentData?: Record<string, string>;
  sampleGeneratedDocumentUrl?: string;
  documentTemplateFileUploadedAt?: string;
  documentTemplateFileHash?: string;
  created?: string;
  updated?: string;
};

export type DocumentTemplate = DocumentTemplateV1;

export const isDocumentTemplateV1 = (
  maybeDocumentTemplateV1: unknown,
): maybeDocumentTemplateV1 is DocumentTemplateV1 => {
  const documentTemplateV1 = maybeDocumentTemplateV1 as DocumentTemplateV1;
  return (
    documentTemplateV1?.type === "processproof:DocumentTemplate" &&
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

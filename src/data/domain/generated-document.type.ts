export const PROCESSPROOF_GENERATED_DOCUMENT_TYPE =
  "processproof:GeneratedDocument";

export const GENERATED_DOCUMENT_LATEST_SCHEMA_VERSION = "V1";

export type GeneratedDocumentV1 = {
  id: string;
  type: "processproof:GeneratedDocument";
  schemaVersion: "V1";
  fromTemplateId: string;
  docType: string;
  documentData: Record<string, string>;
  storageType: string;
  storageLocation: string;
  filename: string;
  fileExtension: string;
  documentName: string;
  documentSecuredHash: string;
  documentSecuredHashAlgorithm: string;
  webUrl?: string;
  presignedDownloadUrl?: string;
  presignedDownloadUrlExpiresAt?: string;
  presignedDownloadUrlIssuedAt?: string;
};

export type GeneratedDocument = GeneratedDocumentV1;

export const isGeneratedDocumentV1 = (
  value: unknown,
): value is GeneratedDocumentV1 => {
  const maybeGeneratedDocumentV1 = value as GeneratedDocumentV1;

  return (
    maybeGeneratedDocumentV1?.type === PROCESSPROOF_GENERATED_DOCUMENT_TYPE &&
    maybeGeneratedDocumentV1?.schemaVersion === "V1"
  );
};

export const createGeneratedDocument = (values: Partial<GeneratedDocument>) => {
  return {
    id: values.id,
    type: PROCESSPROOF_GENERATED_DOCUMENT_TYPE,
    schemaVersion: GENERATED_DOCUMENT_LATEST_SCHEMA_VERSION,
    fromTemplateId: values.fromTemplateId,
    docType: values.docType,
    documentData: values.documentData,
    storageType: values.storageType,
    storageLocation: values.storageLocation,
    filename: values.filename,
    fileExtension: values.fileExtension,
    documentName: values.documentName,
    documentSecuredHash: values.documentSecuredHash,
    documentSecuredHashAlgorithm: values.documentSecuredHashAlgorithm,
    webUrl: values.webUrl,
    presignedDownloadUrl: values.presignedDownloadUrl,
    presignedDownloadUrlExpiresAt: values.presignedDownloadUrlExpiresAt,
    presignedDownloadUrlCreated: values.presignedDownloadUrlIssuedAt,
  };
};

import { SchemaVersionedEntity } from "../common/schema-versioned-entity";

export const GENERATED_DOCUMENT_SCHEMA_TYPE = "DocumentTemplatingService:GeneratedDocument";

export const GENERATED_DOCUMENT_LATEST_SCHEMA_VERSION = "1";

export type GeneratedDocumentV1 = SchemaVersionedEntity & {
  id: string;
  fromTemplateId: string;
  docType: string;
  documentData: Record<string, string>;
  s3BucketName: string;
  s3Key: string;
  filename: string;
  fileExtension: string;
  presignedDownloadUrl?: string;
  presignedDownloadUrlExpiresAt?: string;
  presignedDownloadUrlIssuedAt?: string;
};

export type GeneratedDocument = GeneratedDocumentV1;

export const isGeneratedDocumentV1 = (value: unknown): value is GeneratedDocumentV1 => {
  const maybeGeneratedDocumentV1 = value as GeneratedDocumentV1;

  return (
    maybeGeneratedDocumentV1?._type === GENERATED_DOCUMENT_SCHEMA_TYPE &&
    maybeGeneratedDocumentV1?._schemaVersion === "V1"
  );
};

const isGeneratedDocument = (value: unknown): value is GeneratedDocument => {
  return isGeneratedDocumentV1(value);
};

export const createGeneratedDocument = (values: Partial<GeneratedDocument>): GeneratedDocument => {
  return {
    _type: GENERATED_DOCUMENT_SCHEMA_TYPE,
    _schemaVersion: GENERATED_DOCUMENT_LATEST_SCHEMA_VERSION,
    id: values.id,
    fromTemplateId: values.fromTemplateId,
    docType: values.docType,
    documentData: values.documentData,
    s3BucketName: values.s3BucketName,
    s3Key: values.s3Key,
    filename: values.filename,
    fileExtension: values.fileExtension,
    presignedDownloadUrl: values.presignedDownloadUrl,
    presignedDownloadUrlExpiresAt: values.presignedDownloadUrlExpiresAt,
    presignedDownloadUrlIssuedAt: `${values.presignedDownloadUrlIssuedAt}`,
  };
};

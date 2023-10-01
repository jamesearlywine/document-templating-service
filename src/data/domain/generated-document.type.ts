export type GeneratedDocument = {
  documentId: string;
  s3LocationDocx: string;
  s3LocationPdf: string;
  s3PublicUrl: string;
  documentType: string;
  templateId: string;
  documentData: Record<string, unknown>;
};

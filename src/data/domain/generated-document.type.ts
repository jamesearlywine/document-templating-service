export type GeneratedDocument = {
  id: string;
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

export const createGeneratedDocument = (values: Partial<GeneratedDocument>) => {
  return {
    id: values.id,
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

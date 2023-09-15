import {
  GeneratedDocument,
  GeneratedDocumentType,
} from "src/data/document-templates/generated-document";
import { TemplateData } from "src/data/document-templates/document-template-data";
import { v4 as uuid } from "uuid";
import { DocumentTemplateType } from "src/data/document-templates/document-template";

export const generateDocumentFromTemplateAndData = async ({
  templateId,
  templateData,
}: {
  templateId: string;
  templateData: TemplateData;
}): Promise<GeneratedDocument> => {
  console.log("generateDocumentFromTemplateAndData", {
    templateId,
    templateData,
  });

  // route data to appropriate templating service/method

  // upload generated document to S3, .docx and .pdf

  // create entry in data store for generated document
  const generatedDocument: GeneratedDocument = {
    documentId: uuid(),
    s3LocationDocx: "s3LocationDocx",
    s3LocationPdf: "s3LocationPdf",
    s3PublicUrl: "s3PublicUrl",
    documentType: GeneratedDocumentType.JobAffidavit,
    templateType: DocumentTemplateType.DocxTemplater,
    templateId: "templateId",
    serializedTemplateData: "{}",
  };

  return Promise.resolve(generatedDocument);
};

import { GeneratedDocument } from "src/data/document-templates/generated-document";
import { TemplateData } from "src/data/document-templates/document-template-data";
import { v4 as uuid } from "uuid";
import { DocumentConversionService } from "src/services/document-conversion-service";
import * as DocxTemplater from "src/services/document-templating-service/docxtemplater";
import { Service } from "src/services/service.type";
import DocumentConversionServiceConfig from "src/services/document-conversion-service/document-conversion-service.config";
import DocumentTemplatingServiceConfig from "src/services/document-templating-service/document-templating-service.config";

let initialized: Promise<void>;
export const initialize = async () => {
  if (!initialized) {
    initialized = DocumentConversionServiceConfig.initialize().then(() => {});
  }

  return initialized;
};

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
  await initialize();

  // fetch template by id
  const template = {
    id: "abc-123",
    templateType: "DocxTemplater",
    documentType: "JobAffidavit",
    s3Location: "s3://some-bucket/docxtemplater-templates/abc-123.docx",
  };

  const presignedTemplateUrl =
    "https://some-bucket.s3.amazonaws.com/docxtemplater-templates/abc-123.docx?AWSAccessKeyId=123&Expires=123&Signature=123";

  const documentBaseFilename = uuid();
  const outputDocxFilepath = `/tmp/${documentBaseFilename}.docx`;
  const outputPdfFilepath = `/tmp/${documentBaseFilename}.pdf`;

  // route data+template to appropriate templating service/method
  const templateType =
    template.templateType ??
    DocumentTemplatingServiceConfig.DEFAULT_TEMPLATE_TYPE;

  switch (templateType) {
    case "DocxTemplater":
      DocxTemplater.generateTemplatedContent({
        templateFilepath: presignedTemplateUrl,
        data: templateData,
        outputFilepath: outputDocxFilepath,
      });

      await DocumentConversionService.docxToPdf({
        inputLocation: outputDocxFilepath,
        outputLocation: outputPdfFilepath,
      });

      break;
    default:
      throw new Error(
        `DocumentTemplatingService.generateDocumentFromTemplateAndData(): template.templateType not recognized, value: ${template.templateType}`,
      );
  }

  // upload generated document files to S3, .docx and .pdf

  // create entry in data store for generated document
  const generatedDocument: GeneratedDocument = {
    documentId: uuid(),
    s3LocationDocx: "s3LocationDocx",
    s3LocationPdf: "none",
    s3PublicUrl: "none", // .pdf
    documentType: template.documentType,
    templateType: template.templateType,
    templateId: template.id,
    serializedTemplateData: JSON.stringify(templateData),
  };

  return generatedDocument;
};

export const DocumentTemplatingService: Service & {
  generateDocumentFromTemplateAndData;
} = {
  initialize,
  generateDocumentFromTemplateAndData,
};

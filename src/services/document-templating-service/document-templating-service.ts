import { GeneratedDocument } from "src/data/document-templates/generated-document";
import { TemplateData } from "src/data/document-templates/document-template-data";
import { v4 as uuid } from "uuid";
import { DocumentConversionService } from "src/services/document-conversion-service";
import * as DocxTemplater from "src/services/document-templating-service/docxtemplater";

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
  // fetch template by id
  const template = {
    id: "abc-123",
    templateType: "DocxTemplater",
    documentType: "JobAffidavit",
    s3Location: "s3://some-bucket/docxtemplater-templates/abc-123.docx",
  };

  const presignedTemplateUrl =
    "https://some-bucket.s3.amazonaws.com/docxtemplater-templates/abc-123.docx?AWSAccessKeyId=123&Expires=123&Signature=123";

  const outputDocxFilepath = `/tmp/${uuid()}.docx`;

  // route data+template to appropriate templating service/method
  switch (template.templateType) {
    case "DocxTemplater":
      DocxTemplater.generateTemplatedContent({
        templateFilepath: presignedTemplateUrl,
        data: templateData,
        outputFilepath: outputDocxFilepath,
      });
      break;
    default: // no default case
  }

  // convert .docx to .pdf
  const outputPdfFilepath = `/tmp/${uuid()}.pdf`;
  const pdfConversionParams = {
    inputLocation: outputDocxFilepath,
    outputLocation: outputPdfFilepath,
  };

  await DocumentConversionService.docxToPdf(pdfConversionParams);

  // upload generated document files to S3, .docx and .pdf

  // generate presigned url for .pdf

  // create entry in data store for generated document
  const generatedDocument: GeneratedDocument = {
    documentId: uuid(),
    s3LocationDocx: "s3LocationDocx",
    s3LocationPdf: "s3LocationPdf",
    s3PublicUrl: "s3PublicUrl",
    documentType: template.documentType,
    templateType: template.templateType,
    templateId: template.id,
    serializedTemplateData: JSON.stringify(templateData),
  };

  return Promise.resolve(generatedDocument);
};

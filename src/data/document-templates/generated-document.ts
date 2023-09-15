import { DocumentTemplateType } from "src/data/document-templates/document-template";
import { JsonStringified } from "src/utillity/types/json.types";
import { TemplateData } from "src/data/document-templates/document-template-data";

export const GeneratedDocumentType = {
  JobAffidavit: "JobAffidavit",
};
export type GeneratedDocumentType =
  (typeof GeneratedDocumentType)[keyof typeof GeneratedDocumentType];

export class GeneratedDocument {
  documentId: string;
  s3Location: string;
  s3PublicUrl: string;
  documentType: GeneratedDocumentType;
  templateType: DocumentTemplateType;
  templateId: string;
  serializedTemplateData: JsonStringified<TemplateData>;
}

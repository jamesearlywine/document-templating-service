import { GeneratedDocument } from "src/data/document-templates/generated-document";
import { TemplateData } from "src/data/document-templates/document-template-data";

export const generatedDocumentFromTemplateAndData = async ({
  templateId,
  templateData,
}: {
  templateId: string;
  templateData: TemplateData;
}): Promise<GeneratedDocument> => {
  console.log("generatedDocumentFromTemplateAndData", {
    templateId,
    templateData,
  });

  // route to appropriate template service/method
  const generatedDocument = new GeneratedDocument();

  return Promise.resolve(generatedDocument);
};

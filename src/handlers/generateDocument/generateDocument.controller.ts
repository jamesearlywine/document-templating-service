import { v4 as uuid } from "uuid";
import * as DocxTemplater from "src/services/document-templating-service/docxtemplater";
import { DocumentTemplateRepository } from "src/data/dynamo/document-template-repository";
import { DocumentTemplateFileRepository } from "src/data/s3/document-template-file-repository";
import { DocumentConversionService } from "src/services/document-conversion-service";
import { AppConfig } from "src/config/app-config";

export class GenerateDocumentController {
  static async GET(templateId: string, data: Record<string, unknown>) {
    const generatedDocumentUuid = uuid();
    const OUTPUT_DOCX_FILE_PATH = `${AppConfig.SCRATCH_DIRECTORY}/template--${templateId}.docx`;
    const OUTPUT_PDF_FILE_PATH = `${AppConfig.SCRATCH_DIRECTORY}/template--${templateId}.pdf`;

    const response =
      await DocumentTemplateRepository.getDocumentTemplateRecordById(
        templateId,
      );

    const documentTemplate = response.results[0];

    if (!documentTemplate) {
      throw new Error("Document template not found");
    }

    const templateFileContent =
      await DocumentTemplateFileRepository.getDocumentTemplateFile(
        documentTemplate,
      );

    DocxTemplater.generateTemplatedContent({
      templateFileContent,
      data,
      outputFilepath: OUTPUT_DOCX_FILE_PATH,
    });

    await DocumentConversionService.docxToPdf({
      inputLocation: OUTPUT_DOCX_FILE_PATH,
      outputLocation: OUTPUT_PDF_FILE_PATH,
    });

    // send generated document to S3 (private bucket - share link can be generated later, to copy to public bucket)

    // create entry in data store for generated document

    // return entry data store entry for generated document, with presigned download url good for 1 hour
  }
}

import { v4 as uuid } from "uuid";
import * as DocxTemplater from "src/services/document-templating-service/docxtemplater";
import { DocumentTemplateRepository } from "src/data/dynamo/document-template-repository";
import { DocumentTemplateFileRepository } from "src/data/s3/document-template-file-repository";
import { DocumentConversionService } from "src/services/document-conversion-service";
import { AppConfig } from "src/config/app-config";
import { DocumentTemplate } from "src/data/domain/document-template.type";
import { FileExtensions } from "src/utility/types/file-extensions";
import { GeneratedDocumentFileRepository } from "src/data/s3/generated-document-file-repository";
import { GeneratedDocumentFile } from "../../data/s3/generated-document-file-repository/generated-document-file.type";

export class GenerateDocumentController {
  static async GET(templateId: string, data: Record<string, unknown>) {
    const response =
      await DocumentTemplateRepository.getDocumentTemplateRecordById(
        templateId,
      );
    const documentTemplate: DocumentTemplate = response.results[0];

    const generatedDocumentUuid = uuid();
    const outputDocxFilePath = `${AppConfig.SCRATCH_DIRECTORY}/${documentTemplate.docType}--${generatedDocumentUuid}.${FileExtensions.DOCX}`;
    const outputPdfFilePath = `${AppConfig.SCRATCH_DIRECTORY}/${documentTemplate.docType}--${generatedDocumentUuid}.${FileExtensions.PDF}`;

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
      outputFilepath: outputDocxFilePath,
    });

    await DocumentConversionService.docxToPdf({
      inputLocation: outputDocxFilePath,
      outputLocation: outputPdfFilePath,
    });

    // send generated document to S3 (private bucket - share link can be generated later, including copy to public bucket)
    const generatedDocumentFile: GeneratedDocumentFile =
      await GeneratedDocumentFileRepository.uploadGeneratedDocumentFile({
        id: generatedDocumentUuid,
        localFilepath: outputPdfFilePath,
      });

    const documentSecuredHash = "";

    const docType = documentTemplate.docType;
    const fromTemplateId = documentTemplate.templateName;
    const documentName = `${docType}--${generatedDocumentUuid}.${FileExtensions.PDF}`;

    // return entry data store entry for generated document, with presigned download url good for 1 hour
  }
}

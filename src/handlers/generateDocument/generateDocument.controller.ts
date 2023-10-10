import { v4 as uuid } from "uuid";
import * as fs from "fs";
import * as crypto from "crypto";
import * as DocxTemplater from "src/services/document-templating-service/docxtemplater";
import { DocumentTemplateRepository } from "src/data/dynamo/document-template-repository";
import { DocumentTemplateFileRepository } from "src/data/s3/document-template-file-repository";
import { DocumentConversionService } from "src/services/document-conversion-service";
import { AppConfig } from "src/config/app-config";
import { DocumentTemplate } from "src/data/domain/document-template.type";
import { FileExtensions } from "src/utility/types/file-extension.type";
import { GeneratedDocumentFileRepository } from "src/data/s3/generated-document-file-repository";
import { GeneratedDocumentFile } from "../../data/s3/generated-document-file-repository/generated-document-file.type";
import { HashAlgorithms } from "../../utility/types/hash-algorithm.type";
import {
  createGeneratedDocument,
  GeneratedDocument,
} from "../../data/domain/generated-document.type";

export class GenerateDocumentController {
  static async POST(templateId: string, data: Record<string, string>) {
    console.info("GenerateDocumentController.POST: ", { templateId, data });

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
    console.info(
      "GenerateDocumentController.POST - templateFileContent: ",
      templateFileContent,
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

    const documentSecuredHash = crypto
      .createHash(HashAlgorithms.MD5)
      .update(fs.readFileSync(outputPdfFilePath).toString())
      .digest("hex");

    const generatedDocument: GeneratedDocument = createGeneratedDocument({
      id: generatedDocumentUuid,
      fromTemplateId: documentTemplate.id,
      docType: documentTemplate.docType,
      documentData: data,
      storageType: generatedDocumentFile.storageType,
      storageLocation: generatedDocumentFile.storageLocation,
      filename: generatedDocumentFile.filename,
      fileExtension: generatedDocumentFile.fileExtension,
      documentName: `${documentTemplate.docType}--${generatedDocumentUuid}.${FileExtensions.PDF}`,
      documentSecuredHash,
      documentSecuredHashAlgorithm: HashAlgorithms.MD5,
    });

    const presignedUrlData =
      await GeneratedDocumentFileRepository.generatePresignedDownlaodUrlForGeneratedDocument(
        {
          generatedDocument,
        },
      );

    generatedDocument.presignedDownloadUrlIssuedAt = presignedUrlData.issuedAt;
    generatedDocument.presignedDownloadUrlExpiresAt =
      presignedUrlData.expiresAt;
    generatedDocument.presignedDownloadUrl = presignedUrlData.presignedUrl;

    // store generated document in DynamoDB

    // return entry data store entry for generated document, with presigned download url good for 1 hour
    return generatedDocument;
  }
}

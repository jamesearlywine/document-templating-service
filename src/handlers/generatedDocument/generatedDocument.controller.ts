import { v4 as uuid } from "uuid";
import * as fs from "fs";
import * as crypto from "crypto";
import * as DocxTemplater from "src/utility/docxtemplater";
import { DocumentTemplateRepository } from "src/data/dynamo/document-template-repository";
import { DocumentTemplateFileRepository } from "src/data/s3/document-template-file-repository";
import { DocumentConversionService } from "src/services/document-conversion-service";
import { AppConfig } from "src/config/app-config";
import { DocumentTemplate } from "src/data/domain/document-template.type";
import { FileExtensions } from "src/utility/file-management";
import { GeneratedDocumentFileRepository } from "src/data/s3/generated-document-file-repository";
import { GeneratedDocumentFile } from "../../data/s3/generated-document-file-repository/generated-document-file.type";
import { HashAlgorithms } from "src/utility/common/hash-algorithms";
import {
  createGeneratedDocument,
  GeneratedDocument,
} from "src/data/domain/generated-document.type";

export class GeneratedDocumentController {
  static async POST(templateId: string, data: Record<string, string>) {
    console.info("GenerateDocumentController.POST: ", { templateId, data });

    const response =
      await DocumentTemplateRepository.getDocumentTemplateRecordById(
        templateId,
      );
    const documentTemplate: DocumentTemplate = response.results[0];
    console.info("GenerateDocumentController.POST: ", { documentTemplate });

    const generatedDocumentUuid = uuid();
    const templateFilepath = `${AppConfig.SCRATCH_DIRECTORY}/template--${documentTemplate.id}.${FileExtensions.DOCX}`;
    const outputDocxFilepath = `${AppConfig.SCRATCH_DIRECTORY}/${documentTemplate.docType}--${generatedDocumentUuid}.${FileExtensions.DOCX}`;
    const outputPdfFilepath = `${AppConfig.SCRATCH_DIRECTORY}/${documentTemplate.docType}--${generatedDocumentUuid}.${FileExtensions.PDF}`;

    if (!documentTemplate) {
      throw new Error("Document template not found");
    }

    const s3Response =
      await DocumentTemplateFileRepository.getDocumentTemplateFile(
        documentTemplate,
        templateFilepath,
      );

    await DocxTemplater.generateFromTemplateFile({
      templateFilepath,
      data,
      outputFilepath: outputDocxFilepath,
    });

    await GeneratedDocumentFileRepository.uploadGeneratedDocumentFile({
      id: generatedDocumentUuid,
      localFilepath: outputDocxFilepath,
    });

    await DocumentConversionService.docxToPdf({
      inputLocation: outputDocxFilepath,
      outputLocation: outputPdfFilepath,
    });

    const generatedDocumentPdfFile: GeneratedDocumentFile =
      await GeneratedDocumentFileRepository.uploadGeneratedDocumentFile({
        id: generatedDocumentUuid,
        localFilepath: outputPdfFilepath,
      });

    const generatedDocumentFile = generatedDocumentPdfFile;

    const documentSecuredHash = crypto
      .createHash(HashAlgorithms.MD5)
      .update(fs.readFileSync(outputDocxFilepath).toString())
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
      documentName: `${documentTemplate.docType}--${generatedDocumentUuid}.${FileExtensions.DOCX}`,
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

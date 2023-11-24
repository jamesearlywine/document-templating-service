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
import { createGeneratedDocument, GeneratedDocument } from "src/data/domain/generated-document.type";

export class GeneratedDocumentController {
  static async POST(templateId: string, data: Record<string, string>) {
    console.info("GenerateDocumentController.POST: ", { templateId, data });

    const response = await DocumentTemplateRepository.getDocumentTemplateRecordById(templateId);
    const documentTemplate: DocumentTemplate = response.results[0];
    console.info("GenerateDocumentController.POST: ", { documentTemplate });

    const generatedDocumentUuid = uuid();
    const templateFilepath = `${AppConfig.SCRATCH_DIRECTORY}/template--${documentTemplate.id}.${FileExtensions.DOCX}`;
    const outputDocxFilepath = `${AppConfig.SCRATCH_DIRECTORY}/${documentTemplate.docType}--${generatedDocumentUuid}.${FileExtensions.DOCX}`;
    const outputPdfFilepath = `${AppConfig.SCRATCH_DIRECTORY}/${documentTemplate.docType}--${generatedDocumentUuid}.${FileExtensions.PDF}`;

    if (!documentTemplate) {
      throw new Error("Document template not found");
    }

    const s3Response = await DocumentTemplateFileRepository.getDocumentTemplateFile(documentTemplate, templateFilepath);

    await DocxTemplater.generateFromTemplateFile({
      templateFilepath,
      data,
      outputFilepath: outputDocxFilepath,
    });

    try {
      await GeneratedDocumentFileRepository.uploadGeneratedDocumentFile({
        id: generatedDocumentUuid,
        localFilepath: outputDocxFilepath,
      });
    } catch (error) {
      console.error("Error uploading generated document file to S3: ", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error uploading generated document file to S3",
        }),
      };
    }

    try {
      await DocumentConversionService.docxToPdf({
        inputLocation: outputDocxFilepath,
        outputLocation: outputPdfFilepath,
      });
    } catch (error) {
      console.error("Error converting docx to pdf: ", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error converting docx to pdf",
        }),
      };
    }

    let generatedDocumentPdfFile: GeneratedDocumentFile;
    try {
      generatedDocumentPdfFile = await GeneratedDocumentFileRepository.uploadGeneratedDocumentFile({
        id: generatedDocumentUuid,
        localFilepath: outputPdfFilepath,
      });
    } catch (error) {
      console.error("Error uploading generated document pdf file to S3: ", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error uploading generated document pdf file to S3",
        }),
      };
    }

    const generatedDocumentFile = generatedDocumentPdfFile;

    let documentSecuredHash;
    try {
      documentSecuredHash = crypto
        .createHash(HashAlgorithms.MD5)
        .update(fs.readFileSync(outputDocxFilepath).toString())
        .digest("hex");
    } catch (error) {
      console.error("Error generating document secured hash: ", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error generating document secured hash",
        }),
      };
    }

    let generatedDocument: GeneratedDocument;
    try {
      generatedDocument = createGeneratedDocument({
        id: generatedDocumentUuid,
        fromTemplateId: documentTemplate.id,
        docType: documentTemplate.docType,
        documentData: data,
        s3BucketName: generatedDocumentFile.s3BucketName,
        s3Key: generatedDocumentFile.s3Key,
        filename: generatedDocumentFile.filename,
        fileExtension: generatedDocumentFile.fileExtension,
      });
    } catch (error) {
      console.error("Error creating generated document: ", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error creating generated document",
        }),
      };
    }

    let presignedUrlData;
    try {
      presignedUrlData = await GeneratedDocumentFileRepository.generatePresignedDownlaodUrlForGeneratedDocument({
        generatedDocument,
      });
    } catch (error) {
      console.error("Error generating presigned download url for generated document: ", error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Error generating presigned download url for generated document",
        }),
      };
    }

    generatedDocument.presignedDownloadUrlIssuedAt = presignedUrlData.issuedAt;
    generatedDocument.presignedDownloadUrlExpiresAt = presignedUrlData.expiresAt;
    generatedDocument.presignedDownloadUrl = presignedUrlData.presignedUrl;

    // store generated document in DynamoDB

    // return entry data store entry for generated document, with presigned download url good for 1 hour
    return {
      statusCode: 200,
      body: JSON.stringify({ generatedDocument }),
    };
  }
}

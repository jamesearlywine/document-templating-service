import { DocumentTemplateRepository } from "src/data/dynamo/document-template-repository/document-template-repository";
import { extractFileExtension } from "../../utility/s3/extract-file-name";

export const handler = async (event: {
  version: string; // '0'
  id: string; // '64d7a3a0-6b3a-144a-e8bd-bcb79a76b5c1',
  "detail-type": string; // 'Object Created',
  source: string; // 'aws.s3',
  account: string; // '546515125053',
  time: string; // '2023-10-01T05:00:53Z',
  region: string; // 'us-east-2',
  resources: string[]; // [ 'arn:aws:s3:::processproof-dev-general-private' ]
  detail: {
    version: string; // '0'
    bucket: {
      name: string; // 'processproof-dev-general-private'
    };
    object: {
      key: string; // 'document-templates/79a9a341-03a8-46a6-8c2c-cc34a4efe011/template-3fx6ism8gy6.docx',
      size: number; // 18440,
      etag: string; // 'a84d43b0f8e76924d1556a30bbed6d5a',
      sequencer: string; // '006518FD055E08E858'
    };
    "request-id": string; // 'KSKM7E6BQ35NZYDS',
    requester: string; //'546515125053',
    "source-ip-address": string; // '195.252.198.55',
    reason: string; // 'PutObject'
  };
}) => {
  console.log("afterDocumentTemplateFileUploaded.handler, event: ", event);

  const templateId = event.detail.object.key.split("/")[1];
  const storageType = event.source;
  const storageLocation = event.detail.bucket.name;
  const filepath = event.detail.object.key;
  const fileExtension = extractFileExtension(filepath);

  const dynamoResponse =
    await DocumentTemplateRepository.updateDocumentTemplateRecordById(
      templateId,
      {
        storageType,
        storageLocation,
        filepath,
        fileExtension,
        documentTemplateFileUploadedAt: new Date().toISOString(),
        documentTemplateFileHash: event.detail.object.etag,
      },
    );

  console.log(
    "afterDocumentTemplateFileUploaded.handler, dynamoResponse: ",
    dynamoResponse,
  );
};

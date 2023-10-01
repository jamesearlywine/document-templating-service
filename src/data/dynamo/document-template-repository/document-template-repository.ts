import DocumentTemplateRepositoryConfig from "src/data/dynamo/document-template-repository/document-template-repository.config";
import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { DynamoRepositoryQueryResponse } from "src/data/dynamo/dynamo-respository-query-response.type";
import { DocumentTemplate } from "src/data/domain/document-template.type";
import { composePartitionKey } from "src/data/dynamo/document-template-repository/document-template-dynamo-record";
import { createPresignedUrl } from "src/utility/s3/presigned-url";
import { ONE_HOUR_SECONDS } from "src/utility/datetime";
import { RequestPresigningArguments } from "@smithy/types/dist-types/signature";

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });

export const getDocumentTemplateRecordById = async (
  id: string,
): Promise<DynamoRepositoryQueryResponse> => {
  await DocumentTemplateRepositoryConfig.initialize();

  const dynamoResponse = await dynamoClient.send(
    new QueryCommand({
      TableName:
        DocumentTemplateRepositoryConfig.SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME,
      KeyConditionExpression: "PK = :PK",
      ExpressionAttributeValues: { ":PK": { S: composePartitionKey(id) } },
    }),
  );

  return {
    ...dynamoResponse,
    results: dynamoResponse.Items?.map((item) => unmarshall(item)) ?? [],
  };
};
export const getDocumentTemplateRecordByTemplateName = async (
  templateName: string,
): Promise<DynamoRepositoryQueryResponse> => {
  await DocumentTemplateRepositoryConfig.initialize();

  const dynamoResponse = await dynamoClient.send(
    new QueryCommand({
      TableName:
        DocumentTemplateRepositoryConfig.SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME,
      IndexName: "ByTemplateName",
      KeyConditionExpression: "templateName = :templateName",
      ExpressionAttributeValues: { ":templateName": { S: templateName } },
    }),
  );

  return {
    ...dynamoResponse,
    results: dynamoResponse.Items?.map((item) => unmarshall(item)) ?? [],
  };
};

export const getDocumentTemplateRecordsByDocType = async (
  docType: string,
): Promise<DynamoRepositoryQueryResponse> => {
  await DocumentTemplateRepositoryConfig.initialize();

  const dynamoResponse = await dynamoClient.send(
    new QueryCommand({
      TableName:
        DocumentTemplateRepositoryConfig.SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME,
      IndexName: "ByDocType",
      KeyConditionExpression: "docType = :docType",
      ExpressionAttributeValues: { ":docType": { S: docType } },
    }),
  );

  return {
    ...dynamoResponse,
    results: dynamoResponse.Items.map((item) => unmarshall(item ?? {})) ?? [],
  };
};

export const getDocumentTemplateFilePresignedUploadUrl = async (
  id: string,
  options?: RequestPresigningArguments,
): Promise<string> => {
  return await createPresignedUrl({
    bucket:
      DocumentTemplateRepositoryConfig.PROCESSPROOF_GENERAL_PRIVATE_BUCKET_NAME,
    key: `${DocumentTemplateRepositoryConfig.PROCESSPROOF_DOCUMENT_TEMPLATES_S3_KEY_PREFIX}/${id}/template.docx`,
    region:
      DocumentTemplateRepositoryConfig.PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION,
    options: {
      expiresIn: ONE_HOUR_SECONDS,
      ...options,
    },
  });
};

export const getDocumentTemplateFileById = async (id: string) => {};

export const putDocumentTemplate = async (
  documentTemplate: DocumentTemplate,
): Promise<PutItemCommandOutput> => {
  await DocumentTemplateRepositoryConfig.initialize();

  const dynamoResponse = await dynamoClient.send(
    new PutItemCommand({
      TableName:
        DocumentTemplateRepositoryConfig.SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME,
      Item: marshall(documentTemplate),
    }),
  );

  return dynamoResponse;
};

export const DocumentTemplateRepository = {
  getDocumentTemplateRecordById,
  getDocumentTemplateRecordByTemplateName,
  getDocumentTemplateRecordsByDocType,
  getDocumentTemplateFileById,
  getDocumentTemplateFilePresignedUploadUrl,
  putDocumentTemplate,
};

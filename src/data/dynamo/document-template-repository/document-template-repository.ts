import DocumentTemplateRepositoryConfig from "src/data/dynamo/document-template-repository/document-template-repository.config";
import {
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandOutput,
  QueryCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { DynamoRepositoryQueryResponse } from "src/data/dynamo/dynamo-respository-query-response.type";
import { DocumentTemplate } from "src/data/domain/document-template.type";
import {
  composePartitionKey,
  createDynamoKeysForDocumentTemplate,
  DocumentTemplateDynamoRecord,
} from "src/data/dynamo/document-template-repository/document-template-dynamo-record";
import { generateUpdateExpression } from "src/utility/dynamodb/generate-update-expression";

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

export const putDocumentTemplate = async (
  documentTemplate: DocumentTemplateDynamoRecord,
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

export const updateDocumentTemplateById = async (
  id: string,
  documentTemplate: Partial<DocumentTemplate>,
) => {
  await DocumentTemplateRepositoryConfig.initialize();
  const updateExpression = generateUpdateExpression(documentTemplate);

  const keys = createDynamoKeysForDocumentTemplate({ id });

  const command = new UpdateItemCommand({
    TableName:
      DocumentTemplateRepositoryConfig.SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME,
    Key: {
      PK: { S: keys.PK },
      SK: { S: keys.SK },
    },
    UpdateExpression: updateExpression.UpdateExpression,
    ExpressionAttributeNames: updateExpression.ExpressionAttributeNames,
    ExpressionAttributeValues: updateExpression.ExpressionAttributeValues,
  });

  return await dynamoClient.send(command);
};

export const DocumentTemplateRepository = {
  getDocumentTemplateRecordById,
  getDocumentTemplateRecordByTemplateName,
  getDocumentTemplateRecordsByDocType,
  putDocumentTemplate,
  updateDocumentTemplateById,
};

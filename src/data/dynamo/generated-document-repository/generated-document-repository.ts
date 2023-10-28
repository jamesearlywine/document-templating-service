import DocumentTemplateRepositoryConfig from "src/data/dynamo/document-template-repository/document-template-repository.config";
import {
  DeleteItemCommand,
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandOutput,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { DynamoRepositoryQueryResponse } from "src/data/dynamo/common/dynamo-respository-query-response.type";
import {
  DocumentTemplate,
  DocumentTemplateMapper,
} from "src/data/domain/document-template.type";
import {
  composePartitionKey,
  createDynamoKeysForDocumentTemplate,
  DocumentTemplateDynamoRecord,
} from "src/data/dynamo/document-template-repository/document-template-dynamo-record";
import { generateUpdateExpression } from "src/data/dynamo/common/generate-update-expression";

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });

let initialized;
export const initialize = async () => {
  if (!initialized) {
    initialized = Promise.all([
      await DocumentTemplateRepositoryConfig.initialize(),
    ]);
  }

  return initialized;
};

export const getDocumentTemplateRecordById = async (
  id: string,
): Promise<DynamoRepositoryQueryResponse> => {
  await DocumentTemplateRepositoryConfig.initialize();

  const dynamoResponse = await dynamoClient.send(
    new QueryCommand({
      TableName:
        DocumentTemplateRepositoryConfig.DOCUMENT_TEMPLATE_SERVICE_DATASTORE_DYNAMODB_TABLE_NAME,
      KeyConditionExpression: "PK = :PK",
      ExpressionAttributeValues: { ":PK": { S: composePartitionKey(id) } },
    }),
  );

  return {
    ...dynamoResponse,
    results:
      dynamoResponse.Items?.map((item) =>
        DocumentTemplateMapper.fromDocumentTemplateDynamoRecord(
          unmarshall(item) as DocumentTemplateDynamoRecord,
        ),
      ) ?? [],
  };
};
export const getDocumentTemplateRecordByTemplateName = async (
  templateName: string,
): Promise<DynamoRepositoryQueryResponse> => {
  await DocumentTemplateRepositoryConfig.initialize();

  const dynamoResponse = await dynamoClient.send(
    new QueryCommand({
      TableName:
        DocumentTemplateRepositoryConfig.DOCUMENT_TEMPLATE_SERVICE_DATASTORE_DYNAMODB_TABLE_NAME,
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
        DocumentTemplateRepositoryConfig.DOCUMENT_TEMPLATE_SERVICE_DATASTORE_DYNAMODB_TABLE_NAME,
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

export const getAllDocumentTemplateRecords =
  async (): Promise<DynamoRepositoryQueryResponse> => {
    await DocumentTemplateRepositoryConfig.initialize();

    const dynamoResponse = await dynamoClient.send(
      new ScanCommand({
        TableName:
          DocumentTemplateRepositoryConfig.DOCUMENT_TEMPLATE_SERVICE_DATASTORE_DYNAMODB_TABLE_NAME,
      }),
    );

    return {
      ...dynamoResponse,
      results: dynamoResponse.Items.map((item) => unmarshall(item ?? {})) ?? [],
    };
  };

export const putDocumentTemplateRecord = async (
  documentTemplate: DocumentTemplateDynamoRecord,
): Promise<PutItemCommandOutput> => {
  await DocumentTemplateRepositoryConfig.initialize();

  const dynamoResponse = await dynamoClient.send(
    new PutItemCommand({
      TableName:
        DocumentTemplateRepositoryConfig.DOCUMENT_TEMPLATE_SERVICE_DATASTORE_DYNAMODB_TABLE_NAME,
      Item: marshall(documentTemplate),
    }),
  );

  return dynamoResponse;
};

export const updateDocumentTemplateRecordById = async (
  id: string,
  documentTemplate: Partial<DocumentTemplate>,
) => {
  await DocumentTemplateRepositoryConfig.initialize();
  const updateExpression = generateUpdateExpression(documentTemplate);

  const keys = createDynamoKeysForDocumentTemplate({ id });

  const command = new UpdateItemCommand({
    TableName:
      DocumentTemplateRepositoryConfig.DOCUMENT_TEMPLATE_SERVICE_DATASTORE_DYNAMODB_TABLE_NAME,
    Key: marshall(keys),
    UpdateExpression: updateExpression.UpdateExpression,
    ExpressionAttributeNames: updateExpression.ExpressionAttributeNames,
    ExpressionAttributeValues: updateExpression.ExpressionAttributeValues,
  });

  return await dynamoClient.send(command);
};

export const deleteDocumentTemplateRecordById = async (id: string) => {
  await DocumentTemplateRepositoryConfig.initialize();

  const keys = createDynamoKeysForDocumentTemplate({ id });

  const command = new DeleteItemCommand({
    TableName:
      DocumentTemplateRepositoryConfig.DOCUMENT_TEMPLATE_SERVICE_DATASTORE_DYNAMODB_TABLE_NAME,
    Key: marshall(keys),
    ReturnValues: "ALL_OLD",
  });

  return await dynamoClient.send(command);
};

export const GeneratedDocumentRepository = {
  initialize,
  getDocumentTemplateRecordById,
  getDocumentTemplateRecordByTemplateName,
  getDocumentTemplateRecordsByDocType,
  getAllDocumentTemplateRecords,
  putDocumentTemplateRecord,
  updateDocumentTemplateRecordById,
  deleteDocumentTemplateRecordById,
};

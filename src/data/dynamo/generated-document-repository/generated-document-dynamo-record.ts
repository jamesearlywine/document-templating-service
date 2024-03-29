import { GeneratedDocument } from "src/data/domain/generated-document.type";
import GeneratedDocumentRepositoryConfig from "./generated-document-repository.config";

export type GeneratedDocumentDynamoRecord = GeneratedDocument & {
  PK: string;
  SK: string;
};

export const PARTITION_KEY_PREFIX =
  GeneratedDocumentRepositoryConfig.GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX;
export const SORT_KEY_PREFIX = PARTITION_KEY_PREFIX;

export const composePartitionKey = (id: string) => {
  return `${PARTITION_KEY_PREFIX}#${id}`;
};

export const decomposePartitionKey = (key: string) => {
  const [type, id] = key.split("#");
  return { type, id };
};

export const composeSortKey = (id: string) => {
  return `${SORT_KEY_PREFIX}#${id}`;
};

export const decomposeSortKey = (key: string) => {
  const [type, id] = key.split("#");
  return { type, id };
};

export const createDynamoKeysForGeneratedDocument = (
  generatedDocument: Pick<GeneratedDocument, "id">,
) => {
  return {
    PK: composePartitionKey(generatedDocument.id),
    SK: composeSortKey(generatedDocument.id),
  };
};

export const mapGeneratedDocumentDynamoRecord = {
  fromGeneratedDocument: (
    generatedDocument: GeneratedDocument,
  ): GeneratedDocumentDynamoRecord => {
    return {
      ...createDynamoKeysForGeneratedDocument(generatedDocument),
      ...generatedDocument,
    };
  },
};

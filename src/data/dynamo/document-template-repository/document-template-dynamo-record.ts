import { DocumentTemplate } from "src/data/domain/document-template.type";
import DocumentTemplateRepositoryConfig from "./document-template-repository.config";

export type DocumentTemplateDynamoRecord = DocumentTemplate & {
  PK: string;
  SK: string;
};

export const PARTITION_KEY_PREFIX =
  DocumentTemplateRepositoryConfig.DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX;
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

export const createDynamoKeysForDocumentTemplate = (
  documentTemplate: Pick<DocumentTemplate, "id">,
) => {
  return {
    PK: composePartitionKey(documentTemplate.id),
    SK: composeSortKey(documentTemplate.id),
  };
};

export const mapDocumentTemplateDynamoRecord = {
  fromDocumentTemplate: (
    documentTemplate: DocumentTemplate,
  ): DocumentTemplateDynamoRecord => {
    return {
      ...createDynamoKeysForDocumentTemplate(documentTemplate),
      ...documentTemplate,
    };
  },
};

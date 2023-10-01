import { DocumentTemplate } from "src/data/domain/document-template.type";

export type DocumentTemplateDynamoRecord = DocumentTemplate & {
  PK: string;
  SK: string;
};

export const PARTITION_KEY_PREFIX = "DOCUMENT_TEMPLATE";
export const SORT_KEY_PREFIX = "TEMPLATE_NAME";

export const composePartitionKey = (id: string) => {
  return `${PARTITION_KEY_PREFIX}#${id}`;
};

export const decomposePartitionKey = (key: string) => {
  const [type, id] = key.split("#");
  return { type, id };
};

export const composeSortKey = (templateName: string) => {
  return `${SORT_KEY_PREFIX}#${templateName}`;
};

export const decomposeSortKey = (key: string) => {
  const [type, templateName] = key.split("#");
  return { type, templateName };
};

export const mapDocumentTemplateDynamoRecord = {
  fromDocumentTemplate: (
    documentTemplate: DocumentTemplate,
  ): DocumentTemplateDynamoRecord => {
    return {
      PK: composePartitionKey(documentTemplate.id),
      SK: composeSortKey(documentTemplate.templateName),
      ...documentTemplate,
    };
  },
};

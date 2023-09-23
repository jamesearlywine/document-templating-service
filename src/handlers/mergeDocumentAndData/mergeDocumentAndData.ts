import { ConfigKeys } from "src/services/document-conversion-service";

export const handler = async (event: Record<string, unknown>) => {
  console.log("mergeDocumentAndData", { event, env: process.env });
};

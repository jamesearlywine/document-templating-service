import { ConfigKeys } from "src/services/document-conversion-service";

export const handler = async (event: Record<string, unknown>) => {
  console.log("mergeDocumentAndData", { event });
  console.log("mergeDocumentAndData", {
    gotenbergBaseUrl: process.env[ConfigKeys.GOTENBERG_BASE_URL],
  });
};

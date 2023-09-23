export const handler = async (event: Record<string, unknown>) => {
  console.log("mergeDocumentAndData", { event, env: process.env });
};

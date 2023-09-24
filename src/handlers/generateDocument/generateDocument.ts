import axios from "axios";
import DocumentConversionServiceConfig from "src/services/document-conversion-service/document-conversion-service.config";

const documentConversionServiceConfigInitialized =
  DocumentConversionServiceConfig.initialize();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const handler = async (event: Record<string, unknown>) => {
  await documentConversionServiceConfigInitialized;

  console.log(
    "DocumentConversionServiceConfig",
    DocumentConversionServiceConfig,
  );

  let responseFromGotenberg;
  try {
    responseFromGotenberg = await axios.get(
      DocumentConversionServiceConfig.GOTENBERG_BASE_URL,
    );
  } catch (error) {
    console.error(
      "mergeDocumentAndData.handler, could not fetch rom GOTENBERG_BASE_URL error",
      {
        error,
        GOTENBERG_BASE_URL: DocumentConversionServiceConfig.GOTENBERG_BASE_URL,
      },
    );
  }

  return {
    responseFromGotenberg: responseFromGotenberg?.data ?? "",
  };
};

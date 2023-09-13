import DocumentConversionServiceConfig from "src/services/document-conversion-service/document-conversion-service.config";

export const ServiceNames: Record<string, string> = {
  DocumentConversionServiceConfig: "DocumentConversionServiceConfig",
};

export const initialize = (configurations: {
  [key: keyof typeof ServiceNames]: Record<string, unknown>;
}) => {
  DocumentConversionServiceConfig.initialize(
    configurations[ServiceNames.DocumentConversionServiceConfig],
  );
};

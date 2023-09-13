export default class DocumentConversionServiceConfig {
  static DEFAULT_VALUES = {
    GOTENBERG_BASE_URL: "http://localhost:3000",
  };

  static GOTENBERG_BASE_URL: string =
    DocumentConversionServiceConfig.DEFAULT_VALUES.GOTENBERG_BASE_URL;

  static set(options: Partial<DocumentConversionServiceConfig>) {
    Object.assign(DocumentConversionServiceConfig, options);
  }

  static reset() {
    Object.assign(
      DocumentConversionServiceConfig,
      DocumentConversionServiceConfig.DEFAULT_VALUES,
    );
  }
}

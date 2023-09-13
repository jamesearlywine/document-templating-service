import DocumentConversionServiceConfig from "src/services/document-conversion-service/document-conversion-service.config";

describe("DocumentConversionServiceConfig", () => {
  describe("set()", () => {
    beforeEach(() => {
      DocumentConversionServiceConfig.reset();
    });

    it("should initially have default config values", () => {
      expect(DocumentConversionServiceConfig.GOTENBERG_BASE_URL).toBe(
        DocumentConversionServiceConfig.DEFAULT_VALUES.GOTENBERG_BASE_URL,
      );
    });

    it("should set the values of the config", () => {
      const MOCK_CONFIG_VALUE = "http://some-other-url.com";

      DocumentConversionServiceConfig.set({
        GOTENBERG_BASE_URL: MOCK_CONFIG_VALUE,
      });

      expect(DocumentConversionServiceConfig.GOTENBERG_BASE_URL).toBe(
        MOCK_CONFIG_VALUE,
      );
    });
  });
});

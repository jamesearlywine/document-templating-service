import DocumentConversionServiceConfig, {
  ConfigKeys,
} from "src/services/document-conversion-service/document-conversion-service.config";

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

  describe("reset()", () => {
    it("should reset the config values to their defaults", () => {
      const MOCK_CONFIG_VALUE = "http://some-other-url.com";

      DocumentConversionServiceConfig.set({
        GOTENBERG_BASE_URL: MOCK_CONFIG_VALUE,
      });

      expect(DocumentConversionServiceConfig.GOTENBERG_BASE_URL).toBe(
        MOCK_CONFIG_VALUE,
      );

      DocumentConversionServiceConfig.reset();

      expect(DocumentConversionServiceConfig.GOTENBERG_BASE_URL).toBe(
        DocumentConversionServiceConfig.DEFAULT_VALUES.GOTENBERG_BASE_URL,
      );
    });
  });

  describe("initialize()", () => {
    it("should initialize the config to values set in process.env", async () => {
      const MOCK_CONFIG_VALUE = "http://some-gotenberg-url.com";
      process.env[ConfigKeys.GOTENBERG_BASE_URL] = MOCK_CONFIG_VALUE;

      await DocumentConversionServiceConfig.initialize();

      expect(DocumentConversionServiceConfig.GOTENBERG_BASE_URL).toBe(
        MOCK_CONFIG_VALUE,
      );
    });
  });
});

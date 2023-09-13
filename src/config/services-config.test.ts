import DocumentConversionServiceConfig from "src/services/document-conversion-service/document-conversion-service.config";
import * as ServiceConfig from "src/config/services-config";

describe("ServicesConfig", () => {
  describe("initialize()", () => {
    it("should initialize the DocumentConversionServiceConfig", () => {
      const MOCK_DOCUMENT_CONVERSION_SERVICE_CONFIG = {
        GOTENBERG_BASE_URL: "http://some-url.com",
      };

      ServiceConfig.initialize({
        DocumentConversionServiceConfig:
          MOCK_DOCUMENT_CONVERSION_SERVICE_CONFIG,
      });

      expect(DocumentConversionServiceConfig.GOTENBERG_BASE_URL).toBe(
        MOCK_DOCUMENT_CONVERSION_SERVICE_CONFIG.GOTENBERG_BASE_URL,
      );
    });
  });
});

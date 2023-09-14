import path from "path";
import * as DocumentConversionService from "./document-conversion-service";

const INPUT_FILE_PATH = path.resolve(
  "testing/test-generated-files/output--b0cfb9f7-be9d-446f-84d7-f02ae8ff79b7.docx",
);
const OUTPUT_FILE_NAME = "output--b0cfb9f7-be9d-446f-84d7-f02ae8ff79b7.pdf";
const OUTPUT_FILE_PATH = path.resolve(
  `testing/test-generated-files/${OUTPUT_FILE_NAME}`,
);

describe("DocumentConversionService", () => {
  describe("docxToPdf()", () => {
    it("should call the Gotenberg client", async () => {
      await DocumentConversionService.initialize();

      jest.mock("./document-conversion-service", () => ({
        ...jest.requireActual("./document-conversion-service"),
        toPdf: jest.fn(),
      }));
      const mockedDocumentConversionService = jest.mocked(
        DocumentConversionService,
      );

      const output = await DocumentConversionService.docxToPdf({
        inputLocation: INPUT_FILE_PATH,
        outputLocation: OUTPUT_FILE_PATH,
      });

      expect(mockedDocumentConversionService.toPdf).toHaveBeenCalledWith(
        `file://${INPUT_FILE_PATH}`,
      );
    });
  });
});

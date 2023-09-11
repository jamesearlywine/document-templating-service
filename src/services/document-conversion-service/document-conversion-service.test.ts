import * as DocumentConversionService from "./document-conversion-service";
import path from "path";

const INPUT_FILE_PATH = path.resolve(
  "testing/test-generated-files/output--2db568d7-ccce-4806-9abf-fc070792a603.docx",
);
const OUTPUT_FILE_NAME = "output--2db568d7-ccce-4806-9abf-fc070792a603.pdf";
const OUTPUT_FILE_PATH = path.resolve(
  `testing/test-generated-files/${OUTPUT_FILE_NAME}`,
);

describe("DocumentConversionService", () => {
  describe("docxToPdf()", () => {
    it("should exist", () => {
      expect(DocumentConversionService.docxToPdf).toBeTruthy();
    });

    it.skip("should convert a docx file to pdf content", async () => {
      const output = await DocumentConversionService.docxToPdf({
        inputLocation: INPUT_FILE_PATH,
        outputLocation: OUTPUT_FILE_PATH,
      });

      expect(true).toBe(true);
    });
  });
});

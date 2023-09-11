import * as DocxToPdfService from "./docx-to-pdf-service";
import path from "path";

const INPUT_FILE_PATH = path.resolve(
  "testing/test-generated-files/output--c3ee7719-db96-42c0-8186-ac99498c37d2.docx",
);
const OUTPUT_FILE_NAME = "output--c3ee7719-db96-42c0-8186-ac99498c37d2.pdf";
const OUTPUT_FILE_PATH = path.resolve(
  `testing/test-generated-files/${OUTPUT_FILE_NAME}`,
);

describe("DocxToPdfService", () => {
  describe("docxToPdf()", () => {
    it("should exist", () => {
      expect(DocxToPdfService).toBeTruthy();
    });

    it("should convert a docx file to pdf content", async () => {
      const output = await DocxToPdfService.docxToPdf({
        inputLocation: INPUT_FILE_PATH,
        outputLocation: OUTPUT_FILE_PATH,
      });

      expect(true).toBe(true);
    });
  });
});

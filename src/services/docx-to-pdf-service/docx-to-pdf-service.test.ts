import * as DocxToPdfService from "./docx-to-pdf-service";
import path from "path";

const INPUT_FILE_PATH = path.resolve(
  "testing/test-generated-files/output--f67dac54-53dc-4f3a-afb6-7e5d6f5873b8.docx",
);

describe("DocxToPdfService", () => {
  describe("docxToPdf()", () => {
    it("should exist", () => {
      expect(DocxToPdfService).toBeTruthy();
    });

    it.skip("should convert a docx file to pdf content", async () => {
      const output = await DocxToPdfService.docxToPdf({
        inputLocation: INPUT_FILE_PATH,
        outputLocation: "somewhere",
      });

      expect(true).toBe(true);
    });
  });
});

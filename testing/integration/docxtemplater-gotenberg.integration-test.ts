import path from "path";
import fs from "fs";
import waitForExpect from "wait-for-expect";
import { v4 as uuid } from "uuid";
import { sampleDocumentDataByDocumentType } from "src/data/domain/fixtures/sample-document-data-by-document-type";
import * as DocxTemplater from "src/services/document-templating-service/docxtemplater";
import * as DocumentConversionService from "src/services/document-conversion-service";

import dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, ".env.integration-testing") });

const REMOVE_TEST_GENERATED_FILES = true;

const TEMPLATE_FILE_PATH = path.resolve(
  `${__dirname}/../test-templates/AFFIDAVIT-OF-NON-SERVICE--DOCXTEMPLATER.docx`,
);
const TEST_AFFIDAVIT_TEMPLATE_DATA =
  sampleDocumentDataByDocumentType.jobaffidavit;

const UUID = `${uuid()}`;
const OUTPUT_DOCX_FILE_PATH = path.resolve(
  `${__dirname}/../test-generated-files/output--${UUID}.docx`,
);
const OUTPUT_PDF_FILE_PATH = path.resolve(
  `${__dirname}/../test-generated-files/output--${UUID}.pdf`,
);

// to run the integration tests from IDE, first run `npm run start:gotenberg` from the command line
describe("local end-to-end - docxtemplater->gotenberg", () => {
  describe("docxtemplater->gotenberg", () => {
    it("should generate a .docx and .pdf output from template .docx and data", async () => {
      DocxTemplater.generateTemplatedContentFromFiles({
        templateFilepath: TEMPLATE_FILE_PATH,
        data: TEST_AFFIDAVIT_TEMPLATE_DATA,
        outputFilepath: OUTPUT_DOCX_FILE_PATH,
      });

      await DocumentConversionService.docxToPdf({
        inputLocation: OUTPUT_DOCX_FILE_PATH,
        outputLocation: OUTPUT_PDF_FILE_PATH,
      });

      waitForExpect(() => {
        expect(fs.existsSync(OUTPUT_DOCX_FILE_PATH)).toBe(true);

        // Delete the output .docx file
        if (REMOVE_TEST_GENERATED_FILES) {
          fs.unlinkSync(OUTPUT_DOCX_FILE_PATH);
        }
      }, 5000);
      waitForExpect(() => {
        expect(fs.existsSync(OUTPUT_PDF_FILE_PATH)).toBe(true);

        // Delete the output .pdf file
        if (REMOVE_TEST_GENERATED_FILES) {
          fs.unlinkSync(OUTPUT_PDF_FILE_PATH);
        }
      }, 5000);
    });
  });
});

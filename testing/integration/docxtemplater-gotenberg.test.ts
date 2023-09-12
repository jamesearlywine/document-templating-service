import path from "path";
import { validJobAffidavitTemplateData } from "../../src/data/template-data/job-affidavit/job-affidavit-template-data.fixtures";
import { v4 as uuid } from "uuid";
import * as DocxTemplater from "../../src/services/document-templating-service/docxtemplater";
import * as DocumentConversionService from "../../src/services/document-conversion-service";
//@todo figure out absolute-path module resolution when running jest in a subfolder

const TEMPLATE_FILE_PATH = path.resolve(
  `${__dirname}/../test-templates/AFFIDAVIT-OF-NON-SERVICE--DOCXTEMPLATER.docx`,
);
const TEST_AFFIDAVIT_TEMPLATE_DATA = validJobAffidavitTemplateData;
const UUID = `${uuid()}`;
const OUTPUT_DOCX_FILE_PATH = path.resolve(
  `${__dirname}/../test-generated-files/output--${UUID}.docx`,
);
const OUTPUT_PDF_FILE_PATH = path.resolve(
  `${__dirname}/../test-generated-files/output--${UUID}.pdf`,
);

describe("local end-to-end - docxtemplater->gotenberg", () => {
  describe("docxtemplater->gotenberg", () => {
    it("should generate a pdf from a docx template and data", async () => {
      DocxTemplater.generateTemplatedContent({
        templateFilepath: TEMPLATE_FILE_PATH,
        data: TEST_AFFIDAVIT_TEMPLATE_DATA,
        outputFilepath: OUTPUT_DOCX_FILE_PATH,
      });

      await DocumentConversionService.docxToPdf({
        inputLocation: OUTPUT_DOCX_FILE_PATH,
        outputLocation: OUTPUT_PDF_FILE_PATH,
      });

      expect(true).toBe(true);
    });
  });
});

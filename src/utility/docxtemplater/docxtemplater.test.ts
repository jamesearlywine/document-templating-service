import * as DocxTemplater from "./docxtemplater";
import path from "path";
import WordExtractor from "word-extractor";
import fs from "fs";
import { v4 as uuid } from "uuid";

const JOB_AFFIDAVIT_DOCUMENT_TEMPLATE_DYNAMO_RECORD = fs.readFileSync(
  path.resolve(
    __dirname,
    "../../../testing/test-templates-dummy-data/job-affidavit-document-template-dynamo-record.json",
  ),
  "utf8",
);
const validJobAffidavitTemplateData = JSON.parse(
  JOB_AFFIDAVIT_DOCUMENT_TEMPLATE_DYNAMO_RECORD,
).sampleDummyData;

const TEMPLATE_FILE_PATH = path.resolve(
  __dirname,
  "../../../testing/test-templates/AFFIDAVIT-OF-NON-SERVICE--DOCXTEMPLATER.docx",
);

const OUTPUT_FILE_PATH = path.resolve(
  `testing/test-generated-files/output--${uuid()}.docx`,
);

describe("DocxTemplaterService", () => {
  describe("generateTemplatedContent()", () => {
    afterAll(() => {
      // Delete the output file
      fs.unlinkSync(OUTPUT_FILE_PATH);
    });

    it("should do stuff", async () => {
      DocxTemplater.generateFromTemplateFile({
        templateFilepath: TEMPLATE_FILE_PATH,
        data: validJobAffidavitTemplateData,
        outputFilepath: OUTPUT_FILE_PATH,
      });
      const wordExtractor = new WordExtractor();
      const results = await wordExtractor.extract(OUTPUT_FILE_PATH);

      expect(results.getBody()).toContain(validJobAffidavitTemplateData.jobId);
      expect(results.getBody()).toContain(
        validJobAffidavitTemplateData.jobClientJobNumber,
      );
      expect(results.getBody()).toContain(
        validJobAffidavitTemplateData.jobCaseNumber,
      );
      expect(results.getBody()).toContain(
        validJobAffidavitTemplateData.jobDocumentsToBeServedDescription,
      );
      expect(results.getBody()).toContain(
        validJobAffidavitTemplateData.jobAccountPrimaryPhone,
      );
      expect(results.getBody()).toContain(
        validJobAffidavitTemplateData.jobClientFullName,
      );
      expect(results.getBody()).toContain(
        validJobAffidavitTemplateData.jobCourtCaseDefendant,
      );
      expect(results.getBody()).toContain(
        validJobAffidavitTemplateData.jobCourtCasePlaintiff,
      );
      expect(results.getBody()).toContain(
        validJobAffidavitTemplateData.jobCourtCounty,
      );
      expect(results.getBody()).toContain(
        validJobAffidavitTemplateData.jobCourtName,
      );
      expect(results.getBody()).toContain(
        validJobAffidavitTemplateData.jobOutcome,
      );
      expect(results.getBody()).toContain(
        validJobAffidavitTemplateData.jobProcessServerFullName,
      );
      expect(results.getBody()).toContain(
        validJobAffidavitTemplateData.jobRecipientFullName,
      );
      expect(results.getBody()).toContain(
        validJobAffidavitTemplateData.jobRecipientNameAndAddress,
      );
      expect(results.getBody()).toContain(
        validJobAffidavitTemplateData.jobServiceDocumentDateReceived,
      );
      expect(results.getBody()).toContain(
        validJobAffidavitTemplateData.jobTotalFees,
      );
    });
  });
});

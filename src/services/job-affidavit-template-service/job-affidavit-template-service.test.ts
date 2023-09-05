import { PROJECT_ROOT } from "../../index";
import path from "path";
import { JobAffidavitTemplate } from "./job-affidavit-template/job-affidavit-template";
import { validJobAffidavitTemplateData } from "./job-affidavit-template-data/job-affidavit-template-data.fixtures";
import * as JobAffidavitTemplateService from "./job-affidavit-template-service";

const testAffidavitTemplateFilePath = [
  PROJECT_ROOT,
  "testing",
  "pdftemplate",
  "affidavit_of_non_service__template.docs",
].join(path.sep);

describe("JobAffidavitTemplateService", () => {
  describe("generateJobAffidavit", () => {
    it("should be true", () => {
      const template = JobAffidavitTemplate.from({
        fileLocation: testAffidavitTemplateFilePath,
      });
      const data = validJobAffidavitTemplateData();

      const affidavit = JobAffidavitTemplateService.generateJobAffidavit({
        template,
        data,
      });

      expect(affidavit).toBeTruthy;
    });
  });
});

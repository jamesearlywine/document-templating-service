import {JobAffidavit} from "src/data/domain/job-affidavit";
import {JobAffidavitTemplate} from "src/services/job-affidavit-template-service/job-affidavit-template";
import {JobAffidavitTemplateData} from "./job-affidavit-template-data";

export const generateJobAffidavit =
({data, template}: {
   data: JobAffidavitTemplateData,
   template: JobAffidavitTemplate
 }): JobAffidavit => {

  console.log("JobAffidavitTemplateService.generateJobAffidavit() called with parameters: ", {
    data,
    template
  });

  return {
    type: "processproof:JobAffidavit",
    schemaVersion: "1.0.0",
    id: "1234",
    job_id: "1234",
    system_affidavit_template_id: "1234",
    account_affidavit_template_id: "1234",
    generated_by_user_id: "1234",
    note: "1234",
    md5_digest: "1234",
    created: "1234",
    updated: "1234"
  };
};
import {JobAffidavit} from "src/domain/job-affidavit";
import {PROJECT_ROOT} from "../../index";
import * as fs from "fs";
import * as path from "path";
import {JobAffidavitTemplate} from "./job-affidavit-template/job-affidavit-template";

export const generateJobAffidavit = ({
  data: JobAffidavitTemplateData,
  template: JobAffidavitTemplate

}): JobAffidavit => {


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
}
import { JobAffidavit } from "./index";

export const validJobAffidavit = (
  values: Partial<JobAffidavit>,
): JobAffidavit => {
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
    updated: "1234",
    ...values,
  };
};

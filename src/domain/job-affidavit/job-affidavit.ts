export type JobAffidavit = {
  type: "processproof:JobAffidavit";
  schemaVersion?: string;

  id: string;
  job_id: string;
  system_affidavit_template_id?: string;
  account_affidavit_template_id?: string;
  generated_by_user_id: string;

  note: string;

  md5_digest: string;
  created: string;
  updated: string;
}
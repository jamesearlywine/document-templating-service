import { Job } from "src/domain/job";

export class JobAffidavitTemplateData {
  jobId: string;
  jobClientFullName: string;
  jobRecipientFullName: string;
  jobProcessServerName: string;
  jobRecipientNameAndAddress: string;
  jobOutcome: string;
  jobDocumentsToBeServedDescription: string;
  jobServiceDocumentDateReceived: string;
  jobSerializedListOfServiceAttempts: string;
  jobTotalFees: string;
  jobAccountPrimaryPhone: string;

  jobClientJobNumber?: string;
  jobCourtName?: string;
  jobCaseNumber?: string;
  jobCourtCounty?: string;
  jobCourtCasePlaintiff?: string;
  jobCourtCaseDefendant?: string;
  jobAccountCompanyName?: string;

  // fromJob(job: Job): JobAffidavitTemplateData {
  //   return {
  //     jobId: job.id,
  //     jobClientFullName: job.client.name || job.client.primaryContact.firstName + job.client.primaryContact.lastName,
  //     jobRecipientFullName: job.service.recipient.name,
  //     jobProcessServerName: job.
  //   }
  // }
  //

}


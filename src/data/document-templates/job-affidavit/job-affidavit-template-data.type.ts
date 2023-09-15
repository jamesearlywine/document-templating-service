export interface JobAffidavitTemplateData {
  jobId: string;
  jobClientJobNumber?: string;
  jobCourtName?: string;
  jobCourtCounty?: string;
  jobCaseNumber?: string;
  jobCourtCasePlaintiff?: string;
  jobCourtCaseDefendant?: string;
  jobAccountCompanyName?: string;
  jobClientFullName?: string;
  jobRecipientFullName?: string;
  jobProcessServerFullName?: string;
  jobRecipientNameAndAddress?: string;
  jobOutcome?: string;
  jobDocumentsToBeServedDescription?: string;
  jobServiceDocumentDateReceived?: string;
  jobNewLineDelimitedListOfServiceAttempts?: string;
  jobTotalFees?: string;
  jobAccountPrimaryPhone?: string;
}

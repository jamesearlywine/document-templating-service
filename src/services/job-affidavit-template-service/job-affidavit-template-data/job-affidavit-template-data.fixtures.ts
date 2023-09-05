import {JobAffidavitTemplateData} from "./job-affidavit-template-data.type";

export const validJobAffidavitTemplateData = (values?: Partial<JobAffidavitTemplateData>): JobAffidavitTemplateData => {
  return {
    jobId: "1",
    jobClientFullName: "Person McLawyer",
    jobRecipientFullName: "Jerry McBadguy",
    jobProcessServerName: "Kari McDetective",
    jobRecipientNameAndAddress: "Jerry McBadguy, 8731 N. Frontenac Rd, Indianapolis, IN 46226",
    jobOutcome: "Unsuccessful Attempt",
    jobDocumentsToBeServedDescription: "Subpoena",
    jobServiceDocumentDateReceived: "Not Received",
    jobSerializedListOfServiceAttempts: `
1) Unsuccessful Attempt: Jan 2, 2020, 7:52 pm EST at 123 Some St. Apt 1B, Indinaapolis, IN 46220
Knocked on the door no answer.`,
    jobTotalFees: "$80.00",
    jobAccountPrimaryPhone: "317-555-1212",
    jobClientJobNumber: "ABC123",
    jobCourtName: "Hancock County Court",
    jobCaseNumber: "xyz789",
    jobCourtCounty: "Hancock",
    jobCourtCasePlaintiff: "Jane Doe",
    jobCourtCaseDefendant: "John Doe",
    jobAccountCompanyName: "DueProcess LLC",
    ...values,
  };
};

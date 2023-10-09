import { DocumentTemplateRepository } from "../../src/data/dynamo/document-template-repository";
import fs from "fs";

process.env["SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN"] =
  "arn:aws:dynamodb:us-east-2:546515125053:table/processproof-dev-document-template-service-datastore";

const loadData = async () => {
  const fileJsonContent = fs.readFileSync(
    "../test-templates/dynamodb-records.json",
    "utf8",
  );
  const records = JSON.parse(fileJsonContent);

  for (const record of records) {
    await DocumentTemplateRepository.putDocumentTemplateRecord(record);
  }
};
describe("Load DynamoDB Records", () => {
  it("should load records", async () => {
    await loadData();
  });
});

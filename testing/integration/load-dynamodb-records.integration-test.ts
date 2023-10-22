import { DocumentTemplateRepository } from "../../src/data/dynamo/document-template-repository";
import fs from "fs";
import path from "path";

process.env["DOCUMENT_TEMPLATE_SERVICE_DATASTORE_DYNAMODB_TABLE_ARN"] =
  "arn:aws:dynamodb:us-east-2:546515125053:table/processproof-dev-document-template-service-datastore";

const loadData = async () => {
  const fileJsonContent = fs.readFileSync(
    path.resolve(__dirname, "../test-templates/dynamodb-records.json"),
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

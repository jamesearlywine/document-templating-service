import * as fs from "fs";

export class JobAffidavitTemplate {
  fileLocation: string;
  templateRawContent: string;

  constructor(values) {
    this.fileLocation = values.fileLocation;
    this.templateRawContent = values.templateRawContent;

    this.loadFromFile();
  }

  loadFromFile(fileLocation? : string): JobAffidavitTemplate {
    if (fileLocation) {
      this.templateRawContent = fs.readFileSync(fileLocation, "utf8");
    } else if (this.fileLocation) {
      this.templateRawContent = fs.readFileSync(this.fileLocation, "utf8");
    } else {
      throw new Error("JobAffidavitTemplate.loadFromFile() - no fileLocation was specified, cannot load loadFromFile");
    }

    return this;
  }

  static from(values: Partial<JobAffidavitTemplate>) {
    return new JobAffidavitTemplate(values);
  }
}
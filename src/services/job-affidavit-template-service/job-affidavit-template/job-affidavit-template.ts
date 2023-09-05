import * as fs from "fs";

export class JobAffidavitTemplate {
  fileLocation: string;
  template: string;

  constructor(values) {
    this.fileLocation = values.fileLocation;
    this.template = values.template;

    this.loadFromFile();
  }

  loadFromFile(fileLocation? : string): JobAffidavitTemplate {
    if (fileLocation) {
      this.template = fs.readFileSync(fileLocation, "utf8");
    } else if (this.fileLocation) {
      this.template = fs.readFileSync(this.fileLocation, "utf8");
    } else {
      throw new Error("JobAffidavitTemplate.loadFromFile() - no fileLocation was specified, cannot load loadFromFile");
    }

    return this;
  }

  static from(values: Partial<JobAffidavitTemplate>) {
    return new JobAffidavitTemplate(values);
  }
}
import {DataSource} from "src/data/domain/data-source/data-source";

export type Job = {
  id: string;
  type: string;
  schemaVersion: string;
  jobCollection_id: string;
  metaDataSource: DataSource;
  clientJobNumber: string;
  created: string;
  updated: string;
}
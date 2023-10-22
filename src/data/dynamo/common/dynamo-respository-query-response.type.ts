import { QueryCommandOutput } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export type DynamoRepositoryQueryResponse = QueryCommandOutput & {
  results: ReturnType<typeof unmarshall>;
};

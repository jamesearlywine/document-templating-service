import * as cdk from "aws-cdk-lib";
import { Stack } from "./stack";

const ephemeralPrefix = null; // "JLE-Ephemeral-3";
export const app: cdk.App = new cdk.App();
export const applicationStack = new Stack(app, `${ephemeralPrefix ?? ""}DocumentTemplatingService`, {
  ephemeralPrefix,
  env: {
    account: "546515125053",
    region: "us-east-2",
  },
});

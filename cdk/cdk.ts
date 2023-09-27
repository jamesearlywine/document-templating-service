import * as cdk from "aws-cdk-lib";
import { ApplicationStack } from "./application-stack";

const ephemeralPrefix = "JLE-Ephemeral-";
export const app: cdk.App = new cdk.App();
export const application = new ApplicationStack(
  app,
  `${ephemeralPrefix}DocumentTemplatingService`,
  {
    env: {
      account: "546515125053",
      region: "us-east-2",
    },
    ephemeralPrefix,
  },
);

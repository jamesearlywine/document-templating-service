import * as cdk from "aws-cdk-lib";
import { ApplicationStack, ephemeralPrefix } from "./application-stack";

export const app: cdk.App = new cdk.App();

export const applicationStack = new ApplicationStack(app, `${ephemeralPrefix ?? ""}DocumentTemplatingService`, {
  // @todo - create vpc/networking stack with resources registered in param store, that can be referenced here
  env: {
    account: "546515125053",
    region: "us-east-2",
  },
});

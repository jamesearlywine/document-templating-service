import * as cdk from "aws-cdk-lib";
import { ApplicationStack } from "./application-stack";

const ephemeralPrefix = "JLE-Ephemeral-";
export const app: cdk.App = new cdk.App();

export type ApplicationConfig = {
  vpcId: string;
  privateSubnetAttributes: {
    subnetId: string;
    availabilityZone: string;
    routeTableId: string;
  };
};

export const applicationStack = new ApplicationStack(
  app,
  `${ephemeralPrefix}DocumentTemplatingService`,
  {
    ephemeralPrefix,
    // @todo - create vpc/networking stack with resources registered in param store, that can be referenced here
    env: {
      account: "546515125053",
      region: "us-east-2",
    },
    config: {
      vpcId: "vpc-058c5ee1e09681197",
      privateSubnetAttributes: {
        subnetId: "subnet-036f5f2f9c607cf2a",
        availabilityZone: "us-east-2a",
        routeTableId: "rtb-00b7d5ea4cdb82c73",
      },
    } as ApplicationConfig,
  },
);

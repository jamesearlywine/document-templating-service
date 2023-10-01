import { ApplicationStack } from "cdk/application-stack";
import { app, ApplicationConfig } from "cdk/cdk";

const ephemeralPrefix = "Test-Ephemeral";

describe("cdk applicationStack", () => {
  it("should instantiate without errors", () => {
    const applicationStack = new ApplicationStack(
      app,
      `${ephemeralPrefix}DocumentTemplatingService`,
      {
        ephemeralPrefix,
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

    expect(applicationStack).toBeDefined();
  });
});

import { Stack } from "cdk/stack";
import { app } from "cdk/cdk";

const ephemeralPrefix = "Test-Ephemeral";

describe("cdk applicationStack", () => {
  it("should instantiate without errors", () => {
    const applicationStack = new Stack(app, `${ephemeralPrefix}DocumentTemplatingService`, {
      ephemeralPrefix: "",
      env: {
        account: "546515125053",
        region: "us-east-2",
      },
    });

    expect(applicationStack).toBeDefined();
  });
});

import { ConfigFetcherEnv } from "src/config/config-fetcher-env/config-fetcher-env";

const getMultipleSpy = jest.spyOn(ConfigFetcherEnv, "getMultiple");

describe("ConfigFetcherEnv", () => {
  describe("getMultiple", () => {
    it("should return the value of multiple environment variables", async () => {
      process.env.NODE_ENV = "test2";
      process.env.BIG_TEST_VALUE = "big test value";

      const values = await ConfigFetcherEnv.get(["NODE_ENV", "BIG_TEST_VALUE"]);

      expect(values).toStrictEqual({
        NODE_ENV: "test2",
        BIG_TEST_VALUE: "big test value",
      });
    });
  });

  describe("get()", () => {
    it("should return the value of the environment variable", async () => {
      process.env.NODE_ENV = "test";

      const value = await ConfigFetcherEnv.get("NODE_ENV");

      expect(value).toBe("test");
    });

    it("should call getMultiple to return multiple environment config values", async () => {
      const testConfigKeys = ["NODE_ENV", "BIG_TEST_VALUE"];

      const values = await ConfigFetcherEnv.get(testConfigKeys);

      expect(getMultipleSpy).toHaveBeenCalledWith(testConfigKeys);
    });
  });
});

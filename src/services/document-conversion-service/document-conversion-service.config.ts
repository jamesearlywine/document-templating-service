import { ServiceConfig } from "src/config/lib/service-config";
import { ConfigFetcherEnv } from "src/config/config-fetcher-env";

export const ConfigKeys = {
  GOTENBERG_BASE_URL: "GOTENBERG_BASE_URL",
};

export default class DocumentConversionServiceConfig extends ServiceConfig {
  static DEFAULT_VALUES = {
    [ConfigKeys.GOTENBERG_BASE_URL]: "http://localhost:3000",
  };

  static GOTENBERG_BASE_URL: string =
    DocumentConversionServiceConfig.DEFAULT_VALUES[
      ConfigKeys.GOTENBERG_BASE_URL
    ];

  static initialize = async () => {
    this.reset();
    const resultsPromise = Promise.all([
      ConfigFetcherEnv.get(ConfigKeys.GOTENBERG_BASE_URL),
    ]).then((results) => {
      this.set({
        [ConfigKeys.GOTENBERG_BASE_URL]:
          results[0] || this.DEFAULT_VALUES[ConfigKeys.GOTENBERG_BASE_URL],
      });
    });

    return resultsPromise;
  };
}

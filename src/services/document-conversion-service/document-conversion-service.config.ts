import { ServiceConfig } from "src/config/lib/service-config";
import { ConfigFetcherEnv } from "src/config/config-fetcher-env";

//@todo - come up with something more config-schema-driven
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

  static initialized;
  static initialize = async () => {
    this.reset();

    this.initialized = Promise.all([
      ConfigFetcherEnv.get(ConfigKeys.GOTENBERG_BASE_URL),
    ]).then((results) => {
      this.set({
        [ConfigKeys.GOTENBERG_BASE_URL]: results[0],
      });
    });

    return this.initialized;
  };
}

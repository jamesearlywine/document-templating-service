import { ServiceConfig } from "src/config/lib/service-config";
import { ConfigFetcherEnv } from "src/config/config-fetcher-env";

//@todo - come up with something more config-schema-driven
export const ConfigKeys = {
  GOTENBERG_BASE_URL: "GOTENBERG_BASE_URL",
  GOTENBERG_CONVERSION_TIMEOUT_MS: "GOTENBERG_CONVERSION_TIMEOUT_MS",
};

export default class DocumentConversionServiceConfig extends ServiceConfig {
  static DEFAULT_VALUES = {
    [ConfigKeys.GOTENBERG_BASE_URL]: "http://localhost:3000",
    [ConfigKeys.GOTENBERG_CONVERSION_TIMEOUT_MS]: 60 * 1000,
  };

  static GOTENBERG_BASE_URL: string = DocumentConversionServiceConfig
    .DEFAULT_VALUES[ConfigKeys.GOTENBERG_BASE_URL] as string;

  static GOTENBERG_CONVERSION_TIMEOUT_MS: number =
    DocumentConversionServiceConfig.DEFAULT_VALUES[
      ConfigKeys.GOTENBERG_CONVERSION_TIMEOUT_MS
    ] as number;

  static initialized;
  static initialize = async () => {
    if (!this.initialized) {
      this.initialized = Promise.all([
        ConfigFetcherEnv.get(ConfigKeys.GOTENBERG_BASE_URL),
      ]).then((results) => {
        this.set({
          [ConfigKeys.GOTENBERG_BASE_URL]: results[0],
        });
      });
    }

    return this.initialized;
  };
}

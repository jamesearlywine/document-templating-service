import { ServiceConfig } from "src/config/lib/service-config";
import { ConfigFetcherEnv } from "src/config/config-fetcher-env";

//@todo - come up with something more config-schema-driven
export const ConfigKeys = {
  GOTENBERG_BASE_URL: "GOTENBERG_BASE_URL",
  GOTENBERG_CONVERSION_TIMEOUT_MS: "GOTENBERG_CONVERSION_TIMEOUT_MS",
};

export default class DocumentConversionServiceConfig extends ServiceConfig {
  static DEFAULT_VALUES = {};

  static initialized;
  static initialize = async () => {
    if (!this.initialized) {
      this.initialized = Promise.all([]);
    }

    return this.initialized;
  };
}

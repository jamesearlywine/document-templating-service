import { ServiceConfig } from "src/config/lib/service-config";

export const ConfigKeys = {};

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

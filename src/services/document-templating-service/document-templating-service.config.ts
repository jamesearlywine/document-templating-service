import { ServiceConfig } from "src/config/lib/service-config";
import { ConfigFetcherEnv } from "src/config/config-fetcher-env";

//@todo - come up with something more config-schema-driven
export const ConfigKeys = {
  DEFAULT_TEMPLATE_TYPE: "DEFAULT_TEMPLATE_TYPE",
};

export default class DocumentTemplatingServiceConfig extends ServiceConfig {
  static DEFAULT_VALUES = {
    [ConfigKeys.DEFAULT_TEMPLATE_TYPE]: "DocxTemplater",
  };

  static DEFAULT_TEMPLATE_TYPE: string =
    DocumentTemplatingServiceConfig.DEFAULT_VALUES[
      ConfigKeys.DEFAULT_TEMPLATE_TYPE
    ];

  static initialize = async () => {
    this.reset();

    const initialized = Promise.all([
      ConfigFetcherEnv.get(ConfigKeys.DEFAULT_TEMPLATE_TYPE),
    ]).then((results) => {
      this.set({
        [ConfigKeys.DEFAULT_TEMPLATE_TYPE]:
          results[0] || this.DEFAULT_VALUES[ConfigKeys.DEFAULT_TEMPLATE_TYPE],
      });
    });

    return initialized;
  };
}

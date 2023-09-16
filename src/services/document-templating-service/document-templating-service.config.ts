import { ServiceConfig } from "src/config/lib/service-config";
import { ConfigFetcherEnv } from "src/config/config-fetcher-env";

//@todo - come up with something more config-schema-driven
export const ConfigKeys = {
  DEFAULT_TEMPLATE_TYPE: "DEFAULT_TEMPLATE_TYPE",
  GENERATED_DOCUMENTS_BUCKET: "GENERATED_DOCUMENTS_BUCKET",
};

export default class DocumentTemplatingServiceConfig extends ServiceConfig {
  static DEFAULT_VALUES = {
    [ConfigKeys.DEFAULT_TEMPLATE_TYPE]: "DocxTemplater",
    [ConfigKeys.GENERATED_DOCUMENTS_BUCKET]: "",
  };

  static DEFAULT_TEMPLATE_TYPE: string =
    DocumentTemplatingServiceConfig.DEFAULT_VALUES[
      ConfigKeys.DEFAULT_TEMPLATE_TYPE
    ];

  static GENERATED_DOCUMENTS_BUCKET: string =
    DocumentTemplatingServiceConfig.DEFAULT_VALUES[
      ConfigKeys.GENERATED_DOCUMENTS_BUCKET
    ];

  static initialize = async () => {
    this.reset();

    const initialized = Promise.all([
      ConfigFetcherEnv.get(ConfigKeys.DEFAULT_TEMPLATE_TYPE),
      ConfigFetcherEnv.get(ConfigKeys.GENERATED_DOCUMENTS_BUCKET),
    ]).then((results) => {
      this.set({
        [ConfigKeys.DEFAULT_TEMPLATE_TYPE]:
          results[0] || this.DEFAULT_VALUES[ConfigKeys.DEFAULT_TEMPLATE_TYPE],
        [ConfigKeys.GENERATED_DOCUMENTS_BUCKET]:
          results[1] ||
          this.DEFAULT_VALUES[ConfigKeys.GENERATED_DOCUMENTS_BUCKET],
      });
    });

    return initialized;
  };
}

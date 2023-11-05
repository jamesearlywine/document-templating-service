import { ServiceConfig } from "src/config/lib/service-config";
import { ConfigFetcherEnv } from "src/config/config-fetcher-env";

//@todo - come up with something more config-schema-driven
export const ConfigKeys = {
  DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN:
    "DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN",
  DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME:
    "DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME",
  DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX:
    "DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX",
};

export default class DocumentTemplateRepositoryConfig extends ServiceConfig {
  static DEFAULT_VALUES = {
    [ConfigKeys.DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN]: "",
    [ConfigKeys.DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME]: "",
    [ConfigKeys.DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX]:
      "DOCUMENT_TEMPLATE",
  };

  static DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN: string =
    DocumentTemplateRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN
    ];

  static DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME: string =
    DocumentTemplateRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME
    ];

  static DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX: string =
    DocumentTemplateRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX
    ];

  static initialized;
  static initialize = async () => {
    this.reset();

    this.initialized = Promise.all([
      ConfigFetcherEnv.get(ConfigKeys.DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN),
      ConfigFetcherEnv.get(
        ConfigKeys.DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX,
      ),
    ]).then((results) => {
      this.set({
        [ConfigKeys.DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN]: results[0],
      });
      this.set({
        [ConfigKeys.DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME]: (
          results[0] as string
        ).split("table/")[1],
      });
      this.set({
        [ConfigKeys.DOCUMENT_TEMPLATES_DYNAMODB_PARTITION_KEY_PREFIX]:
          results[1],
      });
    });

    return this.initialized;
  };
}

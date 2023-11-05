import { ServiceConfig } from "src/config/lib/service-config";
import { ConfigFetcherEnv } from "src/config/config-fetcher-env";

//@todo - come up with something more config-schema-driven
export const ConfigKeys = {
  GENERATED_DOCUMENTS_DYNAMODB_TABLE_ARN:
    "GENERATED_DOCUMENTS_DYNAMODB_TABLE_ARN",
  GENERATED_DOCUMENTS_DYNAMODB_TABLE_NAME:
    "GENERATED_DOCUMENTS_DYNAMODB_TABLE_NAME",
  GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX:
    "GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX",
};

export default class GeneratedDocumentRepositoryConfig extends ServiceConfig {
  static DEFAULT_VALUES = {
    [ConfigKeys.GENERATED_DOCUMENTS_DYNAMODB_TABLE_ARN]: "",
    [ConfigKeys.GENERATED_DOCUMENTS_DYNAMODB_TABLE_NAME]: "",
    [ConfigKeys.GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX]:
      "GENERATED_DOCUMENT",
  };

  static GENERATED_DOCUMENTS_DYNAMODB_TABLE_ARN: string =
    GeneratedDocumentRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.GENERATED_DOCUMENTS_DYNAMODB_TABLE_ARN
    ];

  static GENERATED_DOCUMENTS_DYNAMODB_TABLE_NAME: string =
    GeneratedDocumentRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.GENERATED_DOCUMENTS_DYNAMODB_TABLE_NAME
    ];

  static GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX: string =
    GeneratedDocumentRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX
    ];

  static initialized;
  static initialize = async () => {
    this.reset();

    this.initialized = Promise.all([
      ConfigFetcherEnv.get(ConfigKeys.GENERATED_DOCUMENTS_DYNAMODB_TABLE_ARN),
      ConfigFetcherEnv.get(
        ConfigKeys.GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX,
      ),
    ]).then((results) => {
      this.set({
        [ConfigKeys.GENERATED_DOCUMENTS_DYNAMODB_TABLE_ARN]: results[0],
      });
      this.set({
        [ConfigKeys.GENERATED_DOCUMENTS_DYNAMODB_TABLE_NAME]: (
          results[0] as string
        ).split("table/")[1],
      });
      this.set({
        [ConfigKeys.GENERATED_DOCUMENTS_DYNAMODB_PARTITION_KEY_PREFIX]:
          results[1],
      });
    });

    return this.initialized;
  };
}

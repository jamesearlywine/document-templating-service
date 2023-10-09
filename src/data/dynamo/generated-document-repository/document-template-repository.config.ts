import { ServiceConfig } from "src/config/lib/service-config";
import { ConfigFetcherEnv } from "src/config/config-fetcher-env";

//@todo - come up with something more config-schema-driven
export const ConfigKeys = {
  SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN:
    "SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN",
  SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME:
    "SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME",
};

export default class DocumentTemplateRepositoryConfig extends ServiceConfig {
  static DEFAULT_VALUES = {
    [ConfigKeys.SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN]: "",
    [ConfigKeys.SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME]: "",
  };

  static SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN: string =
    DocumentTemplateRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN
    ];

  static SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME: string =
    DocumentTemplateRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME
    ];

  static initialized;
  static initialize = async () => {
    this.reset();

    this.initialized = Promise.all([
      ConfigFetcherEnv.get(
        ConfigKeys.SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN,
      ),
    ]).then((results) => {
      this.set({
        [ConfigKeys.SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN]: results[0],
      });
      this.set({
        [ConfigKeys.SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME]: (
          results[0] as string
        ).split("table/")[1],
      });
    });

    return this.initialized;
  };
}

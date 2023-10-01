import { ServiceConfig } from "src/config/lib/service-config";
import { ConfigFetcherEnv } from "src/config/config-fetcher-env";

//@todo - come up with something more config-schema-driven
export const ConfigKeys = {
  SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN:
    "SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN",
  SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME:
    "SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME",
  PROCESSPROOF_GENERAL_PRIVATE_BUCKET_ARN:
    "PROCESSPROOF_GENERAL_PRIVATE_BUCKET_ARN",
  PROCESSPROOF_GENERAL_PRIVATE_BUCKET_NAME:
    "PROCESSPROOF_GENERAL_PRIVATE_BUCKET_NAME",
  PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION:
    "PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION",
  PROCESSPROOF_DOCUMENT_TEMPLATES_S3_KEY_PREFIX:
    "PROCESSPROOF_DOCUMENT_TEMPLATES_S3_KEY_PREFIX",
};

export default class DocumentTemplateRepositoryConfig extends ServiceConfig {
  static DEFAULT_VALUES = {
    [ConfigKeys.SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN]: "",
    [ConfigKeys.PROCESSPROOF_GENERAL_PRIVATE_BUCKET_ARN]: "",
    [ConfigKeys.SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME]: "",
    [ConfigKeys.PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION]: "us-east-2",
    [ConfigKeys.PROCESSPROOF_DOCUMENT_TEMPLATES_S3_KEY_PREFIX]:
      "document-templates",
  };

  static SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN: string =
    DocumentTemplateRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN
    ];

  static SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME: string =
    DocumentTemplateRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_NAME
    ];

  static PROCESSPROOF_GENERAL_PRIVATE_BUCKET_ARN: string =
    DocumentTemplateRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.PROCESSPROOF_GENERAL_PRIVATE_BUCKET_ARN
    ];

  static PROCESSPROOF_GENERAL_PRIVATE_BUCKET_NAME: string =
    DocumentTemplateRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.PROCESSPROOF_GENERAL_PRIVATE_BUCKET_NAME
    ];

  static PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION: string =
    DocumentTemplateRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION
    ];

  static PROCESSPROOF_DOCUMENT_TEMPLATES_S3_KEY_PREFIX: string =
    DocumentTemplateRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.PROCESSPROOF_DOCUMENT_TEMPLATES_S3_KEY_PREFIX
    ];

  static initialized;
  static initialize = async () => {
    this.reset();

    this.initialized = Promise.all([
      ConfigFetcherEnv.get(
        ConfigKeys.SYSTEM_DOCUMENT_TEMPLATES_DYNAMODB_TABLE_ARN,
      ),
      ConfigFetcherEnv.get(ConfigKeys.PROCESSPROOF_GENERAL_PRIVATE_BUCKET_ARN),
      ConfigFetcherEnv.get(ConfigKeys.PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION),
      ConfigFetcherEnv.get(
        ConfigKeys.PROCESSPROOF_DOCUMENT_TEMPLATES_S3_KEY_PREFIX,
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
      this.set({
        [ConfigKeys.PROCESSPROOF_GENERAL_PRIVATE_BUCKET_ARN]: results[1],
      });
      this.set({
        [ConfigKeys.PROCESSPROOF_GENERAL_PRIVATE_BUCKET_NAME]: (
          results[1] as string
        ).split(":::")[1],
      });
      this.set({
        [ConfigKeys.PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION]: results[2],
      });
      this.set({
        [ConfigKeys.PROCESSPROOF_DOCUMENT_TEMPLATES_S3_KEY_PREFIX]: results[3],
      });
    });

    return this.initialized;
  };
}

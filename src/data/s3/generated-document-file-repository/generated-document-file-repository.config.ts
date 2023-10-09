import { ServiceConfig } from "src/config/lib/service-config";
import { ConfigFetcherEnv } from "src/config/config-fetcher-env";

//@todo - come up with something more config-schema-driven
export const ConfigKeys = {
  PROCESSPROOF_GENERAL_PRIVATE_BUCKET_ARN:
    "PROCESSPROOF_GENERAL_PRIVATE_BUCKET_ARN",
  PROCESSPROOF_GENERAL_PRIVATE_BUCKET_NAME:
    "PROCESSPROOF_GENERAL_PRIVATE_BUCKET_NAME",
  PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION:
    "PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION",
  PROCESSPROOF_GENERATED_DOCUMENTS_S3_KEY_PREFIX:
    "PROCESSPROOF_GENERATED_DOCUMENTS_S3_KEY_PREFIX",
};

export default class GeneratedDocumentFileRepositoryConfig extends ServiceConfig {
  static DEFAULT_VALUES = {
    [ConfigKeys.PROCESSPROOF_GENERAL_PRIVATE_BUCKET_ARN]: "",
    [ConfigKeys.PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION]: "us-east-2",
    [ConfigKeys.PROCESSPROOF_GENERATED_DOCUMENTS_S3_KEY_PREFIX]:
      "document-templates",
  };

  static PROCESSPROOF_GENERAL_PRIVATE_BUCKET_ARN: string =
    GeneratedDocumentFileRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.PROCESSPROOF_GENERAL_PRIVATE_BUCKET_ARN
    ];

  static PROCESSPROOF_GENERAL_PRIVATE_BUCKET_NAME: string =
    GeneratedDocumentFileRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.PROCESSPROOF_GENERAL_PRIVATE_BUCKET_NAME
    ];

  static PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION: string =
    GeneratedDocumentFileRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION
    ];

  static PROCESSPROOF_GENERATED_DOCUMENTS_S3_KEY_PREFIX: string =
    GeneratedDocumentFileRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.PROCESSPROOF_GENERATED_DOCUMENTS_S3_KEY_PREFIX
    ];

  static initialized;
  static initialize = async () => {
    if (!this.initialized) {
      this.reset();

      this.initialized = Promise.all([
        ConfigFetcherEnv.get(
          ConfigKeys.PROCESSPROOF_GENERAL_PRIVATE_BUCKET_ARN,
        ),
        ConfigFetcherEnv.get(ConfigKeys.PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION),
        ConfigFetcherEnv.get(
          ConfigKeys.PROCESSPROOF_GENERATED_DOCUMENTS_S3_KEY_PREFIX,
        ),
      ]).then((results) => {
        this.set({
          [ConfigKeys.PROCESSPROOF_GENERAL_PRIVATE_BUCKET_ARN]: results[0],
        });
        this.set({
          [ConfigKeys.PROCESSPROOF_GENERAL_PRIVATE_BUCKET_NAME]: (
            results[0] as string
          ).split(":::")[1],
        });
        this.set({
          [ConfigKeys.PROCESSPROOF_S3_BUCKETS_PRIMARY_REGION]: results[1],
        });
        this.set({
          [ConfigKeys.PROCESSPROOF_GENERATED_DOCUMENTS_S3_KEY_PREFIX]:
            results[2],
        });
      });
    }

    return this.initialized;
  };
}

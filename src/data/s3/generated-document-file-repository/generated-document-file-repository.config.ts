import { ServiceConfig } from "src/config/lib/service-config";
import { ConfigFetcherEnv } from "src/config/config-fetcher-env";

//@todo - come up with something more config-schema-driven
export const ConfigKeys = {
  GENERATED_DOCUMENTS_BUCKET_ARN: "GENERATED_DOCUMENTS_BUCKET_ARN",
  GENERATED_DOCUMENTS_BUCKET_NAME: "GENERATED_DOCUMENTS_BUCKET_NAME",
  S3_BUCKETS_PRIMARY_REGION: "S3_BUCKETS_PRIMARY_REGION",
  GENERATED_DOCUMENTS_S3_KEY_PREFIX: "GENERATED_DOCUMENTS_S3_KEY_PREFIX",
};

export default class GeneratedDocumentFileRepositoryConfig extends ServiceConfig {
  static DEFAULT_VALUES = {
    [ConfigKeys.GENERATED_DOCUMENTS_BUCKET_ARN]: "",
    [ConfigKeys.S3_BUCKETS_PRIMARY_REGION]: "us-east-2",
    [ConfigKeys.GENERATED_DOCUMENTS_S3_KEY_PREFIX]: "document-templates",
  };

  static GENERATED_DOCUMENTS_BUCKET_ARN: string =
    GeneratedDocumentFileRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.GENERATED_DOCUMENTS_BUCKET_ARN
    ];

  static GENERATED_DOCUMENTS_BUCKET_NAME: string =
    GeneratedDocumentFileRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.GENERATED_DOCUMENTS_BUCKET_NAME
    ];

  static S3_BUCKETS_PRIMARY_REGION: string =
    GeneratedDocumentFileRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.S3_BUCKETS_PRIMARY_REGION
    ];

  static GENERATED_DOCUMENTS_S3_KEY_PREFIX: string =
    GeneratedDocumentFileRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.GENERATED_DOCUMENTS_S3_KEY_PREFIX
    ];

  static initialized;
  static initialize = async () => {
    if (!this.initialized) {
      this.reset();

      this.initialized = Promise.all([
        ConfigFetcherEnv.get(ConfigKeys.GENERATED_DOCUMENTS_BUCKET_ARN),
        ConfigFetcherEnv.get(ConfigKeys.S3_BUCKETS_PRIMARY_REGION),
        ConfigFetcherEnv.get(ConfigKeys.GENERATED_DOCUMENTS_S3_KEY_PREFIX),
      ]).then((results) => {
        this.set({
          [ConfigKeys.GENERATED_DOCUMENTS_BUCKET_ARN]: results[0],
        });
        this.set({
          [ConfigKeys.GENERATED_DOCUMENTS_BUCKET_NAME]: (
            results[0] as string
          ).split(":::")[1],
        });
        this.set({
          [ConfigKeys.S3_BUCKETS_PRIMARY_REGION]: results[1],
        });
        this.set({
          [ConfigKeys.GENERATED_DOCUMENTS_S3_KEY_PREFIX]: results[2],
        });
      });
    }

    return this.initialized;
  };
}

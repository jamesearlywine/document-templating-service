import { ServiceConfig } from "src/config/lib/service-config";
import { ConfigFetcherEnv } from "src/config/config-fetcher-env";

//@todo - come up with something more config-schema-driven
export const ConfigKeys = {
  DOCUMENT_TEMPLATES_BUCKET_ARN: "DOCUMENT_TEMPLATES_BUCKET_ARN",
  DOCUMENT_TEMPLATES_BUCKET_NAME: "DOCUMENT_TEMPLATES_BUCKET_NAME",
  S3_BUCKETS_PRIMARY_REGION: "S3_BUCKETS_PRIMARY_REGION",
  DOCUMENT_TEMPLATES_S3_KEY_PREFIX: "DOCUMENT_TEMPLATES_S3_KEY_PREFIX",
};

export default class DocumentTemplateFileRepositoryConfig extends ServiceConfig {
  static DEFAULT_VALUES = {
    [ConfigKeys.DOCUMENT_TEMPLATES_BUCKET_ARN]: "",
    [ConfigKeys.S3_BUCKETS_PRIMARY_REGION]: "us-east-2", // inject this config
    [ConfigKeys.DOCUMENT_TEMPLATES_S3_KEY_PREFIX]: "document-templates",
  };

  static DOCUMENT_TEMPLATES_BUCKET_ARN: string =
    DocumentTemplateFileRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.DOCUMENT_TEMPLATES_BUCKET_ARN
    ];

  static DOCUMENT_TEMPLATES_BUCKET_NAME: string =
    DocumentTemplateFileRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.DOCUMENT_TEMPLATES_BUCKET_NAME
    ];

  static S3_BUCKETS_PRIMARY_REGION: string =
    DocumentTemplateFileRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.S3_BUCKETS_PRIMARY_REGION
    ];

  static DOCUMENT_TEMPLATES_S3_KEY_PREFIX: string =
    DocumentTemplateFileRepositoryConfig.DEFAULT_VALUES[
      ConfigKeys.DOCUMENT_TEMPLATES_S3_KEY_PREFIX
    ];

  static initialized;
  static initialize = async () => {
    if (!this.initialized) {
      this.reset();

      this.initialized = Promise.all([
        ConfigFetcherEnv.get(ConfigKeys.DOCUMENT_TEMPLATES_BUCKET_ARN),
        ConfigFetcherEnv.get(ConfigKeys.S3_BUCKETS_PRIMARY_REGION),
        ConfigFetcherEnv.get(ConfigKeys.DOCUMENT_TEMPLATES_S3_KEY_PREFIX),
      ]).then((results) => {
        this.set({
          [ConfigKeys.DOCUMENT_TEMPLATES_BUCKET_ARN]: results[0],
        });
        this.set({
          [ConfigKeys.DOCUMENT_TEMPLATES_BUCKET_NAME]: (
            results[0] as string
          ).split(":::")[1],
        });
        this.set({
          [ConfigKeys.S3_BUCKETS_PRIMARY_REGION]: results[1],
        });
        this.set({
          [ConfigKeys.DOCUMENT_TEMPLATES_S3_KEY_PREFIX]: results[2],
        });
      });
    }

    return this.initialized;
  };
}

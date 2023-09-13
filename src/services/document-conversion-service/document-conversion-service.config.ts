import { ServiceConfig } from "src/config/lib/service-config";

export default class DocumentConversionServiceConfig extends ServiceConfig {
  static DEFAULT_VALUES = {
    GOTENBERG_BASE_URL: "http://localhost:3000",
  };

  static GOTENBERG_BASE_URL: string =
    DocumentConversionServiceConfig.DEFAULT_VALUES.GOTENBERG_BASE_URL;
}

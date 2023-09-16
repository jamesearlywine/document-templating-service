import { DocumentConversionService } from "src/services/document-conversion-service";
import { DocumentTemplatingService } from "src/services/document-templating-service/document-templating-service";
import { Service } from "src/services/service.type";

export const AllServices: { [k: string]: Service } = {
  DocumentConversionService,
  DocumentTemplatingService,
};

export const initializeAllServices = async () => {
  return Promise.all(
    Object.values(AllServices).map((service) => service.initialize()),
  );
};

import { DocumentConversionService } from "src/services/document-conversion-service";
import { Service } from "src/services/service.type";

export const AllServices: { [k: string]: Service } = {
  DocumentConversionService,
};

export const initializeAllServices = async () => {
  return Promise.all(
    Object.values(AllServices).map((service) => service.initialize()),
  );
};

export const ServiceRegistry: {
  AllServices: { [k: string]: Service };
  initializeAllServices: () => Promise<void[]>;
} = {
  AllServices,
  initializeAllServices,
};

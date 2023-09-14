import * as DocumentConversionService from "./document-conversion-service";
export const initializeServices = async () => {
  Promise.all([DocumentConversionService.initialize()]);
};

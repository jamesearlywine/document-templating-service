import fs from "fs";
import {
  pipe,
  gotenberg,
  convert,
  office,
  adjust,
  please,
} from "gotenberg-js-client";
import DocumentConversionServiceConfig from "./document-conversion-service.config";
import { Service } from "src/services/common/service.type";

export let toPdf: (url: string) => Promise<NodeJS.ReadableStream>;

export let initialized: Promise<void>;
export const initialize = async () => {
  if (!initialized) {
    const url = `${DocumentConversionServiceConfig.GOTENBERG_BASE_URL}/forms/libreoffice/convert`;
    initialized = await DocumentConversionServiceConfig.initialize();
    toPdf = pipe(
      gotenberg(DocumentConversionServiceConfig.GOTENBERG_BASE_URL),
      convert,
      office,
      adjust({
        url,
      }),
      please,
    );

    console.log("DocumentConversionService.initialized: ", {
      url,
      DocumentConversionServiceConfig,
    });
  }

  return initialized;
};

export const docxToPdf = async ({
  inputLocation,
  outputLocation,
}: {
  inputLocation: string;
  outputLocation: string;
}): Promise<NodeJS.ReadableStream> => {
  await initialize();

  const pdf = await toPdf(`file://${inputLocation}`);

  const fileStream = fs.createWriteStream(outputLocation);
  await pdf.pipe(fileStream);

  await new Promise((resolve, reject) => {
    fileStream.on("finish", resolve);
    fileStream.on("error", reject);
  });

  return pdf;
};

export const DocumentConversionService: Service & {
  docxToPdf;
} = {
  initialize,
  docxToPdf,
};

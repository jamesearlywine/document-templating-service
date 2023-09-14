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

let initialized: Promise<void>;
export const initialize = async () => {
  initialized = DocumentConversionServiceConfig.initialize();
};

export const docxToPdf = async ({
  inputLocation,
  outputLocation,
}: {
  inputLocation: string;
  outputLocation: string;
}): Promise<NodeJS.ReadableStream> => {
  if (!initialized) {
    initialize();
  }
  await initialized;

  const pdf = await pipe(
    gotenberg(DocumentConversionServiceConfig.GOTENBERG_BASE_URL),
    convert,
    office,
    adjust({
      url: `${DocumentConversionServiceConfig.GOTENBERG_BASE_URL}/forms/libreoffice/convert`,
    }),
    please,
  )(`file://${inputLocation}`);

  pdf.pipe(fs.createWriteStream(outputLocation));

  return pdf;
};

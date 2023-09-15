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

export let toPdf: (url: string) => Promise<NodeJS.ReadableStream>;

export let initialized: Promise<void>;
export const initialize = async () => {
  if (!initialized) {
    const url = `${DocumentConversionServiceConfig.GOTENBERG_BASE_URL}/forms/libreoffice/convert`;
    initialized = DocumentConversionServiceConfig.initialize().then(() => {
      toPdf = pipe(
        gotenberg(DocumentConversionServiceConfig.GOTENBERG_BASE_URL),
        convert,
        office,
        adjust({
          url,
        }),
        please,
      );
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
  await pdf.pipe(fs.createWriteStream(outputLocation));

  return pdf;
};

export const DocumentConversionService = {
  initialize,
  docxToPdf,
};

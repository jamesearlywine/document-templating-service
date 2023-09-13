import fs from "fs";
import {
  pipe,
  gotenberg,
  convert,
  office,
  adjust,
  please,
} from "gotenberg-js-client";
import DocumentConversionServiceConfig from "src/services/document-conversion-service/document-conversion-service.config";

export const docxToPdf = async ({
  inputLocation,
  outputLocation,
}: {
  inputLocation: string;
  outputLocation: string;
}) => {
  const toPDF = pipe(
    gotenberg(DocumentConversionServiceConfig.GOTENBERG_BASE_URL),
    convert,
    office,
    adjust({
      url: `${DocumentConversionServiceConfig.GOTENBERG_BASE_URL}/forms/libreoffice/convert`,
    }),
    please,
  );
  const pdf = await toPDF(`file://${inputLocation}`);

  pdf.pipe(fs.createWriteStream(outputLocation));

  return pdf;
};

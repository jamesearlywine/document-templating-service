import {
  pipe,
  gotenberg,
  convert,
  office,
  adjust,
  please,
} from "gotenberg-js-client";
import fs from "fs";
export const docxToPdf = async ({
  inputLocation,
  outputLocation,
}: {
  inputLocation: string;
  outputLocation: string;
}) => {
  const gotenbergEndpoint = "http://localhost:3000";

  const toPDF = pipe(
    gotenberg(gotenbergEndpoint),
    convert,
    office,
    adjust({
      url: `${gotenbergEndpoint}/forms/libreoffice/convert`,
    }),
    please,
  );
  const pdf = await toPDF(`file://${inputLocation}`);

  pdf.pipe(fs.createWriteStream(outputLocation));

  return pdf;
};

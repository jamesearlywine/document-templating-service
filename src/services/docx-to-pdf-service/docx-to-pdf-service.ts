import { pipe, gotenberg, convert, office, please } from "gotenberg-js-client";
import fs from "fs";
export const docxToPdf = async ({
  inputLocation,
  outputLocation,
}: {
  inputLocation: string;
  outputLocation: string;
}) => {
  const gotenbergEndpoint = "http://localhost:3000";

  const toPDF = pipe(gotenberg(gotenbergEndpoint), convert, office, please);
  const pdf = await toPDF(fs.createReadStream(inputLocation));

  return pdf;
};

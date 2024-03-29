import fs from "fs";
import { execSync } from "node:child_process";
import DocumentConversionServiceConfig from "./document-conversion-service.config";
import { Service } from "src/services/common/service.type";
import { retry } from "../../utility/common/retry";

export let initialized: Promise<void>;
export const initialize = async () => {
  if (!initialized) {
    initialized = await DocumentConversionServiceConfig.initialize();
  }

  return initialized;
};

export const buildConvertDocxToPdfCommand = ({
  inputLocation,
}: {
  inputLocation: string;
}): string => {
  return `
libreoffice7.6 --headless --invisible --nodefault --view \\
        --nolockcheck --nologo --norestore --convert-to pdf \\
        --outdir /tmp ${inputLocation}\\`;
};

export const docxToPdf = async ({
  inputLocation,
  outputLocation,
}: {
  inputLocation: string;
  outputLocation?: string;
}): Promise<void> => {
  await initialize();

  console.log(
    "DocumentConversionServicer.docxToPdf() - inputLocation",
    inputLocation,
  );

  let stdout;
  retry(
    () => {
      stdout = execSync(buildConvertDocxToPdfCommand({ inputLocation }), {
        timeout: 5 * 1000, // 5 seconds
      });
    },
    { maxRetries: 10 },
  );
  console.log(
    "DocumentConversionServicer.docxToPdf() - docs->pdf conversion execSync, stdout",
    stdout.toString(),
  );

  const resultsLocation = inputLocation.replace(".docx", ".pdf");

  console.log("DocumentConversionServicer.docxToPdf()", {
    inputLocation,
    resultsLocation,
    outputLocation,
  });

  if (resultsLocation !== outputLocation) {
    fs.cpSync(resultsLocation, outputLocation);
  }
};

export const DocumentConversionService: Service & {
  docxToPdf;
} = {
  initialize,
  docxToPdf,
};

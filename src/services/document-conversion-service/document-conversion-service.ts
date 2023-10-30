import fs from "fs";
import { execSync } from "node:child_process";
import DocumentConversionServiceConfig from "./document-conversion-service.config";
import { Service } from "src/services/common/service.type";

export let initialized: Promise<void>;
export const initialize = async () => {
  if (!initialized) {
    initialized = await DocumentConversionServiceConfig.initialize();
  }

  return initialized;
};

export const buildConvertDocxToPdfCommand = ({
  inputFilepath,
}: {
  inputFilepath: string;
}): string => {
  return `
libreoffice7.6 --headless --invisible --nodefault --view \\
        --nolockcheck --nologo --norestore --convert-to pdf \\
        --outdir /tmp ${inputFilepath}\\`;
};

export const docxToPdf = async ({
  inputLocation,
  outputLocation,
}: {
  inputLocation: string;
  outputLocation?: string;
}): Promise<NodeJS.ReadableStream> => {
  await initialize();

  console.log(
    "DocumentConversionServicer.docxToPdf() - inputLocation",
    inputLocation,
  );

  const stdout = execSync(
    buildConvertDocxToPdfCommand({ inputFilepath: inputLocation }),
  );
  console.log(
    "DocumentConversionServicer.docxToPdf() - docs->pdf conversion execSync, stdout",
    stdout.toString(),
  );

  const resultsLocation = inputLocation.replace(".docx", ".pdf");

  fs.cpSync(resultsLocation, outputLocation);

  return fs.createReadStream(resultsLocation);
};

export const DocumentConversionService: Service & {
  docxToPdf;
} = {
  initialize,
  docxToPdf,
};

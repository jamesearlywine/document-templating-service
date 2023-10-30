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
  outputLocation: string;
}): Promise<NodeJS.ReadableStream> => {
  await initialize();

  execSync(buildConvertDocxToPdfCommand({ inputFilepath: inputLocation }));
  outputLocation = inputLocation.replace(".docx", ".pdf");

  return fs.createReadStream(outputLocation);
};

export const DocumentConversionService: Service & {
  docxToPdf;
} = {
  initialize,
  docxToPdf,
};

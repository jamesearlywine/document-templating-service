import PizZip from "pizzip";
import fs from "fs";
import Docxtemplater from "docxtemplater";
import { TemplateData } from "src/data/template-data";

export const generateTemplatedContent = ({
  templateFilepath,
  data,
  outputFilepath,
  returnBuffer = false,
}: {
  templateFilepath: string;
  data: TemplateData;
  outputFilepath?: string;
  returnBuffer?: boolean;
}): Buffer => {
  if (!outputFilepath && !returnBuffer) {
    throw new Error(
      "DocxTemplaterSerbvice.generatedTemplatedContent(): You must specify either outputFilepath or returnBuffer",
    );
  }

  const templateFileContent = fs.readFileSync(templateFilepath, "binary");
  const zip = new PizZip(templateFileContent);

  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render(data);

  const buf = doc.getZip().generate({
    type: "nodebuffer",
    // compression: DEFLATE adds a compression step.
    // For a 50MB output document, expect 500ms additional CPU time
    // compression: "DEFLATE"
  });

  // buf is a nodejs Buffer, you can either write it to a
  // file or res.send it with express for example.
  if (outputFilepath) {
    fs.writeFileSync(outputFilepath, buf);
  }

  return returnBuffer ? buf : null;
};

import PizZip from "pizzip";
import fs from "fs";
import Docxtemplater from "docxtemplater";

export const generateFromTemplateContent = ({
  templateContent,
  data,
  outputFilepath,
}: {
  templateContent: string;
  data: Record<string, unknown>;
  outputFilepath?: string;
}): Buffer => {
  const zip = new PizZip(templateContent);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  doc.render(data);

  const outputBuffer = doc.getZip().generate({
    type: "nodebuffer",
    // compression: DEFLATE adds a compression step.
    // For a 50MB output document, expect 500ms additional CPU time
    // compression: "DEFLATE"
  });

  // outputBuffer is a nodejs Buffer, you can either write it to a
  // file or res.send it with express for example.
  if (outputFilepath) {
    fs.writeFileSync(outputFilepath, outputBuffer);
  }

  return outputBuffer;
};

export const generateFromTemplateFile = ({
  templateFilepath,
  data,
  outputFilepath,
}: {
  templateFilepath: string;
  data: Record<string, unknown>;
  outputFilepath?: string;
}): Buffer => {
  const templateContent = fs.readFileSync(templateFilepath, "binary");

  return generateFromTemplateContent({
    templateContent,
    data,
    outputFilepath,
  });
};

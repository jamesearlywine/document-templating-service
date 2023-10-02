const { build } = require("esbuild");
const path = require("path");

const sharedConfig = {
  bundle: true,
  minify: true,
  platform: "node",
};

const bundles = [
  {
    in: path.resolve("./src/handlers/generateDocument/generateDocument.ts"),
    out: path.resolve("./build/handlers/generateDocument/generateDocument.js"),
  },
  {
    in: path.resolve("./src/handlers/createOrUpdateDocumentTemplate/index.ts"),
    out: path.resolve(
      "./build/handlers/createOrUpdateDocumentTemplate/index.js",
    ),
  },
  {
    in: path.resolve(
      "./src/handlers/afterDocumentTemplateFileUploaded/index.ts",
    ),
    out: path.resolve(
      "./build/handlers/afterDocumentTemplateFileUploaded/index.js",
    ),
  },
  {
    in: path.resolve(
      "./src/handlers/getDocumentTemplatePresignedUploadUrl/index.ts",
    ),
    out: path.resolve(
      "./build/handlers/getDocumentTemplatePresignedUploadUrl/index.js",
    ),
  },
  {
    in: path.resolve("./src/handlers/getDocumentTemplates/index.ts"),
    out: path.resolve("./build/handlers/getDocumentTemplates/index.js"),
  },
  {
    in: path.resolve("./src/handlers/getDocumentTemplate/index.ts"),
    out: path.resolve("./build/handlers/getDocumentTemplate/index.js"),
  },
];

bundles.forEach((bundle) => {
  build({
    ...sharedConfig,
    entryPoints: [bundle.in],
    outfile: bundle.out,
  });
});

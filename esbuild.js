const { build } = require("esbuild");
const { copy } = require("esbuild-plugin-copy");
const path = require("path");

const sharedConfig = {
  bundle: true,
  minify: false,
  sourcemap: true,
  platform: "node",
};

const bundles = [
  {
    in: path.resolve(
      "./src/handlers/generatedDocument/createGeneratedDocument.handler.ts",
    ),
    out: path.resolve("./build/handlers/createGeneratedDocument/index.js"),
    copy: {
      assets: [
        {
          from: [
            "./src/handlers/generatedDocument/createGeneratedDocument.handler.Dockerfile",
          ],
          to: ".",
        },
      ],
    },
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
  {
    in: path.resolve("./src/handlers/deleteDocumentTemplate/index.ts"),
    out: path.resolve("./build/handlers/deleteDocumentTemplate/index.js"),
  },
];
const doBuild = async () => {
  await bundles.forEach((bundle) => {
    const plugins = [];
    if (bundle.copy) {
      plugins.push(copy(bundle.copy));
    }
    build({
      ...sharedConfig,
      entryPoints: [bundle.in],
      outfile: bundle.out,
      plugins: [...plugins],
    });
  });
};

doBuild();

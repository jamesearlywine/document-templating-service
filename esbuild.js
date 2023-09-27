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
    in: path.resolve(
      "./src/handlers/createOrUpdateDocumentTemplate/createOrUpdateDocumentTemplate.ts",
    ),
    out: path.resolve(
      "./build/handlers/createOrUpdateDocumentTemplate/createOrUpdateDocumentTemplate.js",
    ),
  },
];

bundles.forEach((bundle) => {
  build({
    ...sharedConfig,
    entryPoints: [bundle.in],
    outfile: bundle.out,
  });
});

const { build } = require("esbuild");
const path = require("path");

const sharedConfig = {
  bundle: true,
  minify: true,
  platform: "node",
};

const bundles = [
  {
    in: path.resolve("src/handlers/mergeDocumentAndData/mergeDocumentAndData.ts"),
    out: path.resolve("build/handlers/mergeDocumentAndData/mergeDocumentAndData.js")
  }
];

bundles.forEach(bundle => {
  build({
    ...sharedConfig,
    entryPoints: [bundle.in],
    outfile: bundle.out
  });
});

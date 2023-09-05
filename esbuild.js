const { build } = require('esbuild');

const sharedConfig = {
  bundle: true,
  minify: true,
  platform: "node",
}

const bundles = [
  {
    in: "src/handlers/mergeDocumentAndData/mergeDocumentAndData.ts",
    out: "build/handlers/mergeDocumentAndData/mergeDocumentAndData.js"
  }
];

bundles.forEach(bundle => {
  build({
    ...sharedConfig,
    entryPoints: [bundle.in],
    outfile: bundle.out
  });
});

const { build } = require('esbuild');

const sharedConfig = {
  bundle: true,
  minify: true,
  platform: "node",
}

const entryPoints = [
  {
    in: "src/handlers/mergeDocumentAndData/mergeDocumentAndData.ts",
    out: "build/handlers/mergeDocumentAndData/mergeDocumentAndData.js"
  }
];

entryPoints.forEach(entryPoint => {
  build({
    ...sharedConfig,
    entryPoints: [entryPoint.in],
    outfile: entryPoint.out
  });
});

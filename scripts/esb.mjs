import * as esbuild from "esbuild";

import { writeFile } from "fs/promises";

const saveMetafile = (metafile) => {
  return writeFile(".esbuild.metafile.json", JSON.stringify(metafile, null, 2));
};

const formatMetafile = (metafile, verbose = true) => {
  return esbuild.analyzeMetafile(result.metafile, {
    verbose: verbose,
  });
};

const result = await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "bin/index.mjs",
  minify: true,
  keepNames: false,
  packages: "external",
  format: "esm",
  tsconfig: "tsconfig.json",
  sourcemap: false,
  treeShaking: true,
  write: true,
  platform: "node",
  mainFields: ["module"],
  target: ["es2020", "node20"],
  metafile: true,
  color: true,
  logLevel: "debug",
});

console.log(result);

const ls = [
  saveMetafile(result.metafile),
  formatMetafile(result.metafile, true),
];

const [nulll, analy] = await Promise.all(ls);

console.log(analy);

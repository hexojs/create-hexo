import * as esbuild from "esbuild";

import { writeFile } from "node:fs/promises";

const args = process.argv.slice(2);

const saveMetafile = (metafile) => {
  return writeFile(".esbuild.metafile.json", JSON.stringify(metafile, null, 2));
};

const formatMetafile = (metafile, verbose = true) => {
  return esbuild.analyzeMetafile(metafile, {
    verbose: verbose,
  });
};

const esbuildOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "bin/index.mjs",
  minify: true,
  keepNames: false,
  packages: "bundle",
  external: ["commander"],
  format: "esm",
  tsconfig: "tsconfig.json",
  sourcemap: false,
  treeShaking: true,
  write: true,
  platform: "node",
  target: ["es2020", "node20"],
  metafile: true,
  color: true,
  logLevel: "debug",
  legalComments: "linked",
};

if (args.includes("--watch")) {
  let ctx = await esbuild.context({ ...esbuildOptions });
  try {
    await ctx.watch().then(() => {
      console.log("Start watching...");
    });
  } catch (e) {
    await ctx.dispose().then(() => {
      console.log("Stopped watching.");
    });
    throw e;
  }
} else {
  const result = await esbuild.build({ ...esbuildOptions });

  const pms = [
    saveMetafile(result.metafile),
    formatMetafile(result.metafile, true).then((analysis) =>
      console.log(analysis),
    ),
  ];

  await Promise.all(pms);
}

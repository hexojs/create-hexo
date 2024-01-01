import { readFileSync } from "node:fs";
import { exportVariable } from "@actions/core";
const { version } = JSON.parse(readFileSync("package.json"));
console.info(version);
// process.stdout.write(`::set-env name=version::${version}`);
exportVariable("version", version);

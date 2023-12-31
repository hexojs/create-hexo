import { readFileSync } from "node:fs";
import * as core from "@actions/core";
const { version } = JSON.parse(readFileSync("package.json"));
console.info(version);
core.exportVariable("version", version);

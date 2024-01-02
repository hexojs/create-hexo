import { readFile, writeFile } from "node:fs/promises";

const pkg = await readFile("package.json", "utf8").then((data) => {
  return JSON.parse(data);
});

const env_scope = process.env.SCOPE;
let scope;
if (env_scope && env_scope.startsWith("@")) {
  scope = env_scope;
} else {
  throw Error("scope error");
}

pkg.name = pkg.name.startsWith("@") ? pkg.name : `${scope}/${pkg.name}`;

await writeFile("package.json", JSON.stringify(pkg, null, 2), "utf-8");

console.info(pkg.name);

import { readFile, writeFile } from "node:fs/promises";

const env_path = process.env.GITHUB_ENV;

const getVersion = readFile("package.json", "utf8").then((data) => {
  const { version } = JSON.parse(data);
  console.info(version);
  return version;
});

const [version] = [await getVersion];

await writeFile(env_path, `version=${version}`, { flag: "a" });

console.log("done");

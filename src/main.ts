import { dirname, resolve as pathResolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";

import { Command, Option } from "commander";

import { Logger } from "./log.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logger = new Logger();
logger.time("create-hexo");

const STARTER = "hexo-starter";
const STARTER_DIR = pathResolve(__dirname, `../${STARTER}/`);
const RM_FILES = [".git", ".github"];
const ADD_FILES = ["scripts/.gitkeep", "source/_drafts/.gitkeep"];

type PM = "pnpm" | "npm" | "yarn" | "bun";

interface InitOptions {
  siteName: string;
  sitePath: string;
  packageManager: PM | "auto";
  force: boolean;
}

let packageJson: any;
let starterVersion: string;
let initOptions: InitOptions = {
  siteName: "hexo-site",
  sitePath: "./",
  packageManager: "npm",
  force: false,
};

const main = async () => {
  [packageJson, starterVersion] = await pre();

  parseArgs();

  printInfo();

  initOptions.force
    ? logger.warn("Running in force mode. It's dangerous!")
    : await checkPath(initOptions.sitePath);

  logger.group(`Copying \`${STARTER}\``);
  const [_, pm] = await Promise.all([copyStarter(), checkPackageManager()]);
  logger.groupEnd();

  logger.group(`Installing packages via \`${pm}\``);
  await installPackage(pm);
  logger.groupEnd();

  logger.group(`Post processing`);
  await post();
  logger.groupEnd();

  await end();
};

const pre = () => {
  logger.group("Start");

  const packageJson: Promise<object> = readFile(
    pathResolve(__dirname, "../package.json"),
    {
      encoding: "utf8",
    },
  ).then((obj) => {
    return JSON.parse(obj);
  });

  const starterVersion = readFile(pathResolve(__dirname, "../hash"), {
    encoding: "utf8",
  });

  logger.groupEnd();
  return Promise.all([packageJson, starterVersion]);
};

const parseArgs = () => {
  const program = new Command(packageJson.name)
    .argument("[site_directory]", "the folder that you want to load Hexo")
    .usage(`[site_directory]`)
    .action((site_directory: string) => {
      const path = site_directory
        ? (initOptions.sitePath = pathResolve(site_directory))
        : pathResolve(initOptions.sitePath);
      initOptions.sitePath = path;
      initOptions.siteName = path.split(sep).reverse()[0];
    })
    .addOption(
      new Option(
        "--pm, --packageManager <packageManager>",
        "Specify the packageManager which use to Install packages",
      )
        .choices(["auto", "npm", "pnpm", "yarn", "bun"])
        .default("auto"),
    )
    .version(
      packageJson.version,
      undefined,
      `output the version of \`${packageJson.name}\``,
    )
    .on("--help", () => {
      printUsage();
    })
    .option("-f, --force", "DON'T USE! dangerous!", false)
    .allowUnknownOption()
    .parse(process.argv);

  initOptions = Object.freeze(Object.assign(initOptions, program.opts()));
};

const printUsage = () => {
  logger.group("Usage: ");
  logger.l("  npm init hexo [site_directory]", "\n");
  logger.l(`  pnpm create hexo [site_directory]`, "\n");
  logger.l("  yarn create hexo [site_directory]", "\n");
  logger.l("  bun create hexo [site_directory]", "\n");
  logger.groupEnd();
};

const printInfo = () => {
  logger.group("Env Info");
  logger.log("runtime path:    ", process.argv[0]);
  logger.log("runtime version: ", process.versions.node);
  logger.log(`bin path:        `, process.argv[1]);
  logger.log(`bin version:     `, packageJson.version);
  logger.log(`starter version: `, starterVersion);
  logger.log("argv:            ", process.argv.slice(2));
  logger.log("initOptions:     ", "\n", initOptions, "\n");
  logger.groupEnd();
};

const copyStarter = () => {
  return cp(STARTER_DIR, initOptions.sitePath, {
    force: initOptions.force,
    recursive: true,
  })
    .then(() => {
      logger.log(`Copied \`${STARTER}\` to "${initOptions.sitePath}"`);
    })
    .catch((err) => {
      logger.error("Copy failed: ", err);
      process.exit(1);
    })
    .finally(() => {
      logger.groupEnd();
    });
};

const checkPath = (path: string) => {
  return readdir(path)
    .then((files) => {
      if (files.length !== 0) {
        logger.error(
          `path: "${path}" is not empty, please specify a empty or nonexistent folder`,
        );
        process.exit(1);
      } else {
        logger.info(`Your hexo site will be initialized in "${path}"`);
      }
    })
    .catch((err) => {
      logger.info(`Your hexo site will be initialized in "${path}"`);
    });
};

const checkPackageManager = (): Promise<PM> => {
  return new Promise((resolve) => {
    if (initOptions.packageManager !== "auto") {
      resolve(initOptions.packageManager as PM);
    }
    const runPath = process.argv[1].toLowerCase();
    const UA = process.env.npm_config_user_agent?.toLowerCase();
    let pm: PM = "npm";
    if (
      UA?.startsWith("pnpm") ||
      runPath.includes("dlx") ||
      runPath.includes("pnpm")
    ) {
      pm = "pnpm";
    } else if (UA?.startsWith("yarn") || runPath.includes("yarn")) {
      pm = "yarn";
    } else if (UA?.startsWith("bun")) {
      pm = "bun";
    } else {
      pm = "npm";
    }
    resolve(pm);
  });
};

const installPackage = (pm: string) => {
  return new Promise((resolve, reject) => {
    const child = spawn(pm, ["install"], {
      cwd: initOptions.sitePath,
      shell: true,
    });
    child.stdout?.setEncoding("utf8");
    child.stdout?.on("data", (data) => {
      logger.log(pm, data);
    });
    child.stderr?.setEncoding("utf8");
    child.stderr?.on("data", (data) => {
      logger.warn(pm, data);
    });
    child.on("error", (err) => {
      logger.error("Install error: ", err);
    });
    child.on("close", (code) => {
      if (code !== 0) {
        logger.error("Install error: ", code);
        reject(code);
      } else {
        logger.info("Install package finished");
        resolve(0);
      }
    });
    return child;
  });
};

const post = () => {
  const ls: Array<Promise<unknown>> = [];

  RM_FILES.forEach((item) => {
    ls.push(
      rm(pathResolve(initOptions.sitePath, item), {
        force: true,
        recursive: true,
      })
        .then(() => {
          logger.log(`remove "${item}" success!`);
        })
        .catch((err) => {
          logger.error(`remove "${item}" fail: `, err);
        }),
    );
  });

  ADD_FILES.forEach((item) => {
    const file = pathResolve(initOptions.sitePath, item);
    const dir = dirname(file);

    ls.push(
      mkdir(dir, { recursive: true })
        .then(() => {
          if (!existsSync(file)) {
            return writeFile(file, "");
          }
        })
        .then(() => {
          logger.log(`add "${item}" success!`);
        })
        .catch((err) => {
          logger.error(`add "${item}" fail: `, err);
        }),
    );
  });

  return Promise.all(ls);
};

const end = async () => {
  logger.group("Finished!");
  logger.info("Enjoy yourself!", "\n");
  logger.groupEnd();
  logger.timeEnd("create-hexo");
};

export { main };

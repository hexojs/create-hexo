import { Console, ConsoleConstructorOptions } from "node:console";

import { default as picocolors } from "picocolors";

const { bold, bgWhite, gray, bgCyan, bgYellow, bgRed, bgBlue, underline } =
  picocolors;

class Logger extends Console {
  constructor(
    consoleOptions: ConsoleConstructorOptions = {
      stdout: process.stdout,
      stderr: process.stderr,
    },
  ) {
    super(consoleOptions);
  }
  debug(...args: any[]) {
    super.debug(bgWhite(bold("DEBUG")), ...args);
  }
  log(...args: any[]) {
    super.log(gray(bold("LOG  ")), ...args);
  }
  info(...args: any[]) {
    super.info(bgCyan(bold("INFO ")), ...args);
  }
  warn(...args: any[]) {
    super.warn(bgYellow(bold("WARN ")), ...args);
  }
  error(...args: any[]) {
    super.error(bgRed(bold("ERROR")), ...args);
  }
  group(...args: any[]): void {
    super.log();
    super.group(...args.map((arg) => bgBlue(bold(underline(arg)))));
  }
  t = super.trace;
  d = super.debug;
  l = super.log;
  i = super.info;
  w = super.warn;
  e = super.error;
  time = super.time;
  timetimeEnd = super.timeEnd;
}
const useless = () => {
  console.log("asdasdasd");
};
export { Logger, useless };

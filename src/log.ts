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
  d(...args: any[]) {
    super.debug(bgWhite(bold("DEBUG")), ...args);
  }
  l(...args: any[]) {
    super.log(gray(bold("LOG  ")), ...args);
  }
  i(...args: any[]) {
    super.info(bgCyan(bold("INFO ")), ...args);
  }
  w(...args: any[]) {
    super.warn(bgYellow(bold("WARN ")), ...args);
  }
  e(...args: any[]) {
    super.error(bgRed(bold("ERROR")), ...args);
  }
  g(...args: any[]): void {
    super.log();
    super.group(...args.map((arg) => bgBlue(bold(underline(arg)))));
  }
}

export { Logger };

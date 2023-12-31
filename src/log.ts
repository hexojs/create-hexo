import { Console, ConsoleConstructorOptions } from "node:console";
import { default as chalk } from "chalk";

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
    super.debug(chalk.bgWhite.bold("DEBUG"), ...args);
  }
  log(...args: any[]) {
    super.log(chalk.gray.bold("LOG  "), ...args);
  }
  info(...args: any[]) {
    super.info(chalk.bgCyan.bold("INFO "), ...args);
  }
  warn(...args: any[]) {
    super.warn(chalk.bgYellow.bold("WARN "), ...args);
  }
  error(...args: any[]) {
    super.error(chalk.bgRed.bold("ERROR"), ...args);
  }
  group(...args: any[]): void {
    super.log();
    super.group(chalk.bgBlue.bold.underline(...args));
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

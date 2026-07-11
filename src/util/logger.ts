const PREFIX = "[kAPI]";

type Level = "debug" | "info" | "warn" | "error";

function log(level: Level, ...args: unknown[]) {
  const fn = console[level] as (...a: unknown[]) => void;
  fn(`${PREFIX}`, ...args);
}

export const logger = {
  debug: (...args: unknown[]) => log("debug", ...args),
  info:  (...args: unknown[]) => log("info",  ...args),
  warn:  (...args: unknown[]) => log("warn",  ...args),
  error: (...args: unknown[]) => log("error", ...args),
};

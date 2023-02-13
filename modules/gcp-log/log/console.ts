import { format } from "util"; // Node.js library
import { Logging, LogSync } from "@google-cloud/logging";
import { getTrace as getTraceId } from "./storage";



export async function makeLogger() {
  const logging = new Logging();
  await logging.setDetectedResource();

  const log = logging.logSync("structured-log");
  return log;
}

type LoggerMethod = keyof LogSync;

type ConsoleMethodMap<Methods extends keyof Console> = {
  [name in Methods]: LoggerMethod;
}

const consoleMethodMap: ConsoleMethodMap<"trace" | "debug" | "info" | "log" | "warn" | "error"> = {
  "trace": "debug",
  "debug": "debug",
  "info": "info",
  "log": "info",
  "warn": "warning",
  "error": "error",
};

export function applyConsolePatch(logger: LogSync) {
  exposeOriginMethods();

  for (
    const [consoleMethod, loggerMethod] of Object.entries(consoleMethodMap)
  ) {
    console[consoleMethod as /*dummy type*/"log"] = textLog(logger, loggerMethod);
  }
}

const textLog =
  (logger: LogSync, method: LoggerMethod) =>
    (message?: any, ...optionalParams: any[]) => {
      const textPayload = format(message, ...optionalParams);

      const meta = makeEntryMeta();
      const entry = logger.entry(meta, textPayload);

      (logger[method] as LogSync["write"])(entry);
    };


function makeEntryMeta() {
  const traceId = getTraceId();
  if (traceId) {
    return {
      // trace: `projects/{{ projectId }}/traces/${traceId}`,
      trace: traceId,
    };
  }
  return {};
}


function exposeOriginMethods() {
  for (const name of Object.keys(consoleMethodMap)) {
    if (!console["_" + name]) {
      console["_" + name] = console[name];
    }
  }
}

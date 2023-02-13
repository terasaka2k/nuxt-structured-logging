import { format } from "util"; // Node.js library
import { Logging, LogSync } from "@google-cloud/logging";
import { getTrace as getTraceId } from "./storage";


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


export async function applyConsolePatch() {
  const logger = await makeLogger();

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

      const meta = makeEntryMeta(logger.logging.projectId);
      const entry = logger.entry(meta, textPayload);

      (logger[method] as LogSync["write"])(entry);
    };


async function makeLogger(logName = "app") {
  const logging = new Logging();
  await logging.setProjectId();
  await logging.setDetectedResource();
  console.assert(logging.projectId, 'Project ID must be set');

  const log = logging.logSync(logName);
  return log;
}


function makeEntryMeta(projectId: string) {
  const traceId = getTraceId();
  if (traceId) {
    return {
      trace: `projects/${projectId}/traces/${traceId}`,
    };
  }
  return {};
}

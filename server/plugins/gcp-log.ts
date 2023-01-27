import { format } from "util"; // Node.js library
import { Logging, LogSync } from "@google-cloud/logging";
import { Layer, EventHandler } from "h3";


export default defineNitroPlugin((nitroApp) => {
  const layer: Layer = {
    route: "",
    handler: eventHandler(captureTraceId),
  };

  // https://github.com/nuxt/nuxt/issues/14177#issuecomment-1397346652
  nitroApp.h3App.stack.unshift(layer);

  applyPlugin();
});


const GOOGLE_CLOUD_PROJECT = useRuntimeConfig().GOOGLE_CLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
let _traceId = '';  // FIXME: MUST BE ISOLATED PER REQUEST

function clearTrace() {
  _traceId = '';
}

function setTrace(trace: string) {
  _traceId = trace;
}

function getTrace() {
  return _traceId;
}


const captureTraceId: EventHandler = (event) => {
  clearTrace();

  const traceHeader = event.node.req.headers['X-Cloud-Trace-Context'.toLowerCase()];
  if (!traceHeader || typeof traceHeader !== 'string') {
    return;
  }

  const [trace, _] = traceHeader.split(',', /*limit=*/1);

  const logTrace = `projects/${GOOGLE_CLOUD_PROJECT}/traces/${trace}`;
  setTrace(logTrace);

  return void 0; // delegate to a next handler
};


let once = false;

export async function applyPlugin() {
  if (once) {
    return;
  }
  once = true;

  const logger = await makeLogger();

  applyConsolePatch(logger);
}

async function makeLogger() {
  const logging = new Logging({
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
  });
  await logging.setDetectedResource();

  const log = logging.logSync("structured-log");

  log.info(log.entry("Created a logger"));
  return log;
}

type ConsoleMethod = keyof Console;
type LoggerMethod = keyof LogSync;

const consoleMethodMap: { [name in ConsoleMethod]: LoggerMethod } = {
  "trace": "trace",
  "debug": "debug",
  "info": "info",
  "log": "info",
  "warn": "warning",
  "error": "error",
};

function applyConsolePatch(logger: LogSync) {
  for (const name of Object.keys(consoleMethodMap)) {
    if (!console["_" + name]) {
      console["_" + name] = console[name];
    }
  }

  for (
    const [consoleMethod, loggerMethod] of Object.entries(consoleMethodMap)
  ) {
    console[consoleMethod] = textLog(logger, loggerMethod);
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
    const trace = getTrace();
    if (trace) {
      return {
        trace,
      };
    }
    return {};
  }

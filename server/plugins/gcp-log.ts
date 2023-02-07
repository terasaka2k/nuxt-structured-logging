import { AsyncLocalStorage } from 'node:async_hooks';
import { format } from "util"; // Node.js library
import { Logging, LogSync } from "@google-cloud/logging";
import { NitroApp } from 'nitropack';
import { Layer, EventHandler } from "h3";


export default defineNitroPlugin((nitroApp) => {
  applyPlugin(nitroApp);
});


const GOOGLE_CLOUD_PROJECT = useRuntimeConfig().GOOGLE_CLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;

export const storage = new AsyncLocalStorage();


function setTrace(trace: string) {
  return storage.getStore().trace = trace;
}

function getTrace() {
  return storage.getStore().trace;
}


const captureTraceId: EventHandler = (event) => {
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

export async function applyPlugin(nitroApp: NitroApp) {
  if (once) {
    return;
  }
  once = true;

  const layer: Layer = {
    route: "",
    handler: eventHandler(captureTraceId),
  };

  // https://github.com/nuxt/nuxt/issues/14177#issuecomment-1397346652
  nitroApp.h3App.stack.unshift(layer);

  const h3AppHandler = nitroApp.h3App.handler;
  nitroApp.h3App.handler = (...args) => {
    return storage.run(createStore(), () => {
      return h3AppHandler(...args);
    });
  };

  const logger = await makeLogger();

  applyConsolePatch(logger);
}

function createStore() {
  return {
    trace: '',
  };
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

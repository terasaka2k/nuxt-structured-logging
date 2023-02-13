import { NitroApp } from 'nitropack';
import { applyConsolePatch, makeLogger } from '../../log/console';
import { runInStorageScope } from '../../log/storage';
import { captureTraceId } from '../../log/trace';


export default defineNitroPlugin((nitroApp) => {
  applyPlugin(nitroApp);
});


export async function applyPlugin(nitroApp: NitroApp) {
  const h3AppHandler = nitroApp.h3App.handler;

  nitroApp.h3App.handler = (event) => {
    return runInStorageScope(() => {
      captureTraceId(event);
      return h3AppHandler(event);
    });
  };

  const logger = await makeLogger();

  applyConsolePatch(logger);
};

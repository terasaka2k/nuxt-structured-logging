import { NitroApp } from 'nitropack';
import { applyConsolePatch } from '../../log/console';
import { runInStorageScope } from '../../log/storage';
import { captureTraceId } from '../../log/trace';


export default defineNitroPlugin(async (nitroApp) => {
  await applyPlugin(nitroApp);
});


export async function applyPlugin(nitroApp: NitroApp) {
  const h3AppHandler = nitroApp.h3App.handler;

  const patching: Promise<any> = applyConsolePatch();
  const patchDoneAnyway = patching.catch(err => {/*ignore*/ });

  nitroApp.h3App.handler = (event) => {
    return runInStorageScope(async () => {
      captureTraceId(event);

      await patchDoneAnyway;
      return h3AppHandler(event);
    });
  };

  await patching;
};

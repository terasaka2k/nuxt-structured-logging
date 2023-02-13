import { getTrace } from '../../modules/gcp-log/log/storage';


export default defineEventHandler(async (event) => {
  console.info("world from server info", getTrace());
  await (async () => {
    console.warn("world from server warn", getTrace());
  })();
  setTimeout(() => {
    console.error("world from server error", getTrace());
  }, 1000);
  return {};
});

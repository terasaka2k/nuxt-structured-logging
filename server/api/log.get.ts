import { storage } from '../plugins/gcp-log';

export default defineEventHandler(async(event) => {
  console.warn("world from server 1", storage.getStore());
  await (async() => {
    console.warn("world from server 2", storage.getStore());
  })();
  setTimeout(() => {
    console.warn("world from server 3", storage.getStore());
  }, 1000);
  return {};
});

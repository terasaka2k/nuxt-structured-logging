import { storage } from '../plugins/gcp-log';

export default defineEventHandler((event) => {

  console.log("New request: " + event.node.req.url, storage.getStore());
});

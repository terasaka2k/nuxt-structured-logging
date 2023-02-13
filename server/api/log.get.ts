import { getTrace } from '../../modules/gcp-log/log/storage';


export default defineEventHandler(async(event) => {
  console.warn("world from server 1", getTrace());
  await (async() => {
    console.warn("world from server 2", getTrace());
  })();
  setTimeout(() => {
    console.warn("world from server 3", getTrace());
  }, 1000);
  return {};
});

import { AsyncLocalStorage } from 'node:async_hooks';

type Store = ReturnType<typeof createStore>;


const storage = new AsyncLocalStorage<Store>();

export function runInStorageScope<R>(func: () => R): R {
  return storage.run(createStore(), () => func());
}


function createStore() {
  return {
    traceId: '',
  };
}

export function setTraceId(traceId: string) {
  const store = storage.getStore();
  if (!store) {
    return;
  }
  store.traceId = traceId;
}

export function getTrace() {
  return storage.getStore()?.traceId || '';
}

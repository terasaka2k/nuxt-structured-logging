import { EventHandler } from 'h3';
import { setTraceId } from './storage';


const TRACE_HEADER = 'X-Cloud-Trace-Context'.toLowerCase();

export const captureTraceId: EventHandler = (event) => {
  const traceHeader = event.node.req.headers[TRACE_HEADER];
  if (!traceHeader || typeof traceHeader !== 'string') {
    return;
  }

  const [traceId, _] = traceHeader.split('/', /*limit=*/1);

  setTraceId(traceId);
};

import { get, getStream, post, postStream } from '@api';

const BASE = '/api/blog-agent/tasks';

export const blogAgentService = {
  createTask: (payload, config) => post(BASE, payload, config),
  getSessions: (config) => get(BASE, undefined, config),
  getTask: (id, config) => get(`${BASE}/${id}`, undefined, config),
  subscribeTaskEvents: (id, afterEventId, onEvent, config) => getStream(`${BASE}/${id}/events`, {
    ...config,
    onEvent,
    params: afterEventId ? { ...config?.params, afterEventId } : config?.params,
    headers: afterEventId
      ? { ...config?.headers, 'Last-Event-ID': String(afterEventId) }
      : config?.headers,
  }),
  runTask: (id, config) => post(`${BASE}/${id}/run`, undefined, { dedupe: false, timeout: 120000, ...config }),
  runTaskStream: (id, onEvent, config) => postStream(`${BASE}/${id}/run/stream`, undefined, { onEvent, ...config }),
  reviseTaskStream: (id, content, onEvent, config) => postStream(`${BASE}/${id}/messages/stream`, { content }, { onEvent, ...config }),
  publishTask: (id, config) => post(`${BASE}/${id}/publish`, undefined, { dedupe: false, timeout: 0, ...config }),
};

import { get, post } from '@api';

const BASE = '/api/blog-agent/tasks';

export const blogAgentService = {
  createTask: (payload, config) => post(BASE, payload, config),
  getTask: (id, config) => get(`${BASE}/${id}`, undefined, config),
  runTask: (id, config) => post(`${BASE}/${id}/run`, undefined, { dedupe: false, timeout: 120000, ...config }),
};

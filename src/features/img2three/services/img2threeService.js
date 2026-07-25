import { get, postStream, upload } from '@api';

const BASE = '/api/img2three/tasks';

export const img2threeService = {
  createTask: (file, config) => upload(BASE, file, { fieldName: 'file', config }),
  getTask: (id, config) => get(`${BASE}/${id}`, undefined, config),
  runTaskStream: (id, onEvent, config) => postStream(`${BASE}/${id}/run/stream`, undefined, { onEvent, ...config }),
};

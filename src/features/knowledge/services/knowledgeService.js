import { get, post, upload } from '@api';

const BASE = '/api/recitations';

export const knowledgeService = {
  list: (config) => get(`${BASE}/materials`, undefined, config),
  create: (payload, config) => post(`${BASE}/materials`, payload, config),
  get: (materialId, config) => get(`${BASE}/materials/${materialId}`, undefined, config),
  listAttempts: (materialId, config) => get(`${BASE}/materials/${materialId}/attempts`, undefined, config),
  listQuizzes: (materialId, config) => get(`${BASE}/materials/${materialId}/quizzes`, undefined, config),
  getAttempt: (attemptId, config) => get(`${BASE}/attempts/${attemptId}`, undefined, config),
  uploadRecording: (materialId, file, config) => upload(
    `${BASE}/materials/${materialId}/attempts`,
    file,
    { fieldName: 'file', config },
  ),
};

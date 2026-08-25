import { delete as del, get, post, put, upload } from '@api';

const BASE = '/api/recitations';

export const knowledgeService = {
  /** @param params 搜索、掌握等级、到期与归档范围，全部由服务端执行，页面不再自己过滤。 */
  list: (params, config) => get(`${BASE}/materials`, params, config),
  create: (payload, config) => post(`${BASE}/materials`, payload, config),
  get: (materialId, config) => get(`${BASE}/materials/${materialId}`, undefined, config),
  /** 部分更新：只传要改的字段，改标题不必把一万字正文原样回传一遍。 */
  update: (materialId, payload, config) => put(`${BASE}/materials/${materialId}`, payload, config),
  /** 归档与恢复是同一个端点，archived=false 即恢复。 */
  archive: (materialId, archived, config) => post(
    `${BASE}/materials/${materialId}/archive`,
    null,
    { params: { archived }, ...config },
  ),
  /** 彻底删除，连带录音记录与测验留档；调用前必须让用户二次确认。 */
  remove: (materialId, config) => del(`${BASE}/materials/${materialId}`, undefined, config),
  listAttempts: (materialId, config) => get(`${BASE}/materials/${materialId}/attempts`, undefined, config),
  listQuizzes: (materialId, config) => get(`${BASE}/materials/${materialId}/quizzes`, undefined, config),
  getAttempt: (attemptId, config) => get(`${BASE}/attempts/${attemptId}`, undefined, config),
  uploadRecording: (materialId, file, config) => upload(
    `${BASE}/materials/${materialId}/attempts`,
    file,
    { fieldName: 'file', config },
  ),
};

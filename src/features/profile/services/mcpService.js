import { delete as deleteRequest, get, post } from '@api'

const CSDN_AUTH = '/api/publishing/csdn/authorization'

export const csdnService = {
  startAuthorization: () => post(`${CSDN_AUTH}/start`),
  getAuthorizationStatus: () => get(`${CSDN_AUTH}/status`, undefined, { _silent: true, dedupe: false }),
  cancelAuthorization: () => post(`${CSDN_AUTH}/cancel`, undefined, { _silent: true, dedupe: false }),
  disconnect: () => deleteRequest(CSDN_AUTH),
}

const oauthRequest = (requestId) => `/api/mcp/oauth/authorize/requests/${encodeURIComponent(requestId)}`

export const mcpOAuthService = {
  getAuthorizationRequest: (requestId) => get(oauthRequest(requestId), undefined, { _silent: true, dedupe: false }),
  approveAuthorization: (requestId) => post(`${oauthRequest(requestId)}/approve`),
  denyAuthorization: (requestId) => post(`${oauthRequest(requestId)}/deny`),
  listClients: () => get('/api/mcp/oauth/clients', undefined, { _silent: true, dedupe: false }),
  revokeClient: (clientId) => deleteRequest(`/api/mcp/oauth/clients/${encodeURIComponent(clientId)}`),
}

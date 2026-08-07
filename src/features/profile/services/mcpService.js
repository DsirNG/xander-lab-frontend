import { delete as deleteRequest, get, post } from '@api'

const BASE = '/api/mcp/auth'

/** Returns the server-side MCP blog authorization state. */
export const mcpService = {
  getStatus: () => get(`${BASE}/status`, undefined, { _silent: true, dedupe: false }),
  getAuthorizationUrl: () => `${window.location.origin}${BASE}/login`,
}

const CSDN_AUTH = '/api/publishing/csdn/authorization'

export const csdnService = {
  startAuthorization: () => post(`${CSDN_AUTH}/start`),
  getAuthorizationStatus: () => get(`${CSDN_AUTH}/status`, undefined, { _silent: true, dedupe: false }),
  disconnect: () => deleteRequest(CSDN_AUTH),
}

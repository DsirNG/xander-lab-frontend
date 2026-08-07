import { get } from '@api'

const BASE = '/api/mcp/auth'

/** Returns the server-side MCP blog authorization state. */
export const mcpService = {
  getStatus: () => get(`${BASE}/status`, undefined, { _silent: true, dedupe: false }),
  getAuthorizationUrl: () => `${window.location.origin}${BASE}/login`,
}

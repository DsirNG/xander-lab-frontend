import { delete as deleteRequest, get, post } from '@api'

const CSDN_AUTH = '/api/publishing/csdn/authorization'

export const csdnService = {
  startAuthorization: () => post(`${CSDN_AUTH}/start`),
  getAuthorizationStatus: () => get(`${CSDN_AUTH}/status`, undefined, { _silent: true, dedupe: false }),
  disconnect: () => deleteRequest(CSDN_AUTH),
}

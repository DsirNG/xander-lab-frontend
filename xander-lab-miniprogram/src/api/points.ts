import { request } from './http'

export type PointsOverview = {
  balance: number
  consumedToday: number
  enablePreCheck: boolean
}

export type PointsLedgerItem = {
  id: number
  amount: number
  reason: string
  createdAt: string
}

export type PointsLedgerPage = {
  records: PointsLedgerItem[]
  total: number
}

export const pointsApi = {
  overview: () => request<PointsOverview>('/api/points', { method: 'GET' }),
  ledger: (page = 1, size = 20) =>
    request<PointsLedgerPage>(`/api/points/ledger?page=${page}&size=${size}`),
}

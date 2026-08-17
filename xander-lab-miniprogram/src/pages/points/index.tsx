import { Text, View } from '@tarojs/components'
import Taro, { useDidShow, useReachBottom } from '@tarojs/taro'
import { useState } from 'react'
import { pointsApi, type PointsOverview } from '@/api/points'
import { Icon } from '@/components/Icon'
import { formatDateTime } from '@/utils/format'
import './index.scss'

function showToast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

export default function Points() {
  const [overview, setOverview] = useState<PointsOverview | null>(null)
  const [ledger, setLedger] = useState<
    Array<{ id: number; amount: number; reason: string; createdAt: string }>
  >([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadedOnce, setLoadedOnce] = useState(false)

  const load = async (targetPage: number, append: boolean) => {
    setLoading(true)
    try {
      const result = await pointsApi.ledger(targetPage, 20)
      setLedger(prev => (append ? [...prev, ...result.records] : result.records))
      setTotal(result.total)
      setPage(targetPage)
    } catch (e) {
      showToast(e instanceof Error ? e.message : '积分明细加载失败')
    } finally {
      setLoading(false)
      setLoadedOnce(true)
    }
  }

  useDidShow(() => {
    pointsApi
      .overview()
      .then(setOverview)
      .catch(() => setOverview(null))
    load(1, false)
  })

  useReachBottom(() => {
    if (!loading && ledger.length < total) load(page + 1, true)
  })

  return (
    <View className="detail-page">
      <View className="sub-nav">
        <View className="nav-back" onClick={() => Taro.navigateBack()}>
          <Icon name="back" />
        </View>
        <Text className="sub-nav-title">积分明细</Text>
      </View>

      <View className="points-card points-page-card">
        <View>
          <Text className="points-balance">
            {overview ? overview.balance.toLocaleString() : '--'}
          </Text>
          <Text className="points-label">可用积分</Text>
        </View>
        <View className="points-today">
          {overview?.consumedToday != null
            ? `今日已用 ${overview.consumedToday.toLocaleString()}`
            : ''}
        </View>
      </View>

      <View className="section-title">
        <Text>消费流水</Text>
      </View>
      {loading && ledger.length === 0 ? <Text className="data-state">正在加载...</Text> : null}
      {loadedOnce && !loading && ledger.length === 0 ? (
        <Text className="data-state">暂无积分流水</Text>
      ) : null}
      {ledger.map(item => (
        <View className="ledger-item" key={item.id}>
          <View className="ledger-info">
            <Text className="ledger-reason">{item.reason || '积分变动'}</Text>
            <Text className="ledger-time">{formatDateTime(item.createdAt)}</Text>
          </View>
          <Text className={`ledger-amount ${item.amount >= 0 ? 'positive' : 'negative'}`}>
            {item.amount >= 0 ? `+${item.amount}` : item.amount}
          </Text>
        </View>
      ))}
      {loading && ledger.length > 0 ? <Text className="data-state">加载中...</Text> : null}
    </View>
  )
}

import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Plan } from '@/api/plans'
import { Icon } from './Icon'
import { PlanStatusBadge } from './StatusBadge'
import { formatInstant } from '@/utils/format'

type ActionKey = 'pause' | 'resume' | 'trigger' | 'cancel' | 'delete'

const ACTION_DEFS: Array<{
  key: ActionKey
  icon: string
  title: string
  show: (plan: Plan) => boolean
}> = [
  {
    key: 'trigger',
    icon: 'play',
    title: '立即执行',
    show: plan => !plan.runOnce && (plan.status === 'ACTIVE' || plan.status === 'PAUSED'),
  },
  { key: 'pause', icon: 'pause', title: '暂停', show: plan => plan.status === 'ACTIVE' },
  { key: 'resume', icon: 'play', title: '恢复', show: plan => plan.status === 'PAUSED' },
  {
    key: 'cancel',
    icon: 'close',
    title: '取消',
    show: plan => plan.status === 'ACTIVE' || plan.status === 'PAUSED',
  },
  { key: 'delete', icon: 'trash', title: '删除', show: plan => plan.status !== 'RUNNING' },
]

export function PlanCard({
  plan,
  onAction,
}: {
  plan: Plan
  onAction: (action: ActionKey) => void
}) {
  const visibleActions = ACTION_DEFS.filter(def => def.show(plan))

  return (
    <View className="plan-card">
      <View className="plan-card-head">
        <View className="plan-card-title-wrap">
          <Text className="plan-card-title">{plan.topic}</Text>
          {plan.runOnce ? <Text className="badge badge-purple">一次性</Text> : null}
          {plan.topics?.length > 0 && !plan.runOnce ? (
            <Text className="plan-queue">队列 {plan.topics.length}</Text>
          ) : null}
        </View>
        <PlanStatusBadge status={plan.status} />
      </View>
      <View className="plan-card-meta">
        <Text className="plan-meta-item">
          触发 {(plan.triggerTimes?.length ? plan.triggerTimes : [plan.triggerTime]).join(' / ')}
        </Text>
        <Text className="plan-meta-item">
          下次运行 {formatInstant(plan.nextRunAt)}（{plan.timezone}）
        </Text>
        <View className="plan-syncs">
          {plan.syncCsdn ? <Text className="badge badge-blue">CSDN</Text> : null}
          {plan.syncJuejin ? <Text className="badge badge-blue">掘金</Text> : null}
        </View>
      </View>
      {plan.errorMessage ? <Text className="plan-error">{plan.errorMessage}</Text> : null}
      {visibleActions.length > 0 ? (
        <View className="plan-actions" onClick={e => e.stopPropagation()}>
          {visibleActions.map(({ key, icon, title }) => (
            <View
              className="plan-action-btn"
              key={key}
              onClick={() => {
                Taro.vibrateShort({ type: 'light' }).catch(() => undefined)
                onAction(key)
              }}
            >
              <Icon name={icon as any} className="plan-action-icon" />
              <Text className="plan-action-text">{title}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  )
}

import { Button, Input, Switch, Text, Textarea, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { planApi } from '@/api/plans'
import { Icon } from '@/components/Icon'
import './index.scss'

function showToast(title: string) {
  Taro.showToast({ title, icon: 'none' })
}

type Mode = 'custom' | 'ai'

export default function PlanCreate() {
  const [mode, setMode] = useState<Mode>('custom')
  const [loading, setLoading] = useState(false)
  const [topic, setTopic] = useState('')
  const [triggerTimes, setTriggerTimes] = useState('09:00')
  const [timezone, setTimezone] = useState('Asia/Shanghai')
  const [syncCsdn, setSyncCsdn] = useState(false)
  const [syncJuejin, setSyncJuejin] = useState(false)
  const [audience, setAudience] = useState('')
  const [tone, setTone] = useState('')
  const [topicsQueue, setTopicsQueue] = useState('')
  const [days, setDays] = useState('7')
  const [aiTime, setAiTime] = useState('09:00')

  const handleCustomCreate = async () => {
    const trimmedTopic = topic.trim()
    if (!trimmedTopic) {
      showToast('请输入计划主题')
      return
    }
    if (loading) return
    setLoading(true)
    try {
      const times = triggerTimes
        .split(/[,，]/)
        .map(item => item.trim())
        .filter(Boolean)
      await planApi.create({
        topic: trimmedTopic,
        triggerTimes: times,
        timezone,
        syncCsdn,
        syncJuejin,
        audience: audience.trim() || undefined,
        tone: tone.trim() || undefined,
        topics: topicsQueue
          .split('\n')
          .map(item => item.trim())
          .filter(Boolean),
      })
      showToast('计划已创建')
      setTimeout(() => Taro.navigateBack(), 700)
    } catch (e) {
      showToast(e instanceof Error ? e.message : '创建失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAiGenerate = async () => {
    const trimmedTopic = topic.trim()
    if (!trimmedTopic) {
      showToast('请输入主题')
      return
    }
    const dayCount = Number(days)
    if (!dayCount || dayCount < 1 || dayCount > 30) {
      showToast('天数需在 1-30 之间')
      return
    }
    if (loading) return
    setLoading(true)
    try {
      const result = await planApi.aiGenerate({
        topic: trimmedTopic,
        days: dayCount,
        time: aiTime.trim() || '09:00',
        timezone,
        syncCsdn,
        syncJuejin,
        audience: audience.trim() || undefined,
        tone: tone.trim() || undefined,
      })
      showToast(`已生成 ${result.length} 个计划`)
      setTimeout(() => Taro.navigateBack(), 700)
    } catch (e) {
      showToast(e instanceof Error ? e.message : '生成失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="detail-page plan-create-page">
      <View className="sub-nav">
        <View className="nav-back" onClick={() => Taro.navigateBack()}>
          <Icon name="back" />
        </View>
        <Text className="sub-nav-title">新建计划</Text>
      </View>

      <View className="segmented">
        <Text
          className={`segment ${mode === 'custom' ? 'active' : ''}`}
          onClick={() => setMode('custom')}
        >
          自定义创建
        </Text>
        <Text className={`segment ${mode === 'ai' ? 'active' : ''}`} onClick={() => setMode('ai')}>
          AI 生成
        </Text>
      </View>

      <View className="plan-form-card">
        <View className="form-item">
          <Text className="form-label">{mode === 'custom' ? '计划主题' : '主题方向'}</Text>
          <Textarea
            className="form-textarea form-textarea-short"
            placeholder="例如：Java 并发编程系列"
            value={topic}
            maxlength={500}
            onInput={e => setTopic(e.detail.value)}
          />
        </View>

        {mode === 'custom' ? (
          <>
            <View className="form-item">
              <Text className="form-label">触发时间（HH:mm，多个用逗号分隔）</Text>
              <Input
                className="form-input"
                placeholder="09:00"
                value={triggerTimes}
                onInput={e => setTriggerTimes(e.detail.value)}
              />
            </View>
            <View className="form-item">
              <Text className="form-label">主题队列（每行一个，留空则由主题自动生成）</Text>
              <Textarea
                className="form-textarea form-textarea-queue"
                placeholder={'分布式锁的三种实现\n缓存与数据库一致性\n限流算法实战'}
                value={topicsQueue}
                onInput={e => setTopicsQueue(e.detail.value)}
              />
            </View>
          </>
        ) : (
          <View className="ai-row">
            <View className="form-item ai-col">
              <Text className="form-label">天数（1-30）</Text>
              <Input
                className="form-input"
                placeholder="7"
                type="number"
                value={days}
                onInput={e => setDays(e.detail.value)}
              />
            </View>
            <View className="form-item ai-col">
              <Text className="form-label">每天发布时间</Text>
              <Input
                className="form-input"
                placeholder="09:00"
                value={aiTime}
                onInput={e => setAiTime(e.detail.value)}
              />
            </View>
          </View>
        )}

        <View className="form-item">
          <Text className="form-label">目标读者（可选）</Text>
          <Input
            className="form-input"
            placeholder="例如：3-5 年经验的 Java 开发者"
            value={audience}
            maxlength={120}
            onInput={e => setAudience(e.detail.value)}
          />
        </View>
        <View className="form-item">
          <Text className="form-label">写作语气（可选）</Text>
          <Input
            className="form-input"
            placeholder="例如：专业、轻松"
            value={tone}
            maxlength={60}
            onInput={e => setTone(e.detail.value)}
          />
        </View>
        <View className="form-item">
          <Text className="form-label">同步设置</Text>
          <View className="switch-row">
            <Text className="switch-label">发布后同步到 CSDN</Text>
            <Switch
              checked={syncCsdn}
              onChange={e => setSyncCsdn(e.detail.value)}
              color="#5948f8"
            />
          </View>
          <View className="switch-row">
            <Text className="switch-label">发布后同步到掘金</Text>
            <Switch
              checked={syncJuejin}
              onChange={e => setSyncJuejin(e.detail.value)}
              color="#5948f8"
            />
          </View>
        </View>
        <View className="form-item">
          <Text className="form-label">时区</Text>
          <Input
            className="form-input"
            value={timezone}
            onInput={e => setTimezone(e.detail.value)}
          />
        </View>
      </View>

      <Button
        className="btn btn-primary publish-submit"
        loading={loading}
        disabled={loading}
        onClick={mode === 'custom' ? handleCustomCreate : handleAiGenerate}
      >
        {mode === 'custom' ? '创建计划' : 'AI 生成计划'}
      </Button>
      {mode === 'ai' ? (
        <Text className="form-tip ai-tip">AI 将从明天起按主题自动生成每日计划（一次性计划）</Text>
      ) : null}
    </View>
  )
}

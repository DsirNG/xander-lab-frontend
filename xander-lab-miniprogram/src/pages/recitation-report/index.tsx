import { Text, View } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import { useEffect, useRef, useState } from 'react'
import { recitationApi, type RecitationAttempt, type RecitationDifference } from '@/api/recitation'
import { NavBar } from '@/components/NavBar'
import { Button } from '@/components/ui/Button'
import { PageState } from '@/components/ui/PageState'
import { t } from '@/i18n'
import './index.scss'

const TERMINAL_STATUSES = new Set(['SUCCEEDED', 'FAILED'])

function differenceText(difference: RecitationDifference) {
  if (difference.type === 'MISSING')
    return t('recitation.missingDetail', { expected: difference.expected })
  if (difference.type === 'EXTRA') return t('recitation.extraDetail', { actual: difference.actual })
  return t('recitation.wrongDetail', { expected: difference.expected, actual: difference.actual })
}

export default function RecitationReportPage() {
  const [attemptId, setAttemptId] = useState(0)
  const [attempt, setAttempt] = useState<RecitationAttempt | null>(null)
  const [loading, setLoading] = useState(true)
  const audioRef = useRef<ReturnType<typeof Taro.createInnerAudioContext> | null>(null)

  useLoad(options => setAttemptId(Number(options.id)))

  useEffect(() => {
    if (!attemptId) return
    let active = true
    let timer: ReturnType<typeof setTimeout> | undefined
    const load = async () => {
      try {
        const current = await recitationApi.getAttempt(attemptId)
        if (!active) return
        setAttempt(current)
        setLoading(false)
        if (!TERMINAL_STATUSES.has(current.status)) timer = setTimeout(load, 2000)
      } catch (error) {
        if (!active) return
        setLoading(false)
        Taro.showToast({
          title: error instanceof Error ? error.message : t('recitation.reportFailed'),
          icon: 'none',
        })
      }
    }
    void load()
    return () => {
      active = false
      if (timer) clearTimeout(timer)
    }
  }, [attemptId])

  useEffect(
    () => () => {
      audioRef.current?.destroy()
      audioRef.current = null
    },
    [],
  )

  const playAudio = () => {
    if (!attempt?.audioUrl) return
    audioRef.current?.destroy()
    const audio = Taro.createInnerAudioContext()
    audio.src = attempt.audioUrl
    audio.play()
    audioRef.current = audio
  }

  if (loading) {
    return (
      <View className="page">
        <NavBar title={t('recitation.report')} showBack />
        <PageState
          kind="loading"
          title={t('recitation.processing')}
          description={t('recitation.processingHint')}
        />
      </View>
    )
  }
  if (!attempt) {
    return (
      <View className="page">
        <NavBar title={t('recitation.report')} showBack />
        <PageState kind="error" title={t('recitation.reportFailed')} />
      </View>
    )
  }
  if (attempt.status === 'FAILED') {
    return (
      <View className="page">
        <NavBar title={t('recitation.report')} showBack />
        <PageState
          kind="error"
          title={t('recitation.recognitionFailed')}
          description={attempt.errorMessage || t('recitation.tryAgain')}
        />
      </View>
    )
  }
  if (attempt.status !== 'SUCCEEDED' || !attempt.result) {
    return (
      <View className="page">
        <NavBar title={t('recitation.report')} showBack />
        <PageState
          kind="loading"
          title={t('recitation.processing')}
          description={t('recitation.processingHint')}
        />
      </View>
    )
  }

  const result = attempt.result
  return (
    <View className="page recitation-report-page">
      <NavBar title={t('recitation.report')} showBack />
      <View className="recitation-report-content">
        <View className="recitation-score-card">
          <Text className="recitation-score-label">{t('recitation.accuracy')}</Text>
          <Text className="recitation-score-value">
            {Number(attempt.score ?? result.score).toFixed(1)}
          </Text>
          <Text className="recitation-score-unit">/ 100</Text>
        </View>

        <View className="recitation-stats-row">
          <View className="recitation-stat">
            <Text>{result.correctCount}</Text>
            <Text>{t('recitation.correct')}</Text>
          </View>
          <View className="recitation-stat">
            <Text>{result.missingCount}</Text>
            <Text>{t('recitation.missing')}</Text>
          </View>
          <View className="recitation-stat">
            <Text>{result.wrongCount}</Text>
            <Text>{t('recitation.wrong')}</Text>
          </View>
          <View className="recitation-stat">
            <Text>{result.extraCount}</Text>
            <Text>{t('recitation.extra')}</Text>
          </View>
        </View>

        {attempt.audioUrl ? (
          <Button block variant="secondary" onClick={playAudio}>
            {t('recitation.playAudio')}
          </Button>
        ) : null}

        <View className="recitation-report-section">
          <Text className="recitation-report-title">{t('recitation.transcript')}</Text>
          <Text className="recitation-report-text">{attempt.transcript}</Text>
        </View>

        <View className="recitation-report-section">
          <Text className="recitation-report-title">{t('recitation.differences')}</Text>
          {result.differences.length === 0 ? (
            <Text className="recitation-perfect">{t('recitation.perfect')}</Text>
          ) : (
            result.differences.slice(0, 100).map((difference, index) => (
              <View
                key={`${difference.expectedIndex}-${index}`}
                className={`recitation-difference recitation-difference--${difference.type.toLowerCase()}`}
              >
                <Text>{differenceText(difference)}</Text>
                <Text>#{difference.expectedIndex + 1}</Text>
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  )
}

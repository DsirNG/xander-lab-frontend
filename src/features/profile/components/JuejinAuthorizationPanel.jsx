import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, Link2, LoaderCircle, QrCode, ShieldOff, TriangleAlert, Unplug, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Modal from '@components/common/Modal'
import { useToast } from '@hooks/useToast'
import { juejinService } from '../services/mcpService'

/** User-facing Juejin QR authorization flow backed by one short-lived Selenium session. */
const QR_EXPIRY_BUFFER_SECONDS = 5
const DEFAULT_EXPIRES_IN_SECONDS = 60

const JuejinAuthorizationPanel = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const timerRef = useRef(null)
  const countdownRef = useRef(null)
  const cancelPendingRef = useRef(false)
  const qrCodeRef = useRef(null)
  const [state, setState] = useState('loading')
  const [qrCode, setQrCode] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(null)
  const [queuePosition, setQueuePosition] = useState(null)
  const [estimatedWait, setEstimatedWait] = useState(null)
  const [busy, setBusy] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const clearTimers = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    if (countdownRef.current) window.clearInterval(countdownRef.current)
    timerRef.current = null
    countdownRef.current = null
  }, [])

  const loadStatus = useCallback(async () => {
    setState('loading')
    try {
      const result = await juejinService.getAuthorizationStatus()
      if (result?.status === 'QUEUED') {
        // A queue entry from a previous session is stale once the modal is closed; leave it.
        juejinService.cancelAuthorization().catch(() => {})
        setState('NOT_AUTHORIZED')
        return
      }
      setState(result?.status || 'NOT_AUTHORIZED')
    } catch {
      setState('UNAVAILABLE')
    }
  }, [])

  const expireQr = useCallback(() => {
    clearTimers()
    juejinService.cancelAuthorization().catch(() => {})
    setQrCode(null)
    qrCodeRef.current = null
    setSecondsLeft(null)
    setQueuePosition(null)
    setEstimatedWait(null)
    setBusy(false)
    setState('NOT_AUTHORIZED')
    setIsModalOpen(false)
    toast.warning(t('profile.juejin.expired'))
  }, [clearTimers, t, toast])

  useEffect(() => {
    if (secondsLeft === 0) expireQr()
  }, [secondsLeft, expireQr])

  useEffect(() => {
    loadStatus()
    return () => {
      clearTimers()
      // Release the short-lived Selenium session if this panel unmounts mid-flow.
      cancelPendingRef.current = true
      juejinService.cancelAuthorization().catch(() => {})
    }
  }, [loadStatus, clearTimers])

  const handleCloseModal = () => {
    cancelPendingRef.current = true
    clearTimers()
    juejinService.cancelAuthorization().catch(() => {})
    setQrCode(null)
    qrCodeRef.current = null
    setSecondsLeft(null)
    setQueuePosition(null)
    setEstimatedWait(null)
    setBusy(false)
    if (state === 'PENDING' || state === 'QUEUED') {
      setState('NOT_AUTHORIZED')
    }
    setIsModalOpen(false)
  }

  const pollStatus = useCallback(async () => {
    try {
      const status = await juejinService.getAuthorizationStatus()
      if (status?.status === 'AUTHORIZED') {
        clearTimers()
        setQrCode(null)
        qrCodeRef.current = null
        setSecondsLeft(null)
        setQueuePosition(null)
        setEstimatedWait(null)
        setState('AUTHORIZED')
        setBusy(false)
        setIsModalOpen(false)
        toast.success(t('profile.juejin.authorized'))
        return
      }
      if (status?.status === 'QUEUED') {
        setQueuePosition(status.queuePosition ?? null)
        setEstimatedWait(status.estimatedWaitSeconds ?? null)
        setState('QUEUED')
        return
      }
      if (status?.status === 'PENDING') {
        // Backend reloads the Juejin login page when the QR expires and returns a fresh one.
        if (status.qrCodeDataUrl && status.qrCodeDataUrl !== qrCodeRef.current) {
          qrCodeRef.current = status.qrCodeDataUrl
          setQrCode(status.qrCodeDataUrl)
        }
        setState('PENDING')
        // Start the scan countdown only once a QR is actually shown (i.e. after a queue takeover).
        if (countdownRef.current == null) {
          const expiresIn = Number(status.expiresInSeconds) > 0 ? Number(status.expiresInSeconds) : DEFAULT_EXPIRES_IN_SECONDS
          setSecondsLeft(Math.max(1, expiresIn - QR_EXPIRY_BUFFER_SECONDS))
          countdownRef.current = window.setInterval(() => {
            setSecondsLeft((prev) => (prev == null ? prev : Math.max(0, prev - 1)))
          }, 1000)
        }
      }
    } catch {
      // Keep the current QR/queue state visible while the short-lived authorization session is active.
    }
  }, [clearTimers, t, toast])

  const start = async () => {
    cancelPendingRef.current = false
    setIsModalOpen(true)
    setBusy(true)
    setQrCode(null)
    setSecondsLeft(null)
    setQueuePosition(null)
    setEstimatedWait(null)
    try {
      const result = await juejinService.startAuthorization()
      if (cancelPendingRef.current) {
        // The modal was closed while the session was starting; release it now.
        juejinService.cancelAuthorization().catch(() => {})
        setState('NOT_AUTHORIZED')
        setBusy(false)
        setIsModalOpen(false)
        return
      }
      if (result?.status === 'QUEUED') {
        // The single slot is busy with another user; poll until the slot frees and we take over.
        setQueuePosition(result.queuePosition ?? null)
        setEstimatedWait(result.estimatedWaitSeconds ?? null)
        setState('QUEUED')
        setBusy(false)
        timerRef.current = window.setInterval(pollStatus, 2500)
        return
      }
      setQrCode(result?.qrCodeDataUrl || null)
      qrCodeRef.current = result?.qrCodeDataUrl || null
      setState('PENDING')
      // Backend keeps the slot alive a little longer than we show the QR, so our cancel always wins.
      const expiresIn = Number(result?.expiresInSeconds) > 0 ? Number(result.expiresInSeconds) : DEFAULT_EXPIRES_IN_SECONDS
      setSecondsLeft(Math.max(1, expiresIn - QR_EXPIRY_BUFFER_SECONDS))
      countdownRef.current = window.setInterval(() => {
        setSecondsLeft((prev) => (prev == null ? prev : Math.max(0, prev - 1)))
      }, 1000)
      timerRef.current = window.setInterval(pollStatus, 2500)
    } catch (error) {
      setBusy(false)
      setIsModalOpen(false)
      toast.error(error?.message || t('profile.juejin.startFailed'))
    }
  }

  const disconnect = async () => {
    setBusy(true)
    try {
      await juejinService.disconnect()
      setState('NOT_AUTHORIZED')
      toast.success(t('profile.juejin.disconnected'))
    } catch (error) {
      toast.error(error?.message || t('profile.juejin.disconnectFailed'))
    } finally {
      setBusy(false)
    }
  }

  const handleSyncCatalog = async () => {
    setBusy(true)
    try {
      await juejinService.syncCatalog()
      toast.success(t('profile.juejin.catalogSynced'))
    } catch (error) {
      toast.error(error?.message || t('profile.juejin.catalogSyncFailed'))
    } finally {
      setBusy(false)
    }
  }

  const loading = state === 'loading'
  const authorized = state === 'AUTHORIZED'
  const expired = state === 'EXPIRED'

  const titleNode = (
    <div className="flex items-center gap-2">
      <QrCode className="h-5 w-5 text-accent" />
      <div className="text-title font-black text-ink">{t('profile.juejin.title')}</div>
    </div>
  )

  return (
    <div className="mt-4 rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
          <Link2 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-ink">{t('profile.juejin.title')}</div>
          <div className="mt-1 text-caption text-ink-muted">{t('profile.juejin.description')}</div>
        </div>
        {loading ? (
          <LoaderCircle className="h-5 w-5 animate-spin text-accent" />
        ) : authorized ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : expired ? (
          <TriangleAlert className="h-5 w-5 text-warning" />
        ) : (
          <ShieldOff className="h-5 w-5 text-ink-faint" />
        )}
      </div>

      {loading && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-canvas px-3.5 py-2.5 text-caption font-semibold text-ink-muted">
          <LoaderCircle className="h-4 w-4 animate-spin text-accent" />
          <span>{t('profile.juejin.checking')}</span>
        </div>
      )}

      {!loading && expired && (
        <div className="mt-4 text-caption font-semibold text-warning">{t('profile.juejin.sessionExpired')}</div>
      )}

      {!loading && !authorized && state !== 'UNAVAILABLE' && (
        <button
          type="button"
          onClick={start}
          disabled={busy}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white hover:bg-accent/90 disabled:opacity-50"
        >
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
          {expired ? t('profile.juejin.reauthorize') : t('profile.juejin.connect')}
        </button>
      )}

      {!loading && (authorized || expired) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {authorized && (
            <button
              type="button"
              onClick={handleSyncCatalog}
              disabled={busy}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-bold text-ink-muted hover:bg-canvas disabled:opacity-50"
            >
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {t('profile.juejin.syncCatalog')}
            </button>
          )}
          <button
            type="button"
            onClick={disconnect}
            disabled={busy}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-bold text-ink-muted hover:bg-canvas disabled:opacity-50"
          >
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Unplug className="h-4 w-4" />}
            {t('profile.juejin.disconnect')}
          </button>
        </div>
      )}

      {!loading && state === 'UNAVAILABLE' && (
        <div className="mt-4 text-caption text-warning">{t('profile.juejin.unavailable')}</div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={titleNode} width="max-w-md" closeOnOutsideClick={false}>
        {state === 'QUEUED' ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 py-6 text-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-accent" />
            <div className="text-sm font-bold text-ink-secondary">{t('profile.juejin.queued')}</div>
            {queuePosition != null && (
              <div className="text-caption font-medium text-ink-muted">
                {t('profile.juejin.queuePosition', { position: queuePosition })}
              </div>
            )}
            {estimatedWait != null && (
              <div className="text-caption font-medium text-ink-muted">
                {t('profile.juejin.estimatedWait', { wait: Math.max(0, estimatedWait) })}
              </div>
            )}
          </div>
        ) : !qrCode ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 py-6 text-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-accent" />
            <div className="text-sm font-bold text-ink-secondary">
              {t('profile.juejin.generatingQr')}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="rounded-2xl border border-border bg-white p-3 shadow-sm">
              <img
                src={qrCode}
                alt={t('profile.juejin.qrAlt')}
                className="h-52 w-52 object-contain sm:h-60 sm:w-60"
              />
            </div>
            <div className="text-caption font-medium text-ink-muted">
              {t('profile.juejin.scanHint')}
            </div>
            <div className="flex items-center gap-2 text-caption font-bold text-accent">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              <span>{secondsLeft != null ? `${t('profile.juejin.waiting')} ${secondsLeft}s` : t('profile.juejin.waiting')}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default JuejinAuthorizationPanel
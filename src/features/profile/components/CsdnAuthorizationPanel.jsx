import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, Link2, LoaderCircle, QrCode, ShieldOff, Unplug } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Modal from '@components/common/Modal'
import { useToast } from '@hooks/useToast'
import { csdnService } from '../services/mcpService'

/** User-facing CSDN QR authorization flow backed by one short-lived Selenium session. */
const CsdnAuthorizationPanel = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const timerRef = useRef(null)
  const [state, setState] = useState('loading')
  const [qrCode, setQrCode] = useState(null)
  const [busy, setBusy] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadStatus = useCallback(async () => {
    setState('loading')
    try {
      const result = await csdnService.getAuthorizationStatus()
      setState(result?.status || 'NOT_AUTHORIZED')
    } catch {
      setState('UNAVAILABLE')
    }
  }, [])

  useEffect(() => {
    loadStatus()
    return () => timerRef.current && window.clearInterval(timerRef.current)
  }, [loadStatus])

  const handleCloseModal = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    setQrCode(null)
    setBusy(false)
    if (state === 'PENDING') {
      setState('NOT_AUTHORIZED')
    }
    setIsModalOpen(false)
  }

  const start = async () => {
    setIsModalOpen(true)
    setBusy(true)
    setQrCode(null)
    try {
      const result = await csdnService.startAuthorization()
      setQrCode(result?.qrCodeDataUrl || null)
      setState('PENDING')
      timerRef.current = window.setInterval(async () => {
        try {
          const status = await csdnService.getAuthorizationStatus()
          if (status?.status === 'AUTHORIZED') {
            window.clearInterval(timerRef.current)
            timerRef.current = null
            setQrCode(null)
            setState('AUTHORIZED')
            setBusy(false)
            setIsModalOpen(false)
            toast.success(t('profile.csdn.authorized'))
          }
        } catch {
          // Keep the QR state visible while the short-lived authorization session is active.
        }
      }, 2500)
    } catch (error) {
      setBusy(false)
      setIsModalOpen(false)
      toast.error(error?.message || t('profile.csdn.startFailed'))
    }
  }

  const disconnect = async () => {
    setBusy(true)
    try {
      await csdnService.disconnect()
      setState('NOT_AUTHORIZED')
      toast.success(t('profile.csdn.disconnected'))
    } catch (error) {
      toast.error(error?.message || t('profile.csdn.disconnectFailed'))
    } finally {
      setBusy(false)
    }
  }

  const loading = state === 'loading'
  const authorized = state === 'AUTHORIZED'

  const titleNode = (
    <div className="flex items-center gap-2">
      <QrCode className="h-5 w-5 text-accent" />
      <h3 className="text-title font-black text-ink">{t('profile.csdn.title')}</h3>
    </div>
  )

  return (
    <div className="mt-4 rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent">
          <Link2 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-ink">{t('profile.csdn.title')}</h3>
          <p className="mt-1 text-caption text-ink-muted">{t('profile.csdn.description')}</p>
        </div>
        {loading ? (
          <LoaderCircle className="h-5 w-5 animate-spin text-accent" />
        ) : authorized ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : (
          <ShieldOff className="h-5 w-5 text-ink-faint" />
        )}
      </div>

      {loading && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-canvas px-3.5 py-2.5 text-caption font-semibold text-ink-muted">
          <LoaderCircle className="h-4 w-4 animate-spin text-accent" />
          <span>{t('profile.csdn.checking')}</span>
        </div>
      )}

      {!loading && !authorized && state !== 'UNAVAILABLE' && (
        <button
          type="button"
          onClick={start}
          disabled={busy}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white hover:bg-accent/90 disabled:opacity-50"
        >
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
          {t('profile.csdn.connect')}
        </button>
      )}

      {!loading && authorized && (
        <button
          type="button"
          onClick={disconnect}
          disabled={busy}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-bold text-ink-muted hover:bg-canvas disabled:opacity-50"
        >
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Unplug className="h-4 w-4" />}
          {t('profile.csdn.disconnect')}
        </button>
      )}

      {!loading && state === 'UNAVAILABLE' && (
        <p className="mt-4 text-caption text-warning">{t('profile.csdn.unavailable')}</p>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={titleNode} width="max-w-md">
        {!qrCode ? (
          <div className="flex min-h-56 flex-col items-center justify-center gap-3 py-6 text-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-accent" />
            <p className="text-sm font-bold text-ink-secondary">
              {t('profile.csdn.generatingQr')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2 text-center">
            <div className="rounded-2xl border border-border bg-white p-3 shadow-sm">
              <img
                src={qrCode}
                alt={t('profile.csdn.qrAlt')}
                className="h-60 w-60 object-contain"
              />
            </div>
            <p className="text-caption font-medium text-ink-muted">
              {t('profile.csdn.scanHint')}
            </p>
            <div className="flex items-center gap-2 text-caption font-bold text-accent">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              <span>{t('profile.csdn.waiting')}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default CsdnAuthorizationPanel

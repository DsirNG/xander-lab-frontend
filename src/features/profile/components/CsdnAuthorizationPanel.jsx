import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, Link2, LoaderCircle, QrCode, ShieldOff, Unplug } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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

  const loadStatus = useCallback(async () => {
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

  const start = async () => {
    setBusy(true)
    try {
      const result = await csdnService.startAuthorization()
      setQrCode(result?.qrCodeDataUrl || null)
      setState('PENDING')
      timerRef.current = window.setInterval(async () => {
        try {
          const status = await csdnService.getAuthorizationStatus()
          if (status?.status === 'AUTHORIZED') {
            window.clearInterval(timerRef.current)
            setQrCode(null)
            setState('AUTHORIZED')
            setBusy(false)
            toast.success(t('profile.csdn.authorized', 'CSDN connected'))
          }
        } catch {
          // Keep the QR state visible while the short-lived authorization session is active.
        }
      }, 2500)
    } catch (error) {
      setBusy(false)
      toast.error(error?.message || t('profile.csdn.startFailed', 'Unable to start CSDN authorization'))
    }
  }

  const disconnect = async () => {
    setBusy(true)
    try {
      await csdnService.disconnect()
      setState('NOT_AUTHORIZED')
      toast.success(t('profile.csdn.disconnected', 'CSDN disconnected'))
    } catch (error) {
      toast.error(error?.message || t('profile.csdn.disconnectFailed', 'Unable to disconnect CSDN'))
    } finally {
      setBusy(false)
    }
  }

  const pending = state === 'PENDING'
  const authorized = state === 'AUTHORIZED'

  return (
    <div className="mt-4 rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-600">
          <Link2 className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-ink">{t('profile.csdn.title', 'CSDN publishing')}</h3>
          <p className="mt-1 text-caption text-ink-muted">{t('profile.csdn.description', 'Connect CSDN once to enable scheduled publishing for your account.')}</p>
        </div>
        {authorized ? <CheckCircle2 className="h-5 w-5 text-success" /> : <ShieldOff className="h-5 w-5 text-ink-faint" />}
      </div>

      {pending && qrCode && (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-lg border border-border bg-canvas p-4">
          <img src={qrCode} alt={t('profile.csdn.qrAlt', 'CSDN login QR code')} className="h-52 w-52 rounded-md bg-white object-contain" />
          <p className="text-caption text-ink-muted">{t('profile.csdn.scanHint', 'Scan with the CSDN app or WeChat. This QR code expires shortly.')}</p>
          <LoaderCircle className="h-4 w-4 animate-spin text-accent" aria-label={t('profile.csdn.waiting', 'Waiting for authorization')} />
        </div>
      )}

      {!authorized && !pending && state !== 'UNAVAILABLE' && (
        <button type="button" onClick={start} disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white hover:bg-accent/90 disabled:opacity-50">
          <QrCode className="h-4 w-4" />
          {t('profile.csdn.connect', 'Connect CSDN')}
        </button>
      )}
      {authorized && (
        <button type="button" onClick={disconnect} disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-bold text-ink-muted hover:bg-canvas disabled:opacity-50">
          <Unplug className="h-4 w-4" />
          {t('profile.csdn.disconnect', 'Disconnect')}
        </button>
      )}
      {state === 'UNAVAILABLE' && <p className="mt-4 text-caption text-warning">{t('profile.csdn.unavailable', 'CSDN authorization service is unavailable.')}</p>}
    </div>
  )
}

export default CsdnAuthorizationPanel

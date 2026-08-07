import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, LoaderCircle, QrCode, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { blogService } from '@features/blog/services/blogService'
import { csdnService } from '../services/mcpService'

/** Authorizes CSDN when needed, then resumes synchronization of the selected post. */
const CsdnSyncDialog = ({ post, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const timerRef = useRef(null)
  const syncingRef = useRef(false)
  const [phase, setPhase] = useState('checking')
  const [qrCode, setQrCode] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const syncPost = useCallback(async () => {
    if (syncingRef.current) return
    syncingRef.current = true
    setPhase('syncing')
    try {
      const response = await blogService.syncToCsdn(post.id)
      setResult(response)
      setPhase('done')
      onSuccess?.(response)
    } catch (err) {
      setError(err?.message || t('profile.blogManage.csdn.syncFailed', 'Unable to sync this post to CSDN'))
      setPhase('error')
    }
  }, [onSuccess, post.id, t])

  useEffect(() => {
    let active = true
    const begin = async () => {
      try {
        const status = await csdnService.getAuthorizationStatus()
        if (!active) return
        if (status?.status === 'AUTHORIZED') {
          await syncPost()
          return
        }
        const authorization = await csdnService.startAuthorization()
        if (!active) return
        setQrCode(authorization?.qrCodeDataUrl || null)
        setPhase('authorize')
        timerRef.current = window.setInterval(async () => {
          try {
            const current = await csdnService.getAuthorizationStatus()
            if (current?.status === 'AUTHORIZED') {
              window.clearInterval(timerRef.current)
              await syncPost()
            }
          } catch {
            // The next poll may recover while the authorization session is still active.
          }
        }, 2500)
      } catch (err) {
        if (!active) return
        setError(err?.message || t('profile.blogManage.csdn.authorizationFailed', 'Unable to start CSDN authorization'))
        setPhase('error')
      }
    }
    begin()
    return () => {
      active = false
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [syncPost, t])

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-label={t('profile.blogManage.csdn.dialogTitle', 'Sync to CSDN')}>
      <div className="w-full max-w-md rounded-xl border border-border bg-canvas p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-ink">{t('profile.blogManage.csdn.dialogTitle', 'Sync to CSDN')}</h3>
            <p className="mt-1 truncate text-caption text-ink-muted">{post.title}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-faint hover:bg-surface" aria-label={t('common.close', 'Close')}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {(phase === 'checking' || phase === 'syncing') && (
          <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
            <LoaderCircle className="h-7 w-7 animate-spin text-accent" />
            <p className="text-sm font-bold text-ink-secondary">{phase === 'syncing' ? t('profile.blogManage.csdn.syncing', 'Publishing to CSDN...') : t('profile.blogManage.csdn.checking', 'Checking CSDN authorization...')}</p>
          </div>
        )}

        {phase === 'authorize' && (
          <div className="mt-5 flex flex-col items-center gap-3 text-center">
            {qrCode ? <img src={qrCode} alt={t('profile.blogManage.csdn.qrAlt', 'CSDN login QR code')} className="h-64 w-full rounded-lg bg-white object-contain" /> : <QrCode className="h-16 w-16 text-ink-faint" />}
            <p className="text-caption text-ink-muted">{t('profile.blogManage.csdn.scanHint', 'Scan to authorize. The post will sync automatically after login.')}</p>
          </div>
        )}

        {phase === 'done' && (
          <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
            <CheckCircle2 className="h-10 w-10 text-success" />
            <p className="text-sm font-bold text-ink">{t('profile.blogManage.csdn.synced', 'Synced to CSDN')}</p>
            {result?.url && <a href={result.url} target="_blank" rel="noreferrer" className="text-caption font-bold text-accent hover:underline">{t('profile.blogManage.csdn.viewPost', 'View CSDN post')}</a>}
          </div>
        )}

        {phase === 'error' && <div className="mt-5 rounded-lg bg-danger-soft p-4 text-sm text-danger">{error}</div>}
      </div>
    </div>
  )
}

export default CsdnSyncDialog

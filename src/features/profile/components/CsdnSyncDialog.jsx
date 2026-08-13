import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, LoaderCircle, QrCode } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Modal from '@components/common/Modal'
import { blogService } from '@features/blog/services/blogService'
import { csdnService } from '../services/mcpService'

/** Authorizes CSDN when needed, then resumes synchronization of the selected post. */
const CsdnSyncDialog = ({ post, isOpen = true, onClose, onSuccess }) => {
  const { t } = useTranslation()
  const timerRef = useRef(null)
  const syncingRef = useRef(false)
  const [phase, setPhase] = useState('checking')
  const [qrCode, setQrCode] = useState(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const postId = post?.id

  const syncPost = useCallback(async () => {
    if (syncingRef.current) return
    syncingRef.current = true
    setPhase('syncing')
    try {
      const response = await blogService.syncToCsdn(postId)
      setResult(response)
      setPhase('done')
      onSuccess?.(response)
    } catch (err) {
      setError(err?.message || t('profile.blogManage.csdn.syncFailed'))
      setPhase('error')
    }
  }, [onSuccess, postId, t])

  useEffect(() => {
    if (!postId || !isOpen) return
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
        setError(err?.message || t('profile.blogManage.csdn.authorizationFailed'))
        setPhase('error')
      }
    }
    begin()
    return () => {
      active = false
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [isOpen, postId, syncPost, t])

  if (!post) return null

  const titleNode = (
    <div>
      <div className="text-title font-black text-ink">{t('profile.blogManage.csdn.dialogTitle')}</div>
      <div className="mt-1 truncate text-caption font-medium text-ink-muted">{post.title}</div>
    </div>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={titleNode} width="max-w-md">
      {(phase === 'checking' || phase === 'syncing') && (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center py-4">
          <LoaderCircle className="h-7 w-7 animate-spin text-accent" />
          <div className="text-sm font-bold text-ink-secondary">
            {phase === 'syncing' ? t('profile.blogManage.csdn.syncing') : t('profile.blogManage.csdn.checking')}
          </div>
        </div>
      )}

      {phase === 'authorize' && (
        <div className="flex flex-col items-center gap-3 text-center py-2">
          {qrCode ? (
            <img src={qrCode} alt={t('profile.blogManage.csdn.qrAlt')} className="h-60 w-60 rounded-xl border border-border bg-white object-contain p-2" />
          ) : (
            <QrCode className="h-16 w-16 text-ink-faint" />
          )}
          <div className="text-caption font-medium text-ink-muted">
            {t('profile.blogManage.csdn.scanHint')}
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center py-4">
          <CheckCircle2 className="h-10 w-10 text-success" />
          <div className="text-sm font-bold text-ink">{t('profile.blogManage.csdn.synced')}</div>
          {result?.url && (
            <a href={result.url} target="_blank" rel="noreferrer" className="text-caption font-bold text-accent hover:underline">
              {t('profile.blogManage.csdn.viewPost')}
            </a>
          )}
        </div>
      )}

      {phase === 'error' && (
        <div className="rounded-xl bg-danger-soft p-4 text-sm font-medium text-danger-fg ring-1 ring-danger/20">
          {error}
        </div>
      )}
    </Modal>
  )
}

export default CsdnSyncDialog

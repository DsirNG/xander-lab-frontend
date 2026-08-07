import { useCallback, useEffect, useState } from 'react'
import { ExternalLink, Plug, RefreshCw, ShieldCheck, ShieldOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { mcpService } from '../services/mcpService'
import CsdnAuthorizationPanel from './CsdnAuthorizationPanel'

/** Profile control for the browser-only MCP authorization handoff. */
const McpAuthorizationPanel = () => {
  const { t } = useTranslation()
  const [status, setStatus] = useState('loading')

  const loadStatus = useCallback(async () => {
    setStatus('loading')
    try {
      const result = await mcpService.getStatus()
      setStatus(result?.authorized ? 'authorized' : 'unauthorized')
    } catch {
      setStatus('unavailable')
    }
  }, [])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  const openAuthorization = () => {
    window.open(mcpService.getAuthorizationUrl(), '_blank', 'noopener,noreferrer')
  }

  const isAuthorized = status === 'authorized'
  const isLoading = status === 'loading'

  return (
    <section className="flex flex-1 flex-col overflow-y-auto p-5 sm:p-8">
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-micro font-bold uppercase tracking-[0.2em] text-accent">MCP</p>
            <h2 className="text-title font-black text-ink">{t('profile.mcp.title')}</h2>
            <p className="mt-2 max-w-xl text-body text-ink-muted">
              {t('profile.mcp.description')}
            </p>
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
            <Plug className="h-5 w-5" />
          </span>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3">
            {isAuthorized ? <ShieldCheck className="h-5 w-5 text-success" /> : <ShieldOff className="h-5 w-5 text-warning" />}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">
                {isLoading
                  ? t('profile.mcp.checking')
                  : isAuthorized
                    ? t('profile.mcp.authorized')
                    : status === 'unavailable'
                      ? t('profile.mcp.unavailable')
                      : t('profile.mcp.notAuthorized')}
              </p>
              <p className="mt-1 text-caption text-ink-muted">
                {isAuthorized
                  ? t('profile.mcp.authorizedHint')
                  : t('profile.mcp.notAuthorizedHint')}
              </p>
            </div>
            <button type="button" onClick={loadStatus} disabled={isLoading} className="rounded-lg p-2 text-ink-muted hover:bg-canvas disabled:opacity-50" aria-label={t('common.refresh', 'Refresh')}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {!isAuthorized && (
            <button type="button" onClick={openAuthorization} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-bold text-white hover:bg-accent/90">
              <ExternalLink className="h-4 w-4" />
              {t('profile.mcp.authorize')}
            </button>
          )}
        </div>

        <CsdnAuthorizationPanel />
      </div>
    </section>
  )
}

export default McpAuthorizationPanel

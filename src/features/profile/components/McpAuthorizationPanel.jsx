import { Check, Copy, Plug } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@hooks/useToast'
import CsdnAuthorizationPanel from './CsdnAuthorizationPanel'

/** Profile surface for user-owned CSDN authorization used by external MCP clients. */
const McpAuthorizationPanel = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const [copiedEndpoint, setCopiedEndpoint] = useState(null)
  const baseUrl = window.location.origin
  const endpoints = [
    { id: 'blog', name: t('profile.mcp.blogEndpoint'), url: `${baseUrl}/api/mcp` },
    { id: 'csdn', name: t('profile.mcp.csdnEndpoint'), url: `${baseUrl}/api/mcp/csdn` },
  ]

  const copyEndpoint = async ({ id, url }) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedEndpoint(id)
      toast.success(t('profile.mcp.endpointCopied'))
      window.setTimeout(() => setCopiedEndpoint((current) => (current === id ? null : current)), 1800)
    } catch {
      toast.error(t('profile.mcp.copyFailed'))
    }
  }

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

        <div className="border-y border-border py-4">
          <h3 className="text-body font-bold text-ink">{t('profile.mcp.endpointsTitle')}</h3>
          <div className="mt-3 space-y-2">
            {endpoints.map((endpoint) => {
              const copied = copiedEndpoint === endpoint.id

              return (
                <div key={endpoint.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
                  <span className="shrink-0 text-caption font-bold text-ink-secondary">{endpoint.name}</span>
                  <code className="min-w-0 flex-1 truncate font-mono text-caption text-ink-muted" title={endpoint.url}>
                    {endpoint.url}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyEndpoint(endpoint)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-muted hover:bg-canvas hover:text-accent"
                    aria-label={t('profile.mcp.copyEndpoint')}
                    title={t('profile.mcp.copyEndpoint')}
                  >
                    {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <CsdnAuthorizationPanel />
      </div>
    </section>
  )
}

export default McpAuthorizationPanel

import { Check, Copy, Plug, ShieldCheck, Unplug, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@hooks/useToast'
import { mcpOAuthService } from '../services/mcpService'
import CsdnAuthorizationPanel from './CsdnAuthorizationPanel'
import JuejinAuthorizationPanel from './JuejinAuthorizationPanel'

/** Profile surface for user-owned CSDN authorization used by external MCP clients. */
const McpAuthorizationPanel = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const [copiedEndpoint, setCopiedEndpoint] = useState(null)
  const [oauthRequest, setOauthRequest] = useState(null)
  const [selectedScopes, setSelectedScopes] = useState([])
  const [oauthBusy, setOauthBusy] = useState(false)
  const [clients, setClients] = useState([])
  const [revokingClient, setRevokingClient] = useState(null)
  const baseUrl = window.location.origin
  const endpoints = [
    { id: 'blog', name: t('profile.mcp.blogEndpoint'), url: `${baseUrl}/api/mcp` },
    { id: 'csdn', name: t('profile.mcp.csdnEndpoint'), url: `${baseUrl}/api/mcp/csdn` },
    { id: 'juejin', name: t('profile.mcp.juejinEndpoint'), url: `${baseUrl}/api/mcp/juejin` },
    { id: 'dual', name: t('profile.mcp.dualEndpoint'), url: `${baseUrl}/api/mcp/dual` },
  ]

  useEffect(() => {
    const requestId = new URLSearchParams(window.location.search).get('mcpOAuthRequest')
    if (!requestId) return undefined
    let active = true
    mcpOAuthService.getAuthorizationRequest(requestId)
      .then((request) => {
        if (!active) return
        setOauthRequest({ ...request, requestId })
        setSelectedScopes(preselectScopes(request.scopes, request.previouslyGranted))
      })
      .catch((error) => active && toast.error(error?.message || t('profile.mcp.consentLoadFailed')))
    return () => { active = false }
  }, [t, toast])

  useEffect(() => {
    let active = true
    mcpOAuthService.listClients()
      .then((items) => active && setClients(Array.isArray(items) ? items : []))
      .catch(() => { /* The profile remains usable when no OAuth table is deployed yet. */ })
    return () => { active = false }
  }, [])

  // Preselect scopes granted previously; a fresh client defaults to everything it requested.
  const preselectScopes = (requested, previouslyGranted) => {
    const requestedScopes = Array.isArray(requested) ? [...requested] : []
    if (!requestedScopes.length) return []
    const prior = Array.isArray(previouslyGranted) ? previouslyGranted : []
    const inherited = prior.length ? requestedScopes.filter((scope) => prior.includes(scope)) : []
    return inherited.length ? inherited : requestedScopes
  }

  const toggleScope = (scope) => {
    setSelectedScopes((current) => current.includes(scope)
      ? current.filter((item) => item !== scope)
      : [...current, scope])
  }

  const completeOAuthRequest = async (approve) => {
    if (!oauthRequest || oauthBusy || (approve && !selectedScopes.length)) return
    setOauthBusy(true)
    try {
      const result = approve
        ? await mcpOAuthService.approveAuthorization(oauthRequest.requestId, selectedScopes)
        : await mcpOAuthService.denyAuthorization(oauthRequest.requestId)
      window.location.assign(result.redirectUrl)
    } catch (error) {
      toast.error(error?.message || t('profile.mcp.consentFailed'))
      setOauthBusy(false)
    }
  }

  const revokeClient = async (clientId) => {
    setRevokingClient(clientId)
    try {
      await mcpOAuthService.revokeClient(clientId)
      setClients((current) => current.filter((client) => client.clientId !== clientId))
      toast.success(t('profile.mcp.clientRevoked'))
    } catch (error) {
      toast.error(error?.message || t('profile.mcp.clientRevokeFailed'))
    } finally {
      setRevokingClient(null)
    }
  }

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
            <div className="mb-1 text-micro font-bold uppercase tracking-[0.2em] text-accent">MCP</div>
            <div className="text-title font-black text-ink">{t('profile.mcp.title')}</div>
            <div className="mt-2 max-w-xl text-body text-ink-muted">
              {t('profile.mcp.description')}
            </div>
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
            <Plug className="h-5 w-5" />
          </span>
        </div>

        {oauthRequest && (
          <div className="mb-4 rounded-xl border border-accent/30 bg-accent-soft/40 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <div className="text-body font-bold text-ink">{t('profile.mcp.consentTitle')}</div>
                <div className="mt-1 text-caption text-ink-muted">
                  {t('profile.mcp.consentDescription', { client: oauthRequest.clientName })}
                </div>
                <div className="mt-3 space-y-2">
                  {[...oauthRequest.scopes].map((scope) => (
                    <label
                      key={scope}
                      className="flex items-center gap-2 rounded-md bg-surface px-2 py-1.5 text-caption font-bold text-ink-secondary"
                    >
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(scope)}
                        onChange={() => toggleScope(scope)}
                        className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                      />
                      <span className="font-mono text-micro">{scope}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-2 text-micro text-ink-muted">{t('profile.mcp.consentScopeHint')}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => completeOAuthRequest(true)}
                    disabled={oauthBusy || !selectedScopes.length}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-3.5 py-2 text-caption font-bold text-white hover:bg-accent/90 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    {t('profile.mcp.consentApprove')}
                  </button>
                  <button
                    type="button"
                    onClick={() => completeOAuthRequest(false)}
                    disabled={oauthBusy}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-3.5 py-2 text-caption font-bold text-ink-muted hover:bg-surface disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    {t('profile.mcp.consentDeny')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="border-y border-border py-4">
          <div className="text-body font-bold text-ink">{t('profile.mcp.endpointsTitle')}</div>
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

        {clients.length > 0 && (
          <div className="border-b border-border py-4">
            <div className="text-body font-bold text-ink">{t('profile.mcp.clientsTitle')}</div>
            <div className="mt-3 space-y-2">
              {clients.map((client) => (
                <div key={client.clientId} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-caption font-bold text-ink">{client.clientName}</div>
                    <div className="mt-0.5 truncate font-mono text-micro text-ink-faint">{client.scopes?.join(' ')}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => revokeClient(client.clientId)}
                    disabled={revokingClient === client.clientId}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-muted hover:bg-danger-soft hover:text-danger disabled:opacity-50"
                    aria-label={t('profile.mcp.revokeClient')}
                    title={t('profile.mcp.revokeClient')}
                  >
                    {revokingClient === client.clientId ? <Unplug className="h-4 w-4 animate-pulse" /> : <X className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <CsdnAuthorizationPanel />
        <JuejinAuthorizationPanel />
      </div>
    </section>
  )
}

export default McpAuthorizationPanel

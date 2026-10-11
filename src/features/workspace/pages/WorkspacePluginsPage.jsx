import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Blocks,
    Check,
    CircleCheck,
    CircleX,
    Loader2,
    Pencil,
    PlugZap,
    Plus,
    RefreshCw,
    Search,
    Server,
    Trash2,
    Wifi,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { agentPluginService } from "@features/agent/services/agentPluginService";
import Modal from "@shared/ui/overlays/Modal";

const emptyForm = {
    serverKey: "",
    displayName: "",
    endpointUrl: "",
    headers: "",
    enabled: true,
};

const getPluginRows = (skills, servers) => [
    ...skills.map((skill) => ({
        id: `skill:${skill.id ?? skill.skillKey}`,
        name: skill.name || skill.skillKey,
        key: skill.skillKey,
        description: skill.description || "",
        type: "skill",
        icon: Blocks,
    })),
    ...servers.map((server) => ({
        id: `mcp:${server.id ?? server.serverKey}`,
        name: server.displayName || server.serverKey,
        key: server.serverKey,
        description: server.lastError || `${server.tools?.length || 0} tools`,
        type: "mcp",
        status: server.lastStatus,
        icon: Server,
    })),
];

const WorkspacePluginsPage = () => {
    const { t } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [skills, setSkills] = useState([]);
    const [servers, setServers] = useState([]);
    const [query, setQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [editingServer, setEditingServer] = useState(null);
    const [error, setError] = useState("");
    const [testingId, setTestingId] = useState(null);
    const loadRequestRef = useRef(0);

    const loadPlugins = useCallback(async () => {
        const requestId = ++loadRequestRef.current;
        setLoading(true);
        setError("");
        const [skillsResult, serversResult] = await Promise.allSettled([
            agentPluginService.listSkills(),
            agentPluginService.listMcpServers(),
        ]);
        if (requestId !== loadRequestRef.current) return;
        if (skillsResult.status === "fulfilled") {
            setSkills(
                Array.isArray(skillsResult.value) ? skillsResult.value : [],
            );
        }
        if (serversResult.status === "fulfilled") {
            setServers(
                Array.isArray(serversResult.value) ? serversResult.value : [],
            );
        }
        const failures = [
            skillsResult.status === "rejected"
                ? skillsResult.reason?.message ||
                  t("workspace.pluginsPage.skillsLoadFailed", "技能加载失败")
                : null,
            serversResult.status === "rejected"
                ? serversResult.reason?.message ||
                  t("workspace.pluginsPage.serversLoadFailed", "MCP 服务加载失败")
                : null,
        ].filter(Boolean);
        if (failures.length) setError(failures.join("；"));
        setLoading(false);
    }, [t]);

    useEffect(() => {
        loadPlugins();
        return () => {
            loadRequestRef.current += 1;
        };
    }, [loadPlugins]);

    const probeServer = useCallback(
        async (server) => {
            if (!server?.id || testingId) return;
            setTestingId(server.id);
            setError("");
            try {
                const updated = await agentPluginService.probeMcpServer(
                    server.id,
                );
                setServers((current) =>
                    current.map((item) =>
                        item.id === updated?.id ? updated : item,
                    ),
                );
                if (
                    updated?.lastError &&
                    /OAuth|认证请求头无法解密/.test(updated.lastError)
                ) {
                    try {
                        const authorization =
                            await agentPluginService.startMcpOAuth(server.id);
                        if (authorization?.authorizationUrl) {
                            window.location.assign(
                                authorization.authorizationUrl,
                            );
                        } else {
                            setError(
                                t(
                                    "workspace.pluginsPage.oauthUnavailable",
                                    "当前 API 未提供 MCP OAuth 授权接口，请使用静态请求头或部署 OAuth 接口。",
                                ),
                            );
                        }
                    } catch (oauthStartError) {
                        setError(
                            oauthStartError.status === 404
                                ? t(
                                      "workspace.pluginsPage.oauthUnavailable",
                                      "当前 API 未提供 MCP OAuth 授权接口，请使用静态请求头或部署 OAuth 接口。",
                                  )
                                : oauthStartError.message ||
                                      t(
                                          "workspace.pluginsPage.oauthFailed",
                                          "MCP OAuth 授权失败，请重试",
                                      ),
                        );
                    }
                }
            } catch (probeError) {
                setError(
                    probeError.message ||
                        t(
                            "workspace.pluginsPage.testFailed",
                            "MCP 连接测试失败，请重试",
                        ),
                );
            } finally {
                setTestingId(null);
            }
        },
        [t, testingId],
    );

    useEffect(() => {
        const state = searchParams.get("state");
        const code = searchParams.get("code");
        if (!state || !code) return undefined;
        let active = true;
        const clearOAuthParams = () => {
            setSearchParams(
                (current) => {
                    const next = new URLSearchParams(current);
                    next.delete("state");
                    next.delete("code");
                    return next;
                },
                { replace: true },
            );
        };
        agentPluginService
            .completeMcpOAuth({ state, code })
            .then(async (result) => {
                if (!active) return;
                const serverId = Number(result?.serverId);
                const latest = await agentPluginService.listMcpServers();
                if (!active) return;
                setServers(Array.isArray(latest) ? latest : []);
                const server = Array.isArray(latest)
                    ? latest.find((item) => item.id === serverId)
                    : null;
                clearOAuthParams();
                if (server?.enabled !== false) await probeServer(server);
            })
            .catch(
                (oauthError) => {
                    if (!active) return;
                    clearOAuthParams();
                    setError(
                        oauthError.status === 404
                            ? t(
                                  "workspace.pluginsPage.oauthUnavailable",
                                  "当前 API 未提供 MCP OAuth 授权接口，请使用静态请求头或部署 OAuth 接口。",
                              )
                            : oauthError.message ||
                            t(
                                "workspace.pluginsPage.oauthFailed",
                                "MCP OAuth 授权失败，请重试",
                            ),
                    );
                },
            );
        return () => {
            active = false;
        };
    }, [probeServer, searchParams, setSearchParams, t]);

    const rows = useMemo(
        () =>
            getPluginRows(skills, servers).filter((plugin) => {
                const matchesTab =
                    activeTab === "all" || plugin.type === activeTab;
                const text =
                    `${plugin.name} ${plugin.key} ${plugin.description}`.toLowerCase();
                return matchesTab && text.includes(query.trim().toLowerCase());
            }),
        [activeTab, query, servers, skills],
    );

    const submitMcp = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError("");
        try {
            const payload = {
                serverKey: form.serverKey,
                displayName: form.displayName,
                endpointUrl: form.endpointUrl,
                enabled: form.enabled,
            };
            if (form.headers.trim()) {
                const headers = JSON.parse(form.headers);
                if (
                    !headers ||
                    Array.isArray(headers) ||
                    typeof headers !== "object"
                ) {
                    throw new Error(
                        t(
                            "workspace.pluginsPage.headersInvalid",
                            "请求头必须是 JSON 对象",
                        ),
                    );
                }
                payload.headers = headers;
            }
            const saved = editingServer
                ? await agentPluginService.updateMcpServer(
                      editingServer.id,
                      payload,
                  )
                : await agentPluginService.createMcpServer(payload);
            setForm(emptyForm);
            setFormOpen(false);
            setEditingServer(null);
            await loadPlugins();
            if (saved?.enabled !== false) await probeServer(saved);
        } catch (submitError) {
            setError(
                submitError.message || t("workspace.pluginsPage.saveFailed"),
            );
        } finally {
            setSaving(false);
        }
    };

    const openEditForm = (server) => {
        setEditingServer(server);
        setForm({
            serverKey: server.serverKey || "",
            displayName: server.displayName || "",
            endpointUrl: server.endpointUrl || "",
            headers: "",
            enabled: server.enabled !== false,
        });
        setFormOpen(true);
        setError("");
    };

    const closeForm = () => {
        setFormOpen(false);
        setEditingServer(null);
        setForm(emptyForm);
    };

    const removeServer = async (server) => {
        if (
            !server ||
            !window.confirm(
                t(
                    "workspace.pluginsPage.removeConfirm",
                    "确定移除此 MCP 服务吗？",
                ),
            )
        )
            return;
        try {
            await agentPluginService.deleteMcpServer(server.id);
            await loadPlugins();
        } catch (removeError) {
            setError(
                removeError.message || t("workspace.pluginsPage.saveFailed"),
            );
        }
    };

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-canvas">
            <header className="flex shrink-0 flex-wrap items-start justify-between gap-4 border-b border-border px-6 py-6 sm:px-8 lg:px-10">
                <div>
                    <div className="flex items-center gap-2 text-heading text-ink">
                        <Blocks
                            className="h-5 w-5 text-accent"
                            aria-hidden="true"
                        />
                        <span>{t("workspace.pluginsPage.title")}</span>
                    </div>
                    <div className="mt-1 text-body text-ink-muted">
                        {t("workspace.pluginsPage.subtitle")}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <label className="relative flex h-9 w-56 items-center">
                        <Search
                            className="pointer-events-none absolute left-3 h-4 w-4 text-ink-faint"
                            aria-hidden="true"
                        />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder={t("workspace.pluginsPage.search")}
                            aria-label={t("workspace.pluginsPage.search")}
                            className="h-full w-full rounded-lg border border-border bg-canvas pl-9 pr-3 text-caption text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-100"
                        />
                    </label>
                    <button
                        type="button"
                        onClick={loadPlugins}
                        disabled={loading}
                        className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted transition hover:bg-surface-muted hover:text-ink disabled:opacity-50"
                        title={t("common.refresh", "刷新")}
                        aria-label={t("common.refresh", "刷新")}
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                            aria-hidden="true"
                        />
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (formOpen) closeForm();
                            else {
                                setEditingServer(null);
                                setForm(emptyForm);
                                setFormOpen(true);
                            }
                        }}
                        className="flex h-9 items-center gap-1.5 rounded-lg bg-ink px-3 text-caption font-semibold text-white transition hover:bg-ink-secondary"
                    >
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        <span>{t("workspace.pluginsPage.add")}</span>
                    </button>
                </div>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8 lg:px-10">
                {formOpen ? (
                    <Modal
                        isOpen={formOpen}
                        onClose={closeForm}
                        title={
                            editingServer
                                ? t(
                                      "workspace.pluginsPage.edit",
                                      "编辑 MCP 服务",
                                  )
                                : t(
                                      "workspace.pluginsPage.add",
                                      "添加 MCP 服务",
                                  )
                        }
                        width="max-w-xl"
                    >
                        <form
                            onSubmit={submitMcp}
                            className="grid gap-4 sm:grid-cols-2"
                        >
                            <input
                                required
                                pattern="^[a-z][a-z0-9-]{1,19}$"
                                disabled={Boolean(editingServer)}
                                aria-label={t(
                                    "workspace.pluginsPage.serverKey",
                                )}
                                value={form.serverKey}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        serverKey: event.target.value,
                                    })
                                }
                                placeholder={t(
                                    "workspace.pluginsPage.serverKey",
                                )}
                                className="h-9 rounded-lg border border-border bg-canvas px-3 text-caption text-ink outline-none focus:border-accent disabled:opacity-60"
                            />
                            <input
                                required
                                aria-label={t(
                                    "workspace.pluginsPage.displayName",
                                )}
                                value={form.displayName}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        displayName: event.target.value,
                                    })
                                }
                                placeholder={t(
                                    "workspace.pluginsPage.displayName",
                                )}
                                className="h-9 rounded-lg border border-border bg-canvas px-3 text-caption text-ink outline-none focus:border-accent"
                            />
                            <input
                                required
                                type="url"
                                aria-label={t(
                                    "workspace.pluginsPage.endpointUrl",
                                )}
                                value={form.endpointUrl}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        endpointUrl: event.target.value,
                                    })
                                }
                                placeholder={t(
                                    "workspace.pluginsPage.endpointUrl",
                                )}
                                className="h-9 rounded-lg border border-border bg-canvas px-3 text-caption text-ink outline-none focus:border-accent sm:col-span-2"
                            />
                            <details className="sm:col-span-2">
                                <summary className="cursor-pointer text-caption font-semibold text-ink-muted">
                                    {t(
                                        "workspace.pluginsPage.advancedHeaders",
                                        "高级兼容：手动请求头（仅用于静态 Token 服务）",
                                    )}
                                </summary>
                                <div className="mt-2">
                                    <textarea
                                        value={form.headers}
                                        onChange={(event) =>
                                            setForm({
                                                ...form,
                                                headers: event.target.value,
                                            })
                                        }
                                        rows={3}
                                        spellCheck={false}
                                        placeholder={
                                            '{"Authorization":"Bearer ..."}'
                                        }
                                        className="w-full resize-y rounded-lg border border-border bg-canvas px-3 py-2 font-mono text-caption text-ink outline-none focus:border-accent"
                                    />
                                    <span className="mt-1 block text-micro text-ink-muted">
                                        {t(
                                            "workspace.pluginsPage.headersHint",
                                            editingServer
                                                ? "留空保留现有请求头；OAuth 服务不应在这里填写 Token。"
                                                : "OAuth 服务请使用授权流程；只有明确要求静态请求头的服务才使用此项。",
                                        )}
                                    </span>
                                </div>
                            </details>
                            <label className="flex items-center gap-2 text-caption text-ink sm:col-span-2">
                                <input
                                    type="checkbox"
                                    checked={form.enabled}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            enabled: event.target.checked,
                                        })
                                    }
                                    className="h-4 w-4 rounded border-border accent-accent"
                                />
                                <span>
                                    {t(
                                        "workspace.pluginsPage.enabled",
                                        "启用此 MCP 服务",
                                    )}
                                </span>
                            </label>
                            <div className="flex justify-end gap-2 sm:col-span-2">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="h-9 rounded-lg border border-border px-3 text-caption font-semibold text-ink-muted"
                                >
                                    {t("common.cancel", "取消")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex h-9 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 text-caption font-semibold text-white disabled:opacity-50"
                                >
                                    {saving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="h-4 w-4" />
                                    )}
                                    <span>{t("common.save", "保存")}</span>
                                </button>
                            </div>
                        </form>
                    </Modal>
                ) : null}
                {error ? (
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-caption text-danger">
                        {error}
                        {rows.length === 0 ? (
                            <button
                                type="button"
                                onClick={loadPlugins}
                                className="inline-flex h-8 shrink-0 items-center gap-2 rounded-lg border border-danger/20 bg-canvas px-3 font-semibold text-danger transition hover:bg-danger/5"
                            >
                                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                                {t("blog.agentImages.retry", "重新加载")}
                            </button>
                        ) : null}
                    </div>
                ) : null}
                <div className="flex items-center gap-2">
                    {["all", "skill", "mcp"].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`rounded-full px-4 py-2 text-caption font-semibold transition-colors ${activeTab === tab ? "bg-ink text-white" : "bg-surface-muted text-ink-muted hover:text-ink"}`}
                        >
                            {t(`workspace.pluginsPage.${tab}`)}
                        </button>
                    ))}
                </div>
                <div className="mt-8">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <div className="text-title text-ink">
                            {t("workspace.pluginsPage.installed")}
                        </div>
                        <div className="text-caption text-ink-faint">
                            {rows.length}
                        </div>
                    </div>
                    {loading ? (
                        <div className="flex min-h-48 items-center justify-center text-ink-muted">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    ) : rows.length ? (
                        <div className="grid gap-x-10 sm:grid-cols-2">
                            {rows.map((plugin) => {
                                const Icon = plugin.icon;
                                const server =
                                    plugin.type === "mcp"
                                        ? servers.find(
                                              (item) =>
                                                  `mcp:${item.id ?? item.serverKey}` ===
                                                  plugin.id,
                                          )
                                        : null;
                                const status =
                                    server?.enabled === false
                                        ? "DISABLED"
                                        : server?.lastStatus;
                                const isTesting = server?.id === testingId;
                                const StatusIcon =
                                    status === "OK"
                                        ? CircleCheck
                                        : status === "FAILED"
                                          ? CircleX
                                          : Wifi;
                                const statusLabel =
                                    status === "OK"
                                        ? t(
                                              "workspace.pluginsPage.connected",
                                              "已连接",
                                          )
                                        : status === "FAILED"
                                          ? t(
                                                "workspace.pluginsPage.connectionFailed",
                                                "连接失败",
                                            )
                                          : status === "DISABLED"
                                            ? t(
                                                  "workspace.pluginsPage.disabled",
                                                  "已停用",
                                              )
                                            : t(
                                                "workspace.pluginsPage.notTested",
                                                "未测试",
                                            );
                                return (
                                    <div
                                        key={plugin.id}
                                        className="flex min-h-[96px] items-center gap-3 border-b border-border py-4"
                                    >
                                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface-muted text-accent">
                                            <Icon
                                                className="h-5 w-5"
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="truncate text-body font-semibold text-ink">
                                                    {plugin.name}
                                                </span>
                                                <span className="rounded bg-surface-muted px-1.5 py-0.5 text-micro uppercase text-ink-faint">
                                                    {plugin.type}
                                                </span>
                                                {plugin.type === "mcp" ? (
                                                    <span
                                                        className={`rounded px-1.5 py-0.5 text-micro ${server?.enabled === false ? "bg-surface-muted text-ink-faint" : "bg-success/10 text-success"}`}
                                                    >
                                                        {server?.enabled === false
                                                            ? t(
                                                                  "workspace.pluginsPage.disabled",
                                                                  "已停用",
                                                              )
                                                            : t(
                                                                  "workspace.pluginsPage.enabledShort",
                                                                  "已启用",
                                                              )}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <div
                                                className={`mt-1 truncate text-caption ${status === "FAILED" ? "text-danger" : "text-ink-muted"}`}
                                                title={
                                                    plugin.description ||
                                                    plugin.key
                                                }
                                            >
                                                {plugin.description ||
                                                    plugin.key}
                                            </div>
                                            {plugin.type === "mcp" ? (
                                                <div
                                                    className={`mt-1 inline-flex items-center gap-1 text-micro font-semibold ${status === "OK" ? "text-success" : status === "FAILED" ? "text-danger" : "text-ink-faint"}`}
                                                >
                                                    <StatusIcon
                                                        className="h-3.5 w-3.5"
                                                        aria-hidden="true"
                                                    />
                                                    {isTesting
                                                        ? t(
                                                              "workspace.pluginsPage.testing",
                                                              "测试中…",
                                                          )
                                                        : statusLabel}
                                                </div>
                                            ) : null}
                                        </div>
                                        {plugin.type === "mcp" ? (
                                            <div className="flex shrink-0 items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        probeServer(server)
                                                    }
                                                    disabled={
                                                        isTesting ||
                                                        Boolean(testingId) ||
                                                        server?.enabled === false
                                                    }
                                                    className="inline-flex h-8 items-center gap-1 rounded-md border border-border px-2 text-micro font-semibold text-ink-muted hover:border-accent hover:text-accent disabled:opacity-50"
                                                    title={t(
                                                        "workspace.pluginsPage.testConnection",
                                                        "测试连接",
                                                    )}
                                                    aria-label={t(
                                                        "workspace.pluginsPage.testConnection",
                                                        "测试连接",
                                                    )}
                                                >
                                                    <PlugZap
                                                        className={`h-3.5 w-3.5 ${isTesting ? "animate-pulse" : ""}`}
                                                        aria-hidden="true"
                                                    />
                                                    <span>
                                                        {t(
                                                            "workspace.pluginsPage.test",
                                                            "测试",
                                                        )}
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditForm(server)
                                                    }
                                                    className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-faint hover:bg-surface-muted hover:text-ink"
                                                    title={t(
                                                        "workspace.pluginsPage.edit",
                                                        "编辑",
                                                    )}
                                                    aria-label={t(
                                                        "workspace.pluginsPage.edit",
                                                        "编辑",
                                                    )}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeServer(server)
                                                    }
                                                    className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-faint hover:bg-danger/5 hover:text-danger"
                                                    title={t(
                                                        "workspace.pluginsPage.remove",
                                                    )}
                                                    aria-label={t(
                                                        "workspace.pluginsPage.remove",
                                                    )}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <Check
                                                className="h-4 w-4 shrink-0 text-ink-faint"
                                                aria-hidden="true"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : error ? null : (
                        <div className="flex min-h-48 flex-col items-center justify-center text-center">
                            <Blocks
                                className="h-8 w-8 text-ink-faint"
                                aria-hidden="true"
                            />
                            <div className="mt-3 text-body font-semibold text-ink">
                                {t("workspace.pluginsPage.empty")}
                            </div>
                            <div className="mt-1 max-w-sm text-caption text-ink-muted">
                                {t("workspace.pluginsPage.emptyHint")}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WorkspacePluginsPage;

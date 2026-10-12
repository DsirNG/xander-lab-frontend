import {
    Suspense,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
} from "react";
import {
    Outlet,
    useLocation,
    useNavigate,
    useParams,
    useSearchParams,
} from "react-router-dom";
import { ProtectedRoute, useAuthSession } from "@features/auth";
import { useToast } from "@shared/hooks/useToast";
import { agentPluginService, useAgentConversation } from "@features/agent";
import { BlogManagePage, BlogPlansPage, BlogPlanDetailPage, BlogPublishPage } from "@features/blog";
import LoadingSpinner from "@shared/ui/feedback/LoadingSpinner";
import ProfileModal from "./components/ProfileModal";
import WorkspaceShell from "./components/WorkspaceShell";
import WorkspaceSidebar from "./components/WorkspaceSidebar";
import AgentImagesPage from "@features/agent/pages/AgentImagesPage";
import WorkspacePluginsPage from "./pages/WorkspacePluginsPage";

const THEME_STORAGE_KEY = "dinqor.workspace.theme";
const readThemePreference = () => {
    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        return ["light", "dark", "system"].includes(stored) ? stored : "system";
    } catch {
        return "system";
    }
};

const WorkspaceLayoutInner = () => {
    const { userInfo } = useAuthSession();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const { conversationId } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedView = searchParams.get("view");
    const activeView = [
        "images",
        "plugins",
        "writing",
        "documents",
        "memory",
        "articles",
        "plans",
        "publish",
    ].includes(requestedView)
        ? requestedView
        : null;
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [themeMode, setThemeMode] = useState(readThemePreference);
    const [systemPrefersDark, setSystemPrefersDark] = useState(
        () =>
            window.matchMedia?.("(prefers-color-scheme: dark)").matches ??
            false,
    );
    const [skills, setSkills] = useState([]);
    const [mcpServers, setMcpServers] = useState([]);
    const agent = useAgentConversation({ conversationId });
    const resolvedTheme =
        themeMode === "system"
            ? systemPrefersDark
                ? "dark"
                : "light"
            : themeMode;

    useEffect(() => {
        try {
            window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
        } catch {
            // Keep the current selection for this session if storage is unavailable.
        }
    }, [themeMode]);

    useEffect(() => {
        const media = window.matchMedia?.("(prefers-color-scheme: dark)");
        if (!media) return undefined;
        const updateSystemTheme = () => setSystemPrefersDark(media.matches);
        updateSystemTheme();
        media.addEventListener?.("change", updateSystemTheme);
        return () => media.removeEventListener?.("change", updateSystemTheme);
    }, []);

    useLayoutEffect(() => {
        document.documentElement.dataset.theme = resolvedTheme;
        document.documentElement.style.colorScheme = resolvedTheme;
    }, [resolvedTheme]);

    const hasMcpOAuthRequest = useMemo(
        () =>
            Boolean(
                new URLSearchParams(location.search).get("mcpOAuthRequest"),
            ),
        [location.search],
    );

    useEffect(() => {
        if (hasMcpOAuthRequest) setSettingsOpen(true);
    }, [hasMcpOAuthRequest]);

    useEffect(() => {
        let active = true;
        Promise.allSettled([
            agentPluginService.listSkills(),
            agentPluginService.listMcpServers(),
        ]).then(([skillsResult, serversResult]) => {
            if (!active) return;
            if (skillsResult.status === "fulfilled") {
                setSkills(
                    Array.isArray(skillsResult.value) ? skillsResult.value : [],
                );
            }
            if (serversResult.status === "fulfilled") {
                setMcpServers(
                    Array.isArray(serversResult.value)
                        ? serversResult.value
                        : [],
                );
            }
        });
        return () => {
            active = false;
        };
    }, []);

    const plugins = useMemo(
        () => [
            ...skills.map((skill) => ({
                id: `skill:${skill.skillKey || skill.id}`,
                key: skill.skillKey || skill.id,
                name: skill.name || skill.skillKey || skill.id,
                description: skill.description || "",
                instructions: skill.instructions || "",
                source: skill.source || "user",
                version: skill.version || "1",
                toolNames: skill.toolNames || [],
                type: "skill",
                enabled: true,
            })),
            ...mcpServers
                .filter((server) => server.enabled)
                .map((server) => ({
                    id: `mcp:${server.id}`,
                    key: server.serverKey,
                    name: server.displayName || server.serverKey,
                    description: (server.tools || [])
                        .map((tool) => tool.name)
                        .slice(0, 4)
                        .join(", "),
                    type: "mcp",
                    enabled: true,
                })),
        ],
        [mcpServers, skills],
    );

    const handleNewConversation = useCallback(() => {
        agent.reset();
        navigate("/app", { replace: true });
    }, [agent, navigate]);

    const handleSelectConversation = useCallback(
        (sessionId) => navigate(`/app/${sessionId}`),
        [navigate],
    );

    const handleSelectView = useCallback(
        (view) => {
            setSearchParams((current) => {
                const next = new URLSearchParams(current);
                next.delete("planId");
                next.delete("id");
                if (view === "chat") next.delete("view");
                else next.set("view", view);
                return next;
            });
        },
        [setSearchParams],
    );

    const handleTogglePin = useCallback(
        async (sessionId, pinned) => {
            try {
                await agent.setConversationPinned(sessionId, pinned);
            } catch (error) {
                toast.error(error.message || "置顶操作失败，请重试");
            }
        },
        [agent, toast],
    );

    return (
        <>
            <WorkspaceShell
                sidebar={
                    <WorkspaceSidebar
                        userInfo={userInfo}
                        sessions={agent.sessions}
                        sessionsLoading={agent.sessionsLoading}
                        sessionsHasMore={agent.sessionsHasMore}
                        sessionsLoadingMore={agent.sessionsLoadingMore}
                        sessionsLoadError={agent.sessionsLoadError}
                        sessionsLoadMoreError={agent.sessionsLoadMoreError}
                        activeConversationId={conversationId}
                        onNewConversation={handleNewConversation}
                        onSelectConversation={handleSelectConversation}
                        onTogglePin={handleTogglePin}
                        onLoadSessions={agent.loadSessions}
                        onLoadMoreSessions={agent.loadMoreSessions}
                        onOpenSettings={() => setSettingsOpen(true)}
                        activeView={
                            activeView === "publish" ? "articles" : activeView
                        }
                        onSelectView={handleSelectView}
                    />
                }
            >
                {["articles", "plans", "publish"].includes(activeView) ? (
                    <Suspense fallback={<LoadingSpinner fullScreen />}>
                        {activeView === "articles" ? (
                            <BlogManagePage />
                        ) : activeView === "publish" ? (
                            <BlogPublishPage />
                        ) : searchParams.get("planId") ? (
                            <BlogPlanDetailPage
                                key={searchParams.get("planId")}
                            />
                        ) : (
                            <BlogPlansPage />
                        )}
                    </Suspense>
                ) : activeView === "images" ? (
                    <AgentImagesPage />
                ) : activeView === "plugins" ? (
                    <WorkspacePluginsPage />
                ) : (
                    <Outlet context={{ ...agent, plugins }} />
                )}
            </WorkspaceShell>

            <ProfileModal
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                initialTab={hasMcpOAuthRequest ? "mcp" : "account"}
                themeMode={themeMode}
                resolvedTheme={resolvedTheme}
                onThemeModeChange={setThemeMode}
            />
        </>
    );
};

const WorkspaceLayout = () => (
    <ProtectedRoute>
        <WorkspaceLayoutInner />
    </ProtectedRoute>
);

export default WorkspaceLayout;

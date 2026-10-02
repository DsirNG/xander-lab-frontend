import { useCallback, useEffect, useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import ProtectedRoute from "@features/auth/components/ProtectedRoute";
import { useAuthSession } from "@features/auth/context/authSessionContextValue";
import { useToast } from "@shared/hooks/useToast";
import { useAgentConversation } from "@features/agent/hooks/useAgentConversation";
import { agentPluginService } from "@features/agent/services/agentPluginService";
import ProfileModal from "./components/ProfileModal";
import WorkspaceShell from "./components/WorkspaceShell";
import WorkspaceSidebar from "./components/WorkspaceSidebar";

const WorkspaceLayoutInner = () => {
    const { userInfo } = useAuthSession();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const { conversationId } = useParams();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [skills, setSkills] = useState([]);
    const [mcpServers, setMcpServers] = useState([]);
    const agent = useAgentConversation({ conversationId });

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
        navigate("/workspace/ai", { replace: true });
    }, [agent, navigate]);

    const handleSelectConversation = useCallback(
        (sessionId) => navigate(`/workspace/ai/${sessionId}`),
        [navigate],
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
                        plugins={plugins}
                        activeConversationId={conversationId}
                        onNewConversation={handleNewConversation}
                        onSelectConversation={handleSelectConversation}
                        onTogglePin={handleTogglePin}
                        onOpenSettings={() => setSettingsOpen(true)}
                    />
                }
            >
                <Outlet context={{ ...agent, plugins }} />
            </WorkspaceShell>

            <ProfileModal
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                initialTab={hasMcpOAuthRequest ? "mcp" : "account"}
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

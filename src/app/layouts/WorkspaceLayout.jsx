import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ProtectedRoute, useAuthSession } from "@features/auth";
import { ProfileModal } from "@features/profile";
import { WorkspaceShell, WorkspaceSidebar } from "@features/workspace";

const WorkspaceLayoutInner = () => {
    const { userInfo } = useAuthSession();
    const location = useLocation();
    const oauthConsentRequested = new URLSearchParams(location.search).has(
        "mcpOAuthRequest",
    );
    const [settingsOpen, setSettingsOpen] = useState(false);

    useEffect(() => {
        if (oauthConsentRequested) setSettingsOpen(true);
    }, [oauthConsentRequested]);

    return (
        <>
            <WorkspaceShell
                sidebar={
                    <WorkspaceSidebar
                        userInfo={userInfo}
                        onOpenSettings={() => setSettingsOpen(true)}
                    />
                }
            >
                <Outlet />
            </WorkspaceShell>

            <ProfileModal
                open={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                initialTab={oauthConsentRequested ? "mcp" : undefined}
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

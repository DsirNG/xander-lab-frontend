import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ProtectedRoute, useAuthSession } from "@features/auth";
import { ProfileModal } from "@features/profile";
import { WorkspaceShell, WorkspaceSidebar } from "@features/workspace";

const WorkspaceLayoutInner = () => {
    const { userInfo } = useAuthSession();
    const [settingsOpen, setSettingsOpen] = useState(false);

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

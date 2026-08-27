import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ProtectedRoute from '@features/auth/components/ProtectedRoute';
import { useAuthSession } from '@features/auth/context/authSessionContextValue';
import ProfileModal from './components/ProfileModal';
import WorkspaceShell from './components/WorkspaceShell';
import WorkspaceSidebar from './components/WorkspaceSidebar';

const WorkspaceLayoutInner = () => {
  const { userInfo } = useAuthSession();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <WorkspaceShell
        sidebar={(
          <WorkspaceSidebar
            userInfo={userInfo}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}
      >
        <Outlet />
      </WorkspaceShell>

      <ProfileModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
};

const WorkspaceLayout = () => (
  <ProtectedRoute>
    <WorkspaceLayoutInner />
  </ProtectedRoute>
);

export default WorkspaceLayout;

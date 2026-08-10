import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CalendarClock,
  Code2,
  LayoutDashboard,
  LogOut,
  Mail,
  NotebookPen,
  Settings,
  Sparkles,
} from 'lucide-react';
import ProtectedRoute from '@features/auth/components/ProtectedRoute';
import { authService } from '@features/auth/services/authService';
import ProfileModal from './components/ProfileModal';

const MENU = [
  { to: '/workspace/plans', icon: CalendarClock, labelKey: 'nav.plans' },
  { to: '/workspace/img2three', icon: Sparkles, labelKey: 'nav.img2three' },
  { to: '/workspace/studio', icon: Code2, labelKey: 'nav.studio' },
  { to: '/workspace/blog-manage', icon: NotebookPen, labelKey: 'profile.blogManage.title' },
  { to: '/workspace/email-reminders', icon: Mail, labelKey: 'profile.emailReminders.title' },
];

const WorkspaceLayoutInner = () => {
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = async () => {
    await authService.logout();
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen flex-col bg-surface">
      {/* 顶栏 */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-canvas px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent text-white">
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="text-base font-black tracking-tight text-ink">{t('workspace.title')}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-canvas px-3 py-1.5 text-xs font-semibold text-ink-secondary transition hover:border-accent hover:text-accent"
          >
            <Settings className="h-3.5 w-3.5" aria-hidden="true" />
            {t('workspace.settings')}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-canvas px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:border-danger/40 hover:text-danger"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            {t('nav.logout')}
          </button>
        </div>
      </header>

      {/* 移动端横向菜单 */}
      <nav className="flex gap-1 overflow-x-auto border-b border-border bg-canvas px-3 py-2 lg:hidden" aria-label={t('workspace.title')}>
        {MENU.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  isActive ? 'bg-accent-soft text-accent' : 'text-ink-muted hover:bg-surface hover:text-ink-secondary'
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {t(item.labelKey)}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex min-h-0 flex-1">
        {/* 桌面端左侧菜单 */}
        <aside className="hidden w-60 shrink-0 flex-col gap-1 border-r border-border bg-canvas p-3 lg:flex" aria-label={t('workspace.title')}>
          {MENU.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-accent-soft text-accent'
                      : 'text-ink-muted hover:bg-surface hover:text-ink-secondary'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {t(item.labelKey)}
              </NavLink>
            );
          })}
        </aside>

        {/* 右侧内容 */}
        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <ProfileModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

const WorkspaceLayout = () => (
  <ProtectedRoute>
    <WorkspaceLayoutInner />
  </ProtectedRoute>
);

export default WorkspaceLayout;

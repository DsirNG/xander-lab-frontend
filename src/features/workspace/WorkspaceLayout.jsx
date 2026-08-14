import React, { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bot,
  CalendarClock,
  Code2,
  Mail,
  NotebookPen,
  Send,
  Sparkles,
  Zap,
} from 'lucide-react';
import ProtectedRoute from '@features/auth/components/ProtectedRoute';
import NotificationBell from '@features/blog/components/NotificationBell';
import ProfileModal from './components/ProfileModal';
import UserMenu from './components/UserMenu';

const MENU = [
  { to: '/workspace/agent', icon: Bot, labelKey: 'blog.agentChat.title' },
  { to: '/workspace/publish', icon: Send, labelKey: 'blog.publish' },
  { to: '/workspace/plans', icon: CalendarClock, labelKey: 'nav.plans' },
  { to: '/workspace/blog-manage', icon: NotebookPen, labelKey: 'profile.blogManage.title' },
  { to: '/workspace/email-reminders', icon: Mail, labelKey: 'profile.emailReminders.title' },
  { to: '/workspace/img2three', icon: Sparkles, labelKey: 'nav.img2three' },
  { to: '/workspace/studio', icon: Code2, labelKey: 'nav.studio' },
];

const WorkspaceLayoutInner = () => {
  const { t } = useTranslation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-canvas">
      {/* 顶栏：左侧 Logo + 名称（点击回首页），右侧通知铃铛 + 用户区 */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-canvas px-4 sm:px-6">
        <Link
          to="/"
          className="group flex items-center gap-2.5 rounded-xl px-1.5 py-1 transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-accent-200"
          aria-label={t('workspace.backHome')}
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-accent text-white transition group-hover:brightness-110">
            <Zap className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="hidden text-base font-bold tracking-tight text-ink sm:block">Xander Lab</span>
          <span className="text-base font-bold tracking-tight text-ink sm:hidden">{t('workspace.title')}</span>
        </Link>

        <div className="flex items-center gap-1.5">
          <NotificationBell />
          <UserMenu onOpenSettings={() => setSettingsOpen(true)} />
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
                `inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
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
        <aside className="hidden w-52 shrink-0 flex-col border-r border-border bg-canvas p-2 lg:flex" aria-label={t('workspace.title')}>
          <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
            {MENU.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition ${
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
          </div>
        </aside>

        {/* 右侧内容 */}
        <main className="min-h-0 flex-1 overflow-hidden bg-canvas">
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

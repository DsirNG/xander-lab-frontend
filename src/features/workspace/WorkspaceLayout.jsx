import React, { useMemo, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Bot,
  CalendarClock,
  Code2,
  Mail,
  NotebookPen,
  Send,
  Server,
  SlidersHorizontal,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import ProtectedRoute from '@features/auth/components/ProtectedRoute';
import { useAuthSession } from '@features/auth/context/authSessionContextValue';
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

/** 仅 ADMIN 角色可见的后台管理菜单（路由侧另有 RequireAdmin 强校验） */
const ADMIN_MENU = [
  { to: '/workspace/admin/users', icon: Users, labelKey: 'admin.users.title' },
  { to: '/workspace/admin/model-providers', icon: Server, labelKey: 'admin.providers.title' },
  { to: '/workspace/admin/feature-model-configs', icon: SlidersHorizontal, labelKey: 'admin.configs.title' },
];

const WorkspaceLayoutInner = () => {
  const { t } = useTranslation();
  const { userInfo } = useAuthSession();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const menu = useMemo(
    () => (userInfo?.role === 'ADMIN' ? [...MENU, ...ADMIN_MENU] : MENU),
    [userInfo?.role],
  );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-surface-muted">
      {/* 顶部整条 + 左侧整条：合并为同一底色，围出桌面端的 L 形外壳 */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 bg-surface px-3 xs:px-4 sm:px-6">
        <Link
          to="/"
          className="group flex min-w-0 items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-accent-200"
          aria-label={t('workspace.backHome')}
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-accent text-white transition group-hover:brightness-110">
            <Zap className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="hidden truncate text-base font-bold tracking-tight text-ink sm:block">DinQorAI</span>
          <span className="truncate text-base font-bold tracking-tight text-ink sm:hidden">{t('workspace.title')}</span>
        </Link>

        <div className="flex shrink-0 items-center gap-1">
          <NotificationBell />
          <UserMenu onOpenSettings={() => setSettingsOpen(true)} />
        </div>
      </header>

      {/* 移动端横向菜单（与顶部/左侧同色，无额外边界） */}
      <nav className="flex gap-1 overflow-x-auto overscroll-x-contain bg-surface px-3 py-2 lg:hidden" aria-label={t('workspace.title')}>
        <div className="mx-auto flex min-w-max gap-1">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                    isActive ? 'bg-accent-soft text-accent' : 'text-ink-muted hover:bg-surface-muted hover:text-ink-secondary'
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {t(item.labelKey)}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="flex min-h-0 flex-1">
        {/* 左侧整条菜单（与顶部同色，合并为一体，右侧以灰底自然接壤） */}
        <aside className="hidden min-h-0 w-52 shrink-0 flex-col gap-1 overflow-y-auto bg-surface p-2 lg:flex" aria-label={t('workspace.title')}>
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-accent-soft text-accent'
                      : 'text-ink-muted hover:bg-surface-muted hover:text-ink-secondary'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {t(item.labelKey)}
              </NavLink>
            );
          })}
        </aside>

        {/* 内容区贴合右下边界，仅保留与 L 形外壳相接的内圆角 */}
        <main className="min-h-0 min-w-0 flex-1 bg-surface">
          <div className="h-full min-h-0 overflow-hidden rounded-t-3xl border-t border-border bg-canvas lg:rounded-t-none lg:rounded-tl-3xl lg:border-l">
            <Outlet />
          </div>
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

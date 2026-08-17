import React, { useEffect, useRef, useState } from 'react';
import {
  MessageSquareText, Search, PanelLeftClose, SquarePen, Image as ImageIcon, CircleUser,
  ChevronDown, Coins, Loader2, LogOut, Settings2, Shield, UserRound,
  Send, CalendarClock, NotebookPen, Mail, Sparkles, Code2, Users, Server, SlidersHorizontal,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuthSession } from '@features/auth/context/authSessionContextValue';
import { authService } from '@features/auth/services/authService';
import { pointsService } from '@features/profile/services/pointsService';
import { useToast } from '@hooks/useToast';

/** 工作台功能入口，与 WorkspaceLayout 菜单一致（当前页面外的独立全屏页面） */
const FEATURE_ENTRIES = [
  { to: '/workspace/publish', icon: Send, labelKey: 'blog.publish' },
  { to: '/workspace/plans', icon: CalendarClock, labelKey: 'nav.plans' },
  { to: '/workspace/blog-manage', icon: NotebookPen, labelKey: 'profile.blogManage.title' },
  { to: '/workspace/email-reminders', icon: Mail, labelKey: 'profile.emailReminders.title' },
  { to: '/workspace/img2three', icon: Sparkles, labelKey: 'nav.img2three' },
  { to: '/workspace/studio', icon: Code2, labelKey: 'nav.studio' },
];

/** 仅 ADMIN 角色可见的后台管理入口（路由侧另有 RequireAdmin 强校验） */
const ADMIN_ENTRIES = [
  { to: '/workspace/admin/users', icon: Users, labelKey: 'admin.users.title' },
  { to: '/workspace/admin/model-providers', icon: Server, labelKey: 'admin.providers.title' },
  { to: '/workspace/admin/feature-model-configs', icon: SlidersHorizontal, labelKey: 'admin.configs.title' },
];

const AgentSessionList = ({ sessions, activeId, loading, disableNew = false, mobile = false, imagesActive = false, newChatActive = false, onSelect, onNew, onCollapse, onSearch, onImages, onOpenSettings }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  const { userInfo } = useAuthSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [points, setPoints] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const boxRef = useRef(null);

  const displayName = userInfo?.nickname || userInfo?.username || '用户';
  const avatarText = (displayName || 'XL').slice(0, 2).toUpperCase();
  const avatar = userInfo?.avatar;
  const tier = userInfo?.tier || '免费版';

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // 浮框打开时刷新积分余额（静默失败，不影响侧边栏渲染）。
  useEffect(() => {
    if (!menuOpen) return;
    let active = true;
    pointsService.overview({ _silent: true })
      .then((data) => active && setPoints(data))
      .catch(() => { /* 静默保留旧值 */ });
    return () => { active = false; };
  }, [menuOpen, userInfo?.id]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
      window.location.href = '/';
    } catch {
      setLoggingOut(false);
      toast.error(t('workspace.logoutFailed'));
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <aside className={`${mobile ? 'flex h-full w-[260px] max-w-[calc(100vw-3rem)]' : 'hidden min-h-0 w-[260px] lg:flex'} relative shrink-0 flex-col bg-[#fcfcfc]`}>
      {/* Top Header */}
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <div onClick={() => navigate('/workspace')} className="flex items-center gap-2 px-2 py-1 hover:bg-surface-muted rounded-lg cursor-pointer transition">
          <span className="font-bold text-base text-ink">DinQorGPT</span>
        </div>
        <div className="flex items-center gap-1 text-ink-muted">
          <button onClick={onSearch} className="p-1.5 hover:bg-surface-muted rounded-lg transition"><Search className="h-4 w-4" /></button>
          <button
            onClick={onCollapse}
            className="p-1.5 hover:bg-surface-muted rounded-lg transition hidden lg:block"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={onNew}
          disabled={disableNew}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-50 ${
            newChatActive
              ? 'bg-surface-muted text-ink'
              : 'text-ink-secondary hover:bg-surface-muted hover:text-ink'
          }`}
        >
          <SquarePen className="h-4 w-4 text-ink-muted" />
          <span>新聊天</span>
        </button>
      </div>

      {/* Nav Links */}
      <div className="px-3 py-1 space-y-0.5">
        <button
          onClick={onImages}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
            imagesActive ? 'bg-surface-muted text-ink' : 'text-ink hover:bg-surface-muted'
          }`}
        >
          <ImageIcon className={`h-4 w-4 ${imagesActive ? 'text-emerald-500' : 'text-ink-muted'}`} />
          <span>图片</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="mt-4 px-3 pb-1 text-xs font-semibold text-ink-muted">
        最近
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
        {loading && !sessions.length ? (
          <div className="space-y-2 p-1">
            {[0, 1, 2].map((item) => <div key={item} className="h-8 animate-pulse rounded-lg bg-surface-muted" />)}
          </div>
        ) : sessions.length ? sessions.map((session) => (
          <button
            key={session.id}
            type="button"
            onClick={() => onSelect(session.id)}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition disabled:cursor-wait disabled:opacity-50 ${
              !imagesActive && String(activeId) === String(session.id)
                ? 'bg-surface-muted text-ink'
                : 'text-ink-secondary hover:bg-surface-muted/50'
            }`}
          >
            <span className="truncate flex-1">{session.title || t('blog.agent.untitled')}</span>
          </button>
        )) : (
          <div className="py-4 text-center text-xs text-ink-faint">{t('blog.agent.noConversations')}</div>
        )}
      </div>

      {/* Bottom Profile */}
      <div className="p-3 border-t border-border/50">
        <div ref={boxRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={t('workspace.userMenu')}
            className={`flex w-full items-center justify-between rounded-xl p-2 transition ${
              menuOpen ? 'bg-surface-muted' : 'hover:bg-surface-muted'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-white font-bold text-xs uppercase">
                {avatarText}
                {avatar ? (
                  <img
                    src={avatar}
                    alt={displayName}
                    className="absolute inset-0 h-full w-full rounded-full object-cover"
                    onError={(event) => { event.currentTarget.style.display = 'none'; }}
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="text-sm font-semibold text-ink truncate">{displayName}</div>
                <div className="text-xs text-ink-muted truncate">{tier}</div>
              </div>
            </div>
            <ChevronDown className={`h-4 w-4 shrink-0 text-ink-muted transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              className="absolute bottom-14 left-0 right-0 z-50 max-h-[calc(100vh-80px)] overflow-y-auto rounded-2xl border border-border bg-canvas shadow-lg shadow-black/5"
            >
              {/* 用户信息 */}
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent text-sm font-black uppercase text-white">
                  {avatarText}
                  {avatar ? (
                    <img src={avatar} alt={displayName} className="absolute inset-0 h-full w-full rounded-full object-cover" />
                  ) : null}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <div className="truncate text-sm font-bold text-ink">{displayName}</div>
                    {userInfo?.role ? (
                      <span className="shrink-0 rounded bg-accent-soft px-1.5 py-0.5 text-micro font-bold uppercase text-accent ring-1 ring-accent-100">
                        {userInfo.role}
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-0.5 truncate text-micro font-medium text-ink-faint">
                    {userInfo?.email || userInfo?.username || ''}
                  </div>
                </div>
              </div>

              <div className="grid gap-1 px-3 py-2.5">
                <div className="flex items-center gap-2.5 rounded-lg bg-surface px-3 py-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-accent-soft text-accent">
                    <Coins className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-micro font-medium text-ink-faint">{t('workspace.points')}</div>
                    <div className="text-xs font-bold text-ink">{points ? points.balance : '—'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg bg-surface px-3 py-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-surface-muted text-ink-faint">
                    <UserRound className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-micro font-medium text-ink-faint">{t('profile.account.username')}</div>
                    <div className="truncate text-xs font-bold text-ink">{userInfo?.username || '—'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 rounded-lg bg-surface px-3 py-2">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-surface-muted text-ink-faint">
                    <Shield className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-micro font-medium text-ink-faint">{t('profile.account.role')}</div>
                    <div className="text-xs font-bold text-ink">{userInfo?.role || '—'}</div>
                  </div>
                </div>
              </div>

              {/* 工作台功能入口 */}
              <div className="border-t border-border p-1.5">
                <div className="px-3 py-1 text-micro font-semibold text-ink-faint">{t('workspace.title')}</div>
                <div className="grid gap-0.5">
                  {FEATURE_ENTRIES.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.to}
                        type="button"
                        role="menuitem"
                        onClick={() => { closeMenu(); navigate(item.to); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-ink-secondary transition hover:bg-surface-muted hover:text-ink"
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden="true" />
                        {t(item.labelKey)}
                      </button>
                    );
                  })}
                  {userInfo?.role === 'ADMIN' && ADMIN_ENTRIES.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.to}
                        type="button"
                        role="menuitem"
                        onClick={() => { closeMenu(); navigate(item.to); }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-ink-secondary transition hover:bg-surface-muted hover:text-ink"
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden="true" />
                        {t(item.labelKey)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-border p-1.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => { closeMenu(); onOpenSettings?.(); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-ink-secondary transition hover:bg-surface-muted hover:text-ink"
                >
                  <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {t('workspace.settings')}
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-ink-muted transition hover:bg-danger-soft hover:text-danger disabled:opacity-60"
                >
                  {loggingOut ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" aria-hidden="true" />}
                  {t('nav.logout')}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
};

export default AgentSessionList;
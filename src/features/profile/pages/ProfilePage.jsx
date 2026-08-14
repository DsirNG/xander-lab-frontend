import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Bell,
    FileText,
    KeyRound,
    LogOut,
    Mail,
    Plug,
    Settings2,
    Shield,
    SlidersHorizontal,
    UserRound,
} from 'lucide-react';
import ConfirmModal from '@components/common/ConfirmModal';
import LoadingSpinner from '@components/common/LoadingSpinner';
import { useToast } from '@hooks/useToast';
import { authService } from '@features/auth/services/authService';
import AccountInfoPanel from '../components/AccountInfoPanel';
import McpAuthorizationPanel from '../components/McpAuthorizationPanel';

const NAV_ITEMS = [
    { id: 'account', icon: UserRound, enabled: true },
    { id: 'security', icon: Shield, enabled: false },
    { id: 'notifications', icon: Bell, enabled: false },
    { id: 'templates', icon: Mail, enabled: false },
    { id: 'history', icon: FileText, enabled: false },
    { id: 'apiKeys', icon: KeyRound, enabled: false },
    { id: 'mcp', icon: Plug, enabled: true },
    { id: 'preferences', icon: SlidersHorizontal, enabled: false },
];

const ProfilePage = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(() => authService.getLocalUserInfo());
    const [activeNav, setActiveNav] = useState(() => (
        new URLSearchParams(window.location.search).has('mcpOAuthRequest') ? 'mcp' : 'account'
    ));
    const [authChecking, setAuthChecking] = useState(!userInfo);
    const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        const info = authService.getLocalUserInfo();
        if (!info) {
            navigate('/login', {
                replace: true,
                state: { from: { pathname: '/profile', search: window.location.search } },
            });
            return;
        }
        setUserInfo(info);
        setAuthChecking(false);
    }, [navigate]);

    useEffect(() => {
        const onLogout = () => {
            setUserInfo(null);
            navigate('/login', { replace: true, state: { from: { pathname: '/profile' } } });
        };
        window.addEventListener('auth:logout', onLogout);
        return () => window.removeEventListener('auth:logout', onLogout);
    }, [navigate]);

    if (authChecking || !userInfo) {
        return <LoadingSpinner fullScreen text={t('profile.loading')} />;
    }

    const displayName = userInfo.nickname || userInfo.username || t('profile.account.title');
    const accountEmail = userInfo.email || userInfo.account || '';
    const roleLabel = userInfo.role || t('profile.account.title');
    const avatarText = displayName.slice(0, 2).toUpperCase();

    const handleNavClick = (item) => {
        if (item.enabled) {
            setActiveNav(item.id);
            return;
        }
        toast.info(t('profile.comingSoon'));
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await authService.logout();
            setUserInfo(null);
            window.location.href = '/';
        } catch (err) {
            console.error('Logout failed', err);
            setLoggingOut(false);
        }
    };

    return (
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col bg-surface/40 lg:h-[calc(100vh-4rem)] lg:max-h-[calc(100vh-4rem)] lg:flex-row lg:overflow-hidden">
            <aside className="flex w-full shrink-0 flex-col border-b border-border bg-canvas lg:h-full lg:w-[220px] lg:border-b-0 lg:border-r">
                <div className="border-b border-border px-4 py-4">
                    <div className="mb-3">
                        <div className="text-base font-black tracking-tight text-ink">
                            {t('profile.title')}
                        </div>
                        <div className="mt-0.5 text-caption font-medium text-ink-faint">
                            {t('profile.subtitle')}
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-xs font-black uppercase text-white">
                            {avatarText}
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                                <div className="truncate text-xs font-bold text-ink">{displayName}</div>
                                <span className="rounded bg-accent-soft px-1.5 py-0.5 text-micro font-bold text-accent ring-1 ring-accent-100">
                                    {roleLabel}
                                </span>
                            </div>
                            <div className="mt-0.5 truncate text-micro font-medium text-ink-faint">
                                {accountEmail || t('profile.account.title')}
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="flex gap-1 overflow-x-auto px-2 py-3 lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:px-3">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeNav === item.id;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleNavClick(item)}
                                className={`flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition lg:w-full ${
                                    isActive
                                        ? 'bg-accent-soft text-ink'
                                        : 'text-ink-muted hover:bg-surface hover:text-ink-secondary'
                                }`}
                            >
                                <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-ink-secondary' : 'text-ink-faint'}`} />
                                <span className="whitespace-nowrap">{t(`profile.nav.${item.id}`)}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="border-t border-border p-3">
                    <button
                        type="button"
                        onClick={() => setLogoutConfirmOpen(true)}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-ink-muted transition hover:bg-danger-soft hover:text-danger"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        {t('nav.logout')}
                    </button>
                </div>
            </aside>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-canvas">
                {activeNav === 'account' ? (
                    <div className="min-h-0 overflow-y-auto p-4 sm:p-6">
                        <AccountInfoPanel />
                    </div>
                ) : activeNav === 'mcp' ? (
                    <McpAuthorizationPanel />
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface text-ink-faint">
                            <Settings2 className="h-6 w-6" />
                        </span>
                        <div className="text-sm font-bold text-ink-secondary">{t('profile.comingSoon')}</div>
                        <div className="max-w-sm text-xs font-medium leading-5 text-ink-faint">
                            {t('profile.comingSoonHint')}
                        </div>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={logoutConfirmOpen}
                onClose={() => !loggingOut && setLogoutConfirmOpen(false)}
                onConfirm={handleLogout}
                confirming={loggingOut}
                danger
                title={t('profile.logoutConfirmTitle')}
                message={t('profile.logoutConfirmMessage')}
                confirmText={t('nav.logout')}
            />
        </div>
    );
};

export default ProfilePage;

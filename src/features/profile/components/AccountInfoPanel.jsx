import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AtSign, CalendarDays, CheckCircle2, Image as ImageIcon, Loader2, Shield, UserRound } from 'lucide-react';
import { authService } from '@features/auth/services/authService';
import { useAuthSession } from '@features/auth/context/authSessionContextValue';
import { useToast } from '@hooks/useToast';
import FormField from '@components/common/FormField';
import { formInputCls } from '@components/common/formStyles';
import Button from '@components/common/Button';

const DEFAULT_AVATAR_SEED = 'https://api.dicebear.com/7.x/avataaars/svg?seed=';

/**
 * 账户信息面板：展示并编辑昵称 / 头像，账号字段（用户名、邮箱、角色、注册时间）只读。
 */
const AccountInfoPanel = () => {
    const { t, i18n } = useTranslation();
    const toast = useToast();
    const { userInfo } = useAuthSession();
    const [nickname, setNickname] = useState(userInfo?.nickname || userInfo?.username || '');
    const [avatar, setAvatar] = useState(userInfo?.avatar || '');
    const [saving, setSaving] = useState(false);
    const [avatarError, setAvatarError] = useState(false);

    const dateFormatter = useMemo(() => new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'medium',
    }), [i18n.language]);

    const displayName = userInfo?.nickname || userInfo?.username || '';
    const avatarText = (displayName || 'XL').slice(0, 2).toUpperCase();

    const handleAvatarError = useCallback(() => setAvatarError(true), []);
    const handleAvatarLoad = useCallback(() => setAvatarError(false), []);

    const avatarPreview = avatar.trim()
        ? (
            <img
                src={avatar.trim()}
                alt={t('profile.account.avatar')}
                onError={handleAvatarError}
                onLoad={handleAvatarLoad}
                className="h-full w-full rounded-xl object-cover"
            />
        )
        : null;

    const handleSave = async () => {
        const trimmedNickname = nickname.trim();
        if (!trimmedNickname) {
            toast.error(t('profile.account.nicknameRequired'));
            return;
        }
        setSaving(true);
        try {
            const updated = await authService.updateProfile({
                nickname: trimmedNickname,
                avatar: avatar.trim(),
            });
            window.dispatchEvent(new CustomEvent('auth:user-updated', { detail: { user: updated } }));
            toast.success(t('profile.account.saved'));
        } catch {
            // Shared HTTP handling presents the server error.
        } finally {
            setSaving(false);
        }
    };

    const readonlyFields = [
        { key: 'username', label: t('profile.account.username'), value: userInfo?.username || '—', icon: UserRound },
        { key: 'email', label: t('profile.account.email'), value: userInfo?.email || userInfo?.username || '—', icon: AtSign },
        { key: 'role', label: t('profile.account.role'), value: userInfo?.role || '—', icon: Shield },
        {
            key: 'createdAt',
            label: t('profile.account.memberSince'),
            value: userInfo?.createdAt ? dateFormatter.format(new Date(userInfo.createdAt)) : '—',
            icon: CalendarDays,
        },
    ];

    return (
        <div className="flex flex-col gap-5">
            <div>
                <div className="text-body font-bold text-ink">{t('profile.account.title')}</div>
                <div className="mt-0.5 text-caption font-medium text-ink-faint">
                    {t('profile.account.description')}
                </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                <div className="relative h-20 w-20 shrink-0">
                    {avatarPreview || (
                        <span className="grid h-full w-full place-items-center rounded-xl bg-accent text-lg font-black uppercase text-white">
                            {avatarText}
                        </span>
                    )}
                    {avatarError ? (
                        <span className="absolute inset-x-0 -bottom-1.5 text-center text-micro font-medium text-danger">
                            {t('profile.account.avatarInvalid')}
                        </span>
                    ) : null}
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                    <FormField label={t('profile.account.nickname')} htmlFor="account-nickname">
                        <div className="relative">
                            <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                            <input
                                id="account-nickname"
                                type="text"
                                maxLength={30}
                                value={nickname}
                                onChange={(event) => setNickname(event.target.value)}
                                placeholder={t('profile.account.nicknamePlaceholder')}
                                className={`${formInputCls} pl-9`}
                            />
                        </div>
                    </FormField>
                    <FormField
                        label={t('profile.account.avatar')}
                        htmlFor="account-avatar"
                        hint={t('profile.account.avatarHint')}
                    >
                        <div className="relative">
                            <ImageIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                            <input
                                id="account-avatar"
                                type="url"
                                maxLength={255}
                                value={avatar}
                                onChange={(event) => setAvatar(event.target.value)}
                                placeholder={`${DEFAULT_AVATAR_SEED}...`}
                                className={`${formInputCls} pl-9`}
                            />
                        </div>
                    </FormField>
                    <div className="pt-1">
                        <Button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            size="lg"
                            variant="primary"
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-bold shadow-sm shadow-accent/20 transition hover:brightness-105 disabled:opacity-60"
                        >
                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                            {t('profile.account.save')}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
                {readonlyFields.map((field) => {
                    const Icon = field.icon;
                    return (
                        <div key={field.key} className="flex items-center gap-2.5 rounded-xl border border-border bg-canvas px-3 py-2.5">
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-ink-faint">
                                <Icon className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0">
                                <div className="text-micro font-medium text-ink-faint">{field.label}</div>
                                <div className="truncate text-xs font-bold text-ink" title={field.value}>{field.value}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AccountInfoPanel;
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    AtSign,
    CalendarDays,
    CheckCircle2,
    Loader2,
    Shield,
    Upload,
    UserRound,
} from "lucide-react";
import { upload as uploadFile } from "@api";
import { updateProfile, useAuthSession } from "@features/auth";
import { useToast } from "@shared/hooks/useToast";
import FormField from "@shared/ui/forms/FormField";
import { formInputCls } from "@shared/ui/forms/formStyles";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const AVATAR_CONTENT_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
]);

/**
 * 账户信息面板：展示并编辑昵称 / 头像，账号字段（用户名、邮箱、角色、注册时间）只读。
 */
const AccountInfoPanel = () => {
    const { t, i18n } = useTranslation();
    const toast = useToast();
    const { userInfo } = useAuthSession();
    const [nickname, setNickname] = useState(
        userInfo?.nickname || userInfo?.username || "",
    );
    const [avatar, setAvatar] = useState(userInfo?.avatar || "");
    const [saving, setSaving] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const avatarInputRef = useRef(null);

    const dateFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat(i18n.language, {
                dateStyle: "medium",
            }),
        [i18n.language],
    );

    const displayName = userInfo?.nickname || userInfo?.username || "";
    const avatarText = (displayName || "XL").slice(0, 2).toUpperCase();

    const handleAvatarError = useCallback(() => setAvatarError(true), []);
    const handleAvatarLoad = useCallback(() => setAvatarError(false), []);

    const avatarPreview = avatar.trim() && !avatarError ? (
        <img
            src={avatar.trim()}
            alt={t("profile.account.avatar")}
            onError={handleAvatarError}
            onLoad={handleAvatarLoad}
            className="h-full w-full rounded-xl object-cover"
        />
    ) : null;

    const handleAvatarFileChange = async (event) => {
        const input = event.currentTarget;
        const file = input.files?.[0];
        input.value = "";
        if (!file) return;
        if (
            !AVATAR_CONTENT_TYPES.has(file.type) ||
            file.size > MAX_AVATAR_BYTES
        ) {
            toast.error(t("profile.account.avatarInvalid"));
            return;
        }

        setAvatarUploading(true);
        try {
            const uploaded = await uploadFile("/api/upload/oss", file, {
                fieldName: "file",
                extraData: { type: "avatar" },
                config: { _silent: true },
            });
            if (typeof uploaded?.url !== "string" || !uploaded.url.trim())
                throw new Error("Avatar upload response did not include a URL");

            const avatarUrl = new URL(
                uploaded.url,
                window.location.origin,
            ).toString();
            setAvatar(avatarUrl);
            setAvatarError(false);
            toast.info(t("profile.account.avatarUploadReady"));
        } catch {
            toast.error(t("profile.account.avatarUploadFailed"));
        } finally {
            setAvatarUploading(false);
        }
    };

    const handleSave = async () => {
        const trimmedNickname = nickname.trim();
        if (!trimmedNickname) {
            toast.error(t("profile.account.nicknameRequired"));
            return;
        }
        setSaving(true);
        try {
            const updated = await updateProfile({
                nickname: trimmedNickname,
                avatar: avatar.trim(),
            });
            window.dispatchEvent(
                new CustomEvent("auth:user-updated", {
                    detail: { user: updated },
                }),
            );
            toast.success(t("profile.account.saved"));
        } catch {
            // Shared HTTP handling presents the server error.
        } finally {
            setSaving(false);
        }
    };

    const readonlyFields = [
        {
            key: "username",
            label: t("profile.account.username"),
            value: userInfo?.username || "—",
            icon: UserRound,
        },
        {
            key: "email",
            label: t("profile.account.email"),
            value: userInfo?.email || userInfo?.username || "—",
            icon: AtSign,
        },
        {
            key: "role",
            label: t("profile.account.role"),
            value: userInfo?.role || "—",
            icon: Shield,
        },
        {
            key: "createdAt",
            label: t("profile.account.memberSince"),
            value: userInfo?.createdAt
                ? dateFormatter.format(new Date(userInfo.createdAt))
                : "—",
            icon: CalendarDays,
        },
    ];

    return (
        <div className="flex flex-col gap-5">
            <div>
                <div className="text-body font-bold text-ink">
                    {t("profile.account.title")}
                </div>
                <div className="mt-0.5 text-caption font-medium text-ink-faint">
                    {t("profile.account.description")}
                </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
                <div className="flex shrink-0 flex-col items-center gap-2 sm:items-start">
                    <div className="text-caption font-semibold text-ink">
                        {t("profile.account.avatar")}
                    </div>
                    <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={avatarUploading || saving}
                        className="group relative h-20 w-20 overflow-hidden rounded-xl bg-accent text-lg font-black uppercase text-white outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-wait"
                        title={t("profile.account.uploadAvatar")}
                        aria-label={t("profile.account.uploadAvatar")}
                    >
                        {avatarPreview || (
                            <span className="grid h-full w-full place-items-center">
                                {avatarText}
                            </span>
                        )}
                        <span className="absolute inset-0 grid place-items-center bg-ink/55 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                            {avatarUploading ? (
                                <Loader2
                                    className="h-5 w-5 animate-spin"
                                    aria-hidden="true"
                                />
                            ) : (
                                <Upload
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                />
                            )}
                        </span>
                    </button>
                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleAvatarFileChange}
                        disabled={avatarUploading || saving}
                        className="sr-only"
                        tabIndex={-1}
                        aria-hidden="true"
                    />
                    <div
                        className={`max-w-40 text-center text-micro font-medium sm:text-left ${
                            avatarError ? "text-danger" : "text-ink-faint"
                        }`}
                    >
                        {avatarError
                            ? t("profile.account.avatarInvalid")
                            : t("profile.account.avatarHint")}
                    </div>
                </div>
                <div className="min-w-0 flex-1 space-y-3">
                    <FormField
                        label={t("profile.account.nickname")}
                        htmlFor="account-nickname"
                    >
                        <div className="relative">
                            <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                            <input
                                id="account-nickname"
                                type="text"
                                maxLength={30}
                                value={nickname}
                                onChange={(event) =>
                                    setNickname(event.target.value)
                                }
                                placeholder={t(
                                    "profile.account.nicknamePlaceholder",
                                )}
                                className={`${formInputCls} pl-9`}
                            />
                        </div>
                    </FormField>
                    <div className="pt-1">
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || avatarUploading}
                            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-accent px-5 text-xs font-bold text-white shadow-sm shadow-accent/20 transition hover:brightness-105 disabled:opacity-60"
                        >
                            {saving ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            {t("profile.account.save")}
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
                {readonlyFields.map((field) => {
                    const Icon = field.icon;
                    return (
                        <div
                            key={field.key}
                            className="flex items-center gap-2.5 rounded-xl border border-border bg-canvas px-3 py-2.5"
                        >
                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-ink-faint">
                                <Icon className="h-3.5 w-3.5" />
                            </span>
                            <div className="min-w-0">
                                <div className="text-micro font-medium text-ink-faint">
                                    {field.label}
                                </div>
                                <div
                                    className="truncate text-xs font-bold text-ink"
                                    title={field.value}
                                >
                                    {field.value}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AccountInfoPanel;

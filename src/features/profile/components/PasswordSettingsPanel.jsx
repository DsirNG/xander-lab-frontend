import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@shared/hooks/useToast";
import FormField from "@shared/ui/forms/FormField";
import Button from "@shared/ui/primitives/Button";
import { formInputCls } from "@shared/ui/forms/formStyles";
import { changePassword } from "@features/auth";

const PasswordSettingsPanel = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.warning(t("profile.security.passwordMismatch"));
            return;
        }

        setSaving(true);
        try {
            await changePassword({ currentPassword, newPassword });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            toast.success(t("profile.security.passwordUpdated"));
        } catch {
            // Shared HTTP handling presents the server error.
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="max-w-2xl space-y-5">
            <div>
                <div className="text-title font-semibold text-ink">
                    {t("profile.security.title")}
                </div>
                <div className="mt-1 text-caption leading-6 text-ink-muted">
                    {t("profile.security.description")}
                </div>
            </div>
            <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5"
            >
                <FormField
                    label={t("profile.security.currentPassword")}
                    htmlFor="security-current-password"
                >
                    <input
                        id="security-current-password"
                        type="password"
                        autoComplete="current-password"
                        required
                        maxLength={256}
                        value={currentPassword}
                        onChange={(event) =>
                            setCurrentPassword(event.target.value)
                        }
                        className={formInputCls}
                    />
                </FormField>
                <FormField
                    label={t("profile.security.newPassword")}
                    htmlFor="security-new-password"
                    hint={t("profile.security.passwordLength")}
                >
                    <input
                        id="security-new-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={6}
                        maxLength={72}
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        className={formInputCls}
                    />
                </FormField>
                <FormField
                    label={t("profile.security.confirmPassword")}
                    htmlFor="security-confirm-password"
                >
                    <input
                        id="security-confirm-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={6}
                        maxLength={72}
                        value={confirmPassword}
                        onChange={(event) =>
                            setConfirmPassword(event.target.value)
                        }
                        className={formInputCls}
                    />
                </FormField>
                <Button type="submit" loading={saving} disabled={saving}>
                    {t("profile.security.submit")}
                </Button>
            </form>
        </section>
    );
};

export default PasswordSettingsPanel;

import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "@shared/ui/primitives/Button";
import { useToast } from "@shared/hooks/useToast";
import { loadLocale } from "@/locales";
import {
    REPLY_LANGUAGES,
    setReplyLanguage,
    useReplyLanguage,
} from "@shared/preferences/agentLanguage";

const LANGUAGE_NAMES = { zh: "简体中文", en: "English" };

export default function LanguagePreferencesPanel() {
    const { t, i18n } = useTranslation();
    const replyLanguage = useReplyLanguage();
    const [changing, setChanging] = useState(false);
    const toast = useToast();
    const locale = (i18n.resolvedLanguage || i18n.language || "zh").split(
        "-",
    )[0];
    const changeLocale = async (value) => {
        if (changing || locale === value) return;
        setChanging(true);
        try {
            await loadLocale(value);
            await i18n.changeLanguage(value);
        } catch {
            toast.error(t("profile.language.loadError"));
        } finally {
            setChanging(false);
        }
    };

    return (
        <section className="space-y-7">
            <div>
                <div className="text-title font-semibold text-ink">
                    {t("profile.language.title")}
                </div>
                <div className="mt-2 text-caption leading-6 text-ink-muted">
                    {t("profile.language.description")}
                </div>
            </div>
            <fieldset className="space-y-3">
                <legend className="text-body font-semibold text-ink">
                    {t("profile.language.interface")}
                </legend>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(LANGUAGE_NAMES).map(([value, label]) => (
                        <Button
                            key={value}
                            type="button"
                            variant="outline"
                            aria-pressed={locale === value}
                            disabled={changing}
                            onClick={() => void changeLocale(value)}
                            className={
                                locale === value
                                    ? "border-border-strong bg-surface-muted text-ink"
                                    : ""
                            }
                        >
                            {label}
                        </Button>
                    ))}
                </div>
            </fieldset>
            <fieldset className="space-y-3">
                <legend className="text-body font-semibold text-ink">
                    {t("profile.language.reply")}
                </legend>
                <div className="flex flex-wrap gap-2">
                    {REPLY_LANGUAGES.map((value) => (
                        <Button
                            key={value}
                            type="button"
                            variant="outline"
                            aria-pressed={replyLanguage === value}
                            onClick={() => setReplyLanguage(value)}
                            className={
                                replyLanguage === value
                                    ? "border-border-strong bg-surface-muted text-ink"
                                    : ""
                            }
                        >
                            {value === "auto"
                                ? t("profile.language.auto")
                                : LANGUAGE_NAMES[value]}
                        </Button>
                    ))}
                </div>
                <div className="text-caption leading-6 text-ink-muted">
                    {t("profile.language.autoHint")}
                </div>
            </fieldset>
            <div className="rounded-xl border border-border bg-surface-muted p-4 text-caption leading-6 text-ink-muted">
                {t("profile.language.historyHint")}
            </div>
        </section>
    );
}

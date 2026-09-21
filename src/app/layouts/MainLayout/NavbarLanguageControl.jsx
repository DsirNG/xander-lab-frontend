import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, Languages } from "lucide-react";
import Button from "@shared/ui/primitives/Button";
import styles from "./Navbar.module.css";

const LANGUAGES = ["zh", "en", "fr", "ja", "ru", "vi"];
const LANG_LABELS = {
    zh: "中文",
    en: "EN",
    fr: "FR",
    ja: "日本語",
    ru: "RU",
    vi: "VI",
};
const LANG_FULL = {
    zh: "简体中文",
    en: "English",
    fr: "Français",
    ja: "日本語",
    ru: "Русский",
    vi: "Tiếng Việt",
};

function LanguageReel({ langReel, size }) {
    return (
        <span
            className={`${styles.langReel} ${styles[`langReel${size}`]}`}
            aria-live="polite"
        >
            <span
                className={`${styles.langReelItem} ${langReel.rolling ? styles.langReelOut : ""}`}
            >
                {langReel.outgoing}
            </span>
            {langReel.rolling && langReel.incoming ? (
                <span className={`${styles.langReelItem} ${styles.langReelIn}`}>
                    {langReel.incoming}
                </span>
            ) : null}
        </span>
    );
}

LanguageReel.propTypes = {
    langReel: PropTypes.shape({
        outgoing: PropTypes.string.isRequired,
        incoming: PropTypes.string,
        rolling: PropTypes.bool.isRequired,
    }).isRequired,
    size: PropTypes.oneOf(["Sm", "Md"]).isRequired,
};

export default function NavbarLanguageControl({ mobile = false }) {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [langReel, setLangReel] = useState(() => ({
        outgoing: LANG_LABELS[i18n.language] || "EN",
        incoming: null,
        rolling: false,
    }));
    const rollTimerRef = useRef(null);
    const dropdownRef = useRef(null);

    const rollLanguageLabel = useCallback((nextLng) => {
        const nextLabel = LANG_LABELS[nextLng] || "EN";
        setLangReel((current) => {
            if (current.rolling && current.incoming === nextLabel) {
                return current;
            }
            return {
                outgoing: current.incoming || current.outgoing,
                incoming: nextLabel,
                rolling: true,
            };
        });
        if (rollTimerRef.current) {
            window.clearTimeout(rollTimerRef.current);
        }
        rollTimerRef.current = window.setTimeout(() => {
            setLangReel({
                outgoing: nextLabel,
                incoming: null,
                rolling: false,
            });
            rollTimerRef.current = null;
        }, 360);
    }, []);

    const changeLanguage = useCallback(
        (lng) => {
            if (lng === i18n.language) {
                setIsOpen(false);
                return;
            }
            setIsOpen(false);
            rollLanguageLabel(lng);
            i18n.changeLanguage(lng);
        },
        [i18n, rollLanguageLabel],
    );

    const toggleLanguageMobile = () => {
        const currentIdx = Math.max(0, LANGUAGES.indexOf(i18n.language));
        const nextLng = LANGUAGES[(currentIdx + 1) % LANGUAGES.length];
        rollLanguageLabel(nextLng);
        i18n.changeLanguage(nextLng);
    };

    useEffect(
        () => () => {
            if (rollTimerRef.current) {
                window.clearTimeout(rollTimerRef.current);
            }
        },
        [],
    );

    useEffect(() => {
        const label = LANG_LABELS[i18n.language] || "EN";
        setLangReel((current) => {
            if (current.rolling || current.outgoing === label) return current;
            return { outgoing: label, incoming: null, rolling: false };
        });
    }, [i18n.language]);

    useEffect(() => {
        if (mobile || !isOpen) return undefined;
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, mobile]);

    if (mobile) {
        return (
            <Button
                onClick={toggleLanguageMobile}
                variant="ghost"
                size="md"
                className={`${styles.mobileActionButton} flex items-center space-x-2`}
            >
                <Languages aria-hidden="true" className="w-4 h-4" />
                <LanguageReel langReel={langReel} size="Md" />
            </Button>
        );
    }

    return (
        <div className="relative hidden items-center sm:flex" ref={dropdownRef}>
            <Button
                onClick={() => setIsOpen((current) => !current)}
                variant="ghost"
                size="sm"
                className={`${styles.iconButton} flex items-center gap-1 px-2 sm:px-3`}
                title="Language"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <Languages aria-hidden="true" className="h-4 w-4" />
                <LanguageReel langReel={langReel} size="Sm" />
                <ChevronDown
                    aria-hidden="true"
                    className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
            </Button>

            <div
                className={`absolute right-0 top-full mt-2 ${styles.langDropdown} ${isOpen ? styles.langDropdownOpen : ""}`}
            >
                <div
                    className="py-1.5"
                    role="listbox"
                    aria-label="Select language"
                >
                    {LANGUAGES.map((lng, index) => {
                        const isActive = i18n.language === lng;
                        return (
                            <Button
                                key={lng}
                                role="option"
                                aria-selected={isActive}
                                onClick={() => changeLanguage(lng)}
                                variant="ghost"
                                size="sm"
                                className={`${styles.langOption} ${isActive ? styles.langOptionActive : ""}`}
                                style={{
                                    animationDelay: isOpen
                                        ? `${index * 40}ms`
                                        : "0ms",
                                }}
                            >
                                <span className="flex items-center gap-2.5">
                                    <span
                                        className={`w-7 text-center text-xs font-bold ${isActive ? "text-accent" : "text-ink-muted"}`}
                                    >
                                        {LANG_LABELS[lng]}
                                    </span>
                                    <span
                                        className={`text-xs ${isActive ? "font-semibold text-accent" : "text-ink-secondary"}`}
                                    >
                                        {LANG_FULL[lng]}
                                    </span>
                                </span>
                                {isActive ? (
                                    <Check className="h-3.5 w-3.5 text-accent" />
                                ) : null}
                            </Button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

NavbarLanguageControl.propTypes = {
    mobile: PropTypes.bool,
};

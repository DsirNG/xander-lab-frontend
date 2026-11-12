import React, { useEffect, useState, memo } from "react";
import { useTranslation } from "react-i18next";
import SyntaxHighlighter from "@shared/ui/data-display/SyntaxHighlighter";
import {
    oneLight,
    vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { Code2, Copy, Check, FileCode2, Play } from "lucide-react";
import Button from "@shared/ui/primitives/Button";

const PREVIEWABLE_LANGUAGES = new Set(["html", "htm", "svg"]);
const LANGUAGE_LABELS = {
    bash: "Bash",
    shell: "Shell",
    sh: "Shell",
    powershell: "PowerShell",
    javascript: "JavaScript",
    js: "JavaScript",
    typescript: "TypeScript",
    ts: "TypeScript",
    jsx: "JSX",
    tsx: "TSX",
    json: "JSON",
    html: "HTML",
    htm: "HTML",
    css: "CSS",
    svg: "SVG",
    yaml: "YAML",
    yml: "YAML",
    sql: "SQL",
    text: "Text",
};

/**
 * Shared code display with syntax highlighting, copy, and optional live preview.
 * Preview is available for html / htm / svg.
 */
const CodeBlock = memo(
    ({
        code,
        children,
        language = "javascript",
        className,
        defaultMode = "code",
        appearance = "default",
        previewComponent: PreviewComponent,
    }) => {
        const { t } = useTranslation();
        const [copied, setCopied] = useState(false);
        const [isDarkTheme, setIsDarkTheme] = useState(
            () =>
                typeof document !== "undefined" &&
                document.documentElement.dataset.theme === "dark",
        );
        const [mode, setMode] = useState(
            defaultMode === "preview" ? "preview" : "code",
        );

        useEffect(() => {
            const root = document.documentElement;
            const syncTheme = () =>
                setIsDarkTheme(root.dataset.theme === "dark");
            const observer = new MutationObserver(syncTheme);

            syncTheme();
            observer.observe(root, {
                attributes: true,
                attributeFilter: ["data-theme"],
            });

            return () => observer.disconnect();
        }, []);

        const resolvedCode =
            code != null ? code : String(children ?? "").replace(/\n$/, "");
        const normalizedLanguage = String(language || "text").toLowerCase();
        const canPreview =
            Boolean(PreviewComponent) &&
            PREVIEWABLE_LANGUAGES.has(normalizedLanguage);
        const activeMode = canPreview ? mode : "code";
        const languageLabel =
            LANGUAGE_LABELS[normalizedLanguage] ??
            normalizedLanguage.charAt(0).toUpperCase() +
                normalizedLanguage.slice(1);
        const isConversation = appearance === "conversation";

        const handleCopy = async () => {
            if (!resolvedCode) return;
            try {
                await navigator.clipboard.writeText(resolvedCode);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
            } catch {
                // clipboard may be unavailable
            }
        };

        return (
            <div
                className={`overflow-hidden ${
                    isConversation
                        ? "rounded-panel text-ink shadow-none"
                        : "rounded-card border border-border bg-canvas"
                } ${className || ""}`}
                style={
                    isConversation
                        ? {
                              backgroundColor:
                                  "var(--color-code-block-conversation)",
                          }
                        : undefined
                }
            >
                <div
                    className={`flex items-center justify-between gap-3 ${
                        isConversation
                            ? "px-4 pb-1 pt-3 sm:px-6 sm:pt-4"
                            : "border-b border-border bg-surface px-3 py-2"
                    }`}
                >
                    <div
                        className={`flex min-w-0 items-center gap-2 ${
                            isConversation ? "text-inherit" : "text-ink-secondary"
                        }`}
                    >
                        <FileCode2
                            className={`h-4 w-4 shrink-0 ${
                                isConversation ? "opacity-80" : "text-ink-faint"
                            }`}
                            aria-hidden="true"
                        />
                        <span
                            className={`truncate ${
                                isConversation
                                    ? "text-body font-semibold"
                                    : "text-caption font-bold tracking-wide"
                            }`}
                        >
                            {languageLabel}
                        </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                        <Button
                            onClick={() => setMode("code")}
                            variant="ghost"
                            size={isConversation ? "md" : "xs"}
                            icon={Code2}
                            title={t("common.codeBlock.showCode")}
                            aria-label={t("common.codeBlock.showCode")}
                            aria-pressed={activeMode === "code"}
                            className={
                                isConversation
                                    ? "text-inherit hover:bg-surface-muted hover:text-inherit"
                                    : activeMode === "code"
                                      ? "bg-surface-muted text-ink hover:bg-surface-muted hover:text-ink"
                                      : ""
                            }
                        />

                        {canPreview ? (
                            <Button
                                onClick={() => setMode("preview")}
                                variant="ghost"
                                size={isConversation ? "md" : "xs"}
                                icon={Play}
                                title={t("common.codeBlock.showPreview")}
                                aria-label={t("common.codeBlock.showPreview")}
                                aria-pressed={activeMode === "preview"}
                                className={
                                    isConversation
                                        ? "text-inherit hover:bg-surface-muted hover:text-inherit"
                                        : activeMode === "preview"
                                          ? "bg-surface-muted text-ink hover:bg-surface-muted hover:text-ink"
                                          : ""
                                }
                            />
                        ) : null}

                        <Button
                            onClick={handleCopy}
                            variant="ghost"
                            size={isConversation ? "md" : "xs"}
                            icon={copied ? Check : Copy}
                            title={
                                copied
                                    ? t("common.codeBlock.copied")
                                    : t("common.codeBlock.copy")
                            }
                            aria-label={
                                copied
                                    ? t("common.codeBlock.copied")
                                    : t("common.codeBlock.copy")
                            }
                            className={
                                isConversation
                                    ? copied
                                        ? "text-success"
                                        : "text-inherit hover:bg-surface-muted hover:text-inherit"
                                    : copied
                                      ? "text-success"
                                      : ""
                            }
                        />
                    </div>
                </div>

                {activeMode === "preview" && PreviewComponent ? (
                    <div className="bg-canvas">
                        <PreviewComponent
                            code={resolvedCode}
                            language={normalizedLanguage}
                            minHeight={isConversation ? 480 : 280}
                            maxHeight={isConversation ? 480 : 600}
                            title={t("common.codeBlock.previewFrame", {
                                language: languageLabel,
                            })}
                        />
                    </div>
                ) : (
                    <div
                        className={`overflow-auto ${
                            isConversation
                                ? "max-h-[70dvh] bg-transparent"
                                : "max-h-[600px] bg-[#1e1e1e]"
                        }`}
                    >
                        <SyntaxHighlighter
                            language={
                                normalizedLanguage === "htm"
                                    ? "html"
                                    : normalizedLanguage
                            }
                            style={
                                isConversation && !isDarkTheme
                                    ? oneLight
                                    : vscDarkPlus
                            }
                            customStyle={{
                                margin: 0,
                                padding: isConversation
                                    ? "0.5rem 1.5rem 1rem"
                                    : "1rem 1.5rem",
                                fontSize: "0.875rem",
                                background: "transparent",
                                lineHeight: "1.6",
                            }}
                            showLineNumbers={!isConversation}
                        >
                            {resolvedCode}
                        </SyntaxHighlighter>
                    </div>
                )}
            </div>
        );
    },
);

CodeBlock.displayName = "CodeBlock";

export default CodeBlock;

import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import SyntaxHighlighter from "@shared/ui/data-display/SyntaxHighlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
    Code,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    RotateCcw,
} from "lucide-react";
import BrowserWindow from "@shared/ui/preview/BrowserWindow";
import Button from "@shared/ui/primitives/Button";

/**
 * 增强演示区域组件
 * 包含代码展示、重置、复制等功能
 * 用于功能模块等复杂场景展示
 */
const EnhancedDemoSection = ({
    title,
    desc,
    children,
    code,
    useBrowserWindow = true,
}) => {
    const { t } = useTranslation();
    const [showCode, setShowCode] = useState(false);
    const [copied, setCopied] = useState(false);
    const [resetKey, setResetKey] = useState(0);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleReset = () => {
        setResetKey((prev) => prev + 1);
    };

    return (
        <div className="mb-8">
            {/* 标题和操作按钮 */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex items-center space-x-3 min-w-0">
                    <div className="h-6 w-1 bg-accent rounded-full flex-shrink-0" />
                    <div className="text-heading text-ink break-words">
                        {title}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {/* 重置按钮 */}
                    <Button
                        onClick={handleReset}
                        variant="outline"
                        size="md"
                        icon={RotateCcw}
                        title={t("common.resetDemo")}
                    >
                        {t("common.reset")}
                    </Button>
                    {/* 查看代码按钮 */}
                    {code && (
                        <Button
                            onClick={() => setShowCode(!showCode)}
                            variant="outline"
                            size="md"
                            icon={showCode ? ChevronUp : Code}
                        >
                            {showCode
                                ? t("common.codeBlock.hideCode")
                                : t("common.codeBlock.viewCode")}
                        </Button>
                    )}
                </div>
            </div>

            {/* 描述 */}
            <div className="text-ink-muted text-body mb-6 max-w-2xl">{desc}</div>

            {/* 演示区域 */}
            {useBrowserWindow ? (
                <BrowserWindow>
                    <div className="bg-surface p-4 sm:p-6 lg:p-8 min-h-[300px] flex items-center justify-center relative overflow-hidden transition-all">
                        <div
                            className="absolute inset-0 opacity-[0.03] pointer-events-none"
                            style={{
                                backgroundImage:
                                    "radial-gradient(var(--color-ink) 1px, transparent 1px)",
                                backgroundSize: "24px 24px",
                            }}
                        />
                        <div key={resetKey} className="w-full relative z-10">
                            {children}
                        </div>
                    </div>
                </BrowserWindow>
            ) : (
                <div key={resetKey}>{children}</div>
            )}

            {/* 代码展示区域 */}
            <AnimatePresence>
                {showCode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-4 w-full"
                    >
                        <div className="relative group rounded-card overflow-hidden border border-border w-full">
                            {/* 复制按钮 */}
                            <Button
                                onClick={handleCopy}
                                variant="ghost"
                                size="sm"
                                icon={copied ? Check : Copy}
                                title={t("common.codeBlock.copy")}
                                aria-label={t("common.codeBlock.copy")}
                                className="absolute right-4 top-4 z-20 rounded-control border border-border bg-canvas text-ink-muted hover:text-ink hover:bg-surface-muted"
                            />

                            <div className="max-h-[500px] overflow-auto custom-scrollbar w-full">
                                <SyntaxHighlighter
                                    language="javascript"
                                    style={vscDarkPlus}
                                    customStyle={{
                                        margin: 0,
                                        padding: "1.5rem",
                                        fontSize: "0.85rem",
                                        background: vscDarkPlus['pre[class*="language-"]'].background,
                                        lineHeight: "1.6",
                                        width: "100%",
                                        maxWidth: "100%",
                                    }}
                                >
                                    {code}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

EnhancedDemoSection.propTypes = {
    title: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    children: PropTypes.node,
    code: PropTypes.string,
    useBrowserWindow: PropTypes.bool,
};

EnhancedDemoSection.SyntaxHighlighter = SyntaxHighlighter;
EnhancedDemoSection.vscDarkPlus = vscDarkPlus;

export default EnhancedDemoSection;

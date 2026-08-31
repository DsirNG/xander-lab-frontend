import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import SyntaxHighlighter from "@components/common/SyntaxHighlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
    Code,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    RotateCcw,
} from "lucide-react";
import BrowserWindow from "@components/common/BrowserWindow";
import Button from "@components/common/Button";

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
        <div className="mb-12">
            {/* 标题和操作按钮 */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div className="flex items-center space-x-3 min-w-0">
                    <div className="h-6 w-1 bg-blue-600 rounded-full flex-shrink-0" />
                    <div className="text-lg font-bold text-slate-900 break-words">
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
            <div className="text-slate-500  text-sm mb-6 max-w-2xl">{desc}</div>

            {/* 演示区域 */}
            {useBrowserWindow ? (
                <BrowserWindow>
                    <div className="bg-slate-50 /50 p-4 sm:p-8 lg:p-10 min-h-[300px] flex items-center justify-center relative overflow-hidden transition-all">
                        <div
                            className="absolute inset-0 opacity-[0.03] pointer-events-none"
                            style={{
                                backgroundImage:
                                    "radial-gradient(#000 1px, transparent 1px)",
                                backgroundSize: "20px 20px",
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
                        <div className="relative group rounded-[2rem] overflow-hidden border border-slate-200  shadow-2xl w-full">
                            {/* 复制按钮 */}
                            <Button
                                onClick={handleCopy}
                                variant="ghost"
                                size="sm"
                                icon={copied ? Check : Copy}
                                title={t("common.codeBlock.copy")}
                                aria-label={t("common.codeBlock.copy")}
                                className="absolute right-4 sm:right-6 top-4 sm:top-6 z-20 bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 backdrop-blur-md border border-white/5 sm:opacity-0 sm:group-hover:opacity-100 shadow-xl"
                            />

                            <div className="max-h-[500px] overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent w-full">
                                <SyntaxHighlighter
                                    language="javascript"
                                    style={vscDarkPlus}
                                    customStyle={{
                                        margin: 0,
                                        padding: "1.5rem",
                                        fontSize: "0.85rem",
                                        background: "#0f172a",
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

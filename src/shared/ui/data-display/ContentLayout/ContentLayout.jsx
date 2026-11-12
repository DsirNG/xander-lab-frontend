import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, MousePointer2 } from "lucide-react";
import PropTypes from "prop-types";

const THEME_TEXT = {
    accent: "text-accent",
    "blue-600": "text-accent",
    "emerald-600": "text-accent",
};

/**
 * 通用内容布局组件
 * 用于基础设施、功能模块、组件库等展示页面
 */
const ContentLayout = ({
    item,
    basePath = "",
    detailButtonText,
    detailButtonIcon: DetailButtonIcon,
    extraHeaderButtons,
    themeColor = "accent",
    children,
}) => {
    const { t } = useTranslation();

    if (!item) return null;

    return (
        <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
        >
            {/* 头部：标题、描述、操作按钮 */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8 gap-4 sm:gap-6">
                <div className="max-w-2xl flex-1 min-w-0">
                    <div className="text-display text-ink mb-3 break-words">
                        {item.title}
                    </div>
                    <div className="text-body text-ink-muted break-words">
                        {item.desc || item.description}
                    </div>
                </div>

                {/* 右侧按钮区域 */}
                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                    {/* 额外的按钮（可选） */}
                    {extraHeaderButtons}

                    {/* 查看详情按钮 */}
                    {item.detailPages && item.detailPages.length > 0 && (
                        <Link
                            to={`${basePath}/${item.id}/${item.detailPages[0].type}`}
                            className="inline-flex min-h-10 items-center gap-2 bg-accent text-canvas px-4 py-2 rounded-control font-semibold text-body hover:bg-accent/90 transition-colors focus:outline-none whitespace-nowrap"
                        >
                            {DetailButtonIcon && (
                                <DetailButtonIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            )}
                            <span className="hidden sm:inline">
                                {detailButtonText || t("common.viewDetails")}
                            </span>
                            <span className="sm:hidden">
                                {t("common.viewDetails")}
                            </span>
                        </Link>
                    )}
                </div>
            </div>

            {/* 场景演示分隔线 */}
            <div className="space-y-4 mb-8">
                <div
                    className={`text-caption font-semibold uppercase tracking-[0.2em] ${THEME_TEXT[themeColor] || "text-accent"} flex items-center`}
                >
                    <MousePointer2 className="w-3 h-3 mr-2" />
                    {t("common.liveScenarios")}
                </div>
                <div className="h-px bg-border w-full" />
            </div>

            {/* 场景演示区域 */}
            <div className="grid min-w-0 grid-cols-1">
                {React.Children.count(children) > 0 ? (
                    children
                ) : (
                    <div className="min-h-[400px] flex flex-col items-center justify-center text-ink-faint">
                        <Zap className="w-12 h-12 mb-4 opacity-20" />
                        <div>{t("common.comingSoon")}</div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

ContentLayout.propTypes = {
    // 当前展示的项目（模块、组件、系统等）
    item: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        desc: PropTypes.string,
        description: PropTypes.string,
        detailPages: PropTypes.array,
    }).isRequired,
    // 基础路径（用于详情链接）
    basePath: PropTypes.string,
    // 详情按钮文本
    detailButtonText: PropTypes.string,
    // 详情按钮图标组件
    detailButtonIcon: PropTypes.elementType,
    // 额外的头部按钮
    extraHeaderButtons: PropTypes.node,
    // 主题色
    themeColor: PropTypes.string,
    // 自定义子内容（场景演示由消费方作为 children 传入）
    children: PropTypes.node,
};

export default ContentLayout;

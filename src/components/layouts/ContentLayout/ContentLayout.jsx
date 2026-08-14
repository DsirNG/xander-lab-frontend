import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, MousePointer2 } from 'lucide-react';
import PropTypes from 'prop-types';

const THEME_TEXT = {
    accent: 'text-accent',
    'blue-600': 'text-blue-600',
    'emerald-600': 'text-emerald-600',
};

/**
 * 通用内容布局组件
 * 用于基础设施、功能模块、组件库等展示页面
 */
const ContentLayout = ({
    item,
    basePath = '',
    detailButtonText,
    detailButtonIcon: DetailButtonIcon,
    extraHeaderButtons,
    themeColor = 'accent',
    children
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
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8 sm:mb-12 gap-4 sm:gap-0">
                <div className="max-w-2xl flex-1">
                    <div className="text-display sm:text-3xl lg:text-4xl font-black text-ink mb-3 sm:mb-4">
                        {item.title}
                    </div>
                    <div className="text-body sm:text-lg text-ink-muted">
                        {item.desc || item.description}
                    </div>
                </div>

                {/* 右侧按钮区域 */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                    {/* 额外的按钮（可选） */}
                    {extraHeaderButtons}

                    {/* 查看详情按钮 */}
                    {item.detailPages && item.detailPages.length > 0 && (
                        <Link
                            to={`${basePath}/${item.id}/${item.detailPages[0].type}`}
                            className="flex items-center space-x-2 bg-ink text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-caption sm:text-body hover:scale-105 transition-transform shadow-xl whitespace-nowrap"
                        >
                            {DetailButtonIcon && <DetailButtonIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                            <span className="hidden sm:inline">{detailButtonText || t('common.viewDetails')}</span>
                            <span className="sm:hidden">{t('common.viewDetails')}</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* 场景演示分隔线 */}
            <div className="space-y-4 mb-10">
                <div className={`text-caption font-black uppercase tracking-[0.2em] ${THEME_TEXT[themeColor] || 'text-accent'} flex items-center`}>
                    <MousePointer2 className="w-3 h-3 mr-2" />
                    {t('common.liveScenarios')}
                </div>
                <div className="h-px bg-border w-full" />
            </div>

            {/* 场景演示区域 */}
            <div className="grid grid-cols-1">
                {React.Children.count(children) > 0 ? children : (
                    <div className="min-h-[400px] flex flex-col items-center justify-center text-ink-faint">
                        <Zap className="w-12 h-12 mb-4 opacity-20" />
                        <div>{t('common.comingSoon')}</div>
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
        detailPages: PropTypes.array
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
    children: PropTypes.node
};

export default ContentLayout;

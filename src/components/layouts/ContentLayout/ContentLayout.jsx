import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, MousePointer2 } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * 通用内容布局组件
 * 用于基础设施、功能模块、组件库等展示页面
 */
const ContentLayout = ({
    item,
    scenarios,
    renderDemoSection,
    basePath = '',
    detailButtonText,
    detailButtonIcon: DetailButtonIcon,
    extraHeaderButtons,
    themeColor = 'primary',
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
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-3 sm:mb-4">
                        {item.title}
                    </h2>
                    <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400">
                        {item.desc || item.description}
                    </p>
                </div>

                {/* 右侧按钮区域 */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                    {/* 额外的按钮（可选） */}
                    {extraHeaderButtons}

                    {/* 查看详情按钮 */}
                    {item.detailPages && item.detailPages.length > 0 && (
                        <Link
                            to={`${basePath}/${item.id}/${item.detailPages[0].type}`}
                            className="flex items-center space-x-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm hover:scale-105 transition-transform shadow-xl whitespace-nowrap"
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
                <h4 className={`text-xs font-black uppercase tracking-[0.2em] text-${themeColor} flex items-center`}>
                    <MousePointer2 className="w-3 h-3 mr-2" />
                    {t('common.liveScenarios')}
                </h4>
                <div className="h-px bg-slate-100 dark:bg-slate-800 w-full" />
            </div>

            {/* 场景演示区域 */}
            <div className="grid grid-cols-1">
                {scenarios && scenarios.length > 0 ? (
                    scenarios.map((scenario, index) => (
                        <React.Fragment key={index}>
                            {renderDemoSection(scenario, index)}
                        </React.Fragment>
                    ))
                ) : (
                    <div className="min-h-[400px] flex flex-col items-center justify-center text-slate-400">
                        <Zap className="w-12 h-12 mb-4 opacity-20" />
                        <p>{t('common.comingSoon')}</p>
                    </div>
                )}
            </div>

            {/* 自定义内容区域 */}
            {children}
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
    // 场景列表
    scenarios: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string,
        desc: PropTypes.string,
        demo: PropTypes.node,
        code: PropTypes.string
    })),
    // 渲染单个演示区域的函数
    renderDemoSection: PropTypes.func.isRequired,
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
    // 自定义子内容
    children: PropTypes.node
};

export default ContentLayout;



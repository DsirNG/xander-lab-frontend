// React 相关
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

// Layout
import SidebarLayout from '@components/layouts/SidebarLayout'

// 配置
import { getModuleConfig } from '../constants'

const ModuleList = () => {
    const { t } = useTranslation()
    const location = useLocation()

    // 使用共享配置，只显示已启用的模块
    const modules = useMemo(() => {
        const allModules = getModuleConfig(t)
        // 过滤出需要显示在侧边栏的模块
        return allModules.filter(m => ['popover', 'drag-drop'].includes(m.id))
    }, [t])

    const activeId = location.pathname.split('/')[2] || 'popover'

    // 定义底部卡片
    const bottomCard = (
        <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 p-4 rounded-2xl border border-blue-600/10">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Patterns</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Reusable UI patterns built on top of robust infrastructure.</p>
        </div>
    )

    return (
        <SidebarLayout
            title={t('common.exploreModules')}
            description={t('common.selectModuleToExplore')}
            items={modules}
            activeId={activeId}
            bottomCard={bottomCard}
            subtitleKey="id"
        />
    )
}

export default ModuleList


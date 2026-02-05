// React 相关
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

// Layout
import SidebarLayout from '@components/layouts/SidebarLayout'

// 配置
import { getInfraConfig } from '../constants'

const InfraList = () => {
    const { t } = useTranslation()
    const location = useLocation()

    // 使用共享配置
    const systems = useMemo(() => getInfraConfig(t), [t])

    const activeId = location.pathname.split('/')[2] || 'anchored'

    // 定义底部卡片
    const bottomCard = (
        <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 p-4 rounded-2xl border border-primary/10">
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Architecture</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Stable, headless, and accessible infrastructure for high-performance React apps.</p>
        </div>
    )

    return (
        <SidebarLayout
            title={t('common.exploreInfra')}
            description={t('common.selectModule')}
            items={systems}
            activeId={activeId}
            bottomCard={bottomCard}
            subtitleKey="tag"
        />
    )
}

export default InfraList


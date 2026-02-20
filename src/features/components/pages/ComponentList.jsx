// React 相关
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

// Layout
import SidebarLayout from '@components/layouts/SidebarLayout';

// Services & Registries
import ComponentService from '../services/componentService';
import { ICON_REGISTRY } from '../registries/iconRegistry';

const ComponentList = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMenu = async () => {
            setLoading(true);
            try {
                const res = await ComponentService.getMenu(i18n.language);
                // 扁平化分类结构以适应当前的 SidebarLayout
                const flatItems = [];
                res.forEach(cat => {
                    if (cat.components) {
                        cat.components.forEach(comp => {
                            flatItems.push({
                                ...comp,
                                icon: ICON_REGISTRY[comp.iconKey] || ICON_REGISTRY['default'],
                                // SidebarLayout 使用 to={item.path || item.id}
                                // 我们确保 'id' 是正确的 (例如 'toast')
                            });
                        });
                    }
                });
                setItems(flatItems);
            } catch (error) {
                console.error("加载组件菜单失败", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
    }, [i18n.language]);

    // 如果在 /components 根路径，自动重定向到第一个组件
    useEffect(() => {
        if (!loading && items.length > 0 && location.pathname === '/components') {
            navigate(String(items[0].id), { replace: true });
        }
    }, [loading, items, location.pathname, navigate]);

    const activeId = location.pathname.split('/')[2];

    const bottomCard = (
        <div className="space-y-3">
            <div className="bg-gradient-to-br from-emerald-600/10 to-teal-600/10 p-4 rounded-2xl border border-emerald-600/10">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">UI Kit</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">用于构建一致界面的原子组件。</p>
            </div>

            <button
                onClick={() => navigate('share')}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 transition-all"
            >
                <Plus className="w-3.5 h-3.5" />
                分享我的组件
            </button>
        </div>
    );

    return (
        <SidebarLayout
            title={t('nav.components', 'Components')}
            description={t('components.desc', 'Explore our atomic component library.')}
            items={items}
            activeId={activeId}
            bottomCard={bottomCard}
            subtitleKey="tag"
        />
    );
};

export default ComponentList;

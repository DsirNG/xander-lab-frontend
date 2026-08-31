// React 相关
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

// Layout
import SidebarLayout from "@components/layouts/SidebarLayout";

// Services & Registries
import ComponentService from "../services/componentService";
import { ICON_REGISTRY } from "../registries/iconRegistry";

const ComponentList = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        const fetchMenu = async () => {
            setLoading(true);
            try {
                const res = await ComponentService.getMenu(i18n.language, {
                    signal: controller.signal,
                });
                // 扁平化分类结构以适应当前的 SidebarLayout
                const flatItems = [];
                res.forEach((cat) => {
                    if (cat.components) {
                        cat.components.forEach((comp) => {
                            flatItems.push({
                                ...comp,
                                icon:
                                    ICON_REGISTRY[comp.iconKey] ||
                                    ICON_REGISTRY["default"],
                                // SidebarLayout 使用 to={item.path || item.id}
                                // 我们确保 'id' 是正确的 (例如 'toast')
                            });
                        });
                    }
                });
                setItems(flatItems);
            } catch (error) {
                if (
                    error.name === "CanceledError" ||
                    error.code === "ERR_CANCELED"
                )
                    return;
                console.error("加载组件菜单失败", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMenu();
        return () => controller.abort();
    }, [i18n.language]);

    // 如果在 /components 根路径，自动重定向到第一个组件
    useEffect(() => {
        if (
            !loading &&
            items.length > 0 &&
            location.pathname === "/components"
        ) {
            navigate(String(items[0].id), { replace: true });
        }
    }, [loading, items, location.pathname, navigate]);

    const activeId = location.pathname.split("/")[2];

    const bottomCard = (
        <div className="space-y-3">
            <div className="bg-gradient-to-br from-success/10 to-success/10 p-4 rounded-2xl border border-success/10">
                <div className="text-micro font-bold text-success uppercase tracking-widest mb-1">
                    UI Kit
                </div>
                <div className="text-caption text-ink-muted ">
                    {t(
                        "components.list.atomDesc",
                        "Atomic components for building consistent interfaces.",
                    )}
                </div>
            </div>

            <button
                onClick={() => navigate("share")}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-accent text-white text-caption font-black shadow-lg shadow-accent/20 hover:bg-accent-400 hover:scale-[1.02] active:scale-95 transition-all"
            >
                <Plus className="w-3.5 h-3.5" />
                {t("components.list.shareMyComponents", "Share My Components")}
            </button>
        </div>
    );

    return (
        <SidebarLayout
            title={t("nav.components", "Components")}
            description={t(
                "components.desc",
                "Explore our atomic component library.",
            )}
            items={items}
            activeId={activeId}
            bottomCard={bottomCard}
            subtitleKey="tag"
        />
    );
};

export default ComponentList;

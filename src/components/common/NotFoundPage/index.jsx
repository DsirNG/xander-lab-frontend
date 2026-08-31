import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useBack from "@/hooks/useBack";
import Button from "@components/common/Button";

/**
 * 404 页面
 * 当用户访问不存在的路由时展示
 */
const NotFoundPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const handleGoBack = useBack("/");

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 px-ultra-tight">
            <div className="text-center max-w-md">
                <div className="text-8xl font-black text-accent/10 mb-4 select-none">
                    404
                </div>
                <div className="text-2xl font-bold text-ink mb-3">
                    {t("common.pageNotFound", "页面未找到")}
                </div>
                <div className="text-body text-ink-muted mb-8">
                    {t(
                        "common.pageNotFoundDesc",
                        "你访问的页面不存在或已被移动。",
                    )}
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                    <Button onClick={() => navigate("/")} size="lg">
                        {t("common.backHome", "返回首页")}
                    </Button>
                    <Button onClick={handleGoBack} variant="outline" size="lg">
                        {t("common.goBack", "返回上页")}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;

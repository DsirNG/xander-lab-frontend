import React from "react";
import { useTranslation } from "react-i18next";

const ArticleOverviewCard = () => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col shrink-0 rounded-[20px] bg-white p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
                {/* 全部文章 */}
                <div className="flex flex-col">
                    <div className="text-sm font-medium text-ink mb-1">
                        {t("blogManage.stats.all", "全部文章")}
                    </div>
                    <div className="text-[32px] font-bold text-blue-600 leading-none mb-1">
                        128
                    </div>
                    <div className="text-xs text-ink-faint">
                        {t("blogManage.stats.comparedToLastMonth", "较上月")}{" "}
                        <span className="text-blue-500 font-medium">
                            +12.5%
                        </span>
                    </div>
                </div>

                {/* 草稿 */}
                <div className="flex flex-col">
                    <div className="text-sm font-medium text-ink mb-1">
                        {t("blogManage.stats.drafts", "草稿")}
                    </div>
                    <div className="text-[32px] font-bold text-indigo-500 leading-none mb-1">
                        32
                    </div>
                    <div className="text-xs text-ink-faint">
                        {t("blogManage.stats.comparedToLastMonth", "较上月")}{" "}
                        <span className="text-indigo-500 font-medium">+6</span>
                    </div>
                </div>
            </div>

            <div className="h-px bg-border my-5"></div>

            <div className="grid grid-cols-2 gap-4">
                {/* 已发布 */}
                <div className="flex flex-col">
                    <div className="text-sm font-medium text-ink mb-1">
                        {t("blogManage.stats.published", "已发布")}
                    </div>
                    <div className="text-[32px] font-bold text-green-500 leading-none mb-1">
                        68
                    </div>
                    <div className="text-xs text-ink-faint">
                        {t("blogManage.stats.comparedToLastMonth", "较上月")}{" "}
                        <span className="text-green-500 font-medium">
                            +15.3%
                        </span>
                    </div>
                </div>

                {/* 待发布/审核中 */}
                <div className="flex flex-col">
                    <div
                        className="text-sm font-medium text-ink mb-1 min-w-0 truncate"
                        title={t("blogManage.stats.pending", "待发布/审核中")}
                    >
                        {t("blogManage.stats.pending", "待发布/审核中")}
                    </div>
                    <div className="text-[32px] font-bold text-ink leading-none mb-1">
                        28
                    </div>
                    <div className="text-xs text-ink-faint">
                        {t("blogManage.stats.comparedToLastMonth", "较上月")}{" "}
                        <span className="text-red-500 font-medium">-3</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleOverviewCard;

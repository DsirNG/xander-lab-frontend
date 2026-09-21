import { useCallback, useEffect, useState } from "react";
import { blogPlanService } from "../services/blogPlanService";

const useBlogPlans = ({ t, toast }) => {
    const [plans, setPlans] = useState([]);
    const [summaryPlans, setSummaryPlans] = useState([]);
    const [publishRhythm, setPublishRhythm] = useState(null);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const loadPlans = useCallback(async () => {
        try {
            setLoading(true);
            const [data, summary, rhythm] = await Promise.all([
                blogPlanService.listPlans({ page, size: pageSize }),
                blogPlanService.listPlans(
                    { page: 1, size: 50 },
                    { _silent: true },
                ),
                blogPlanService
                    .getPublishRhythm({ _silent: true })
                    .catch((error) => {
                        console.error("loadPublishRhythm error:", error);
                        return null;
                    }),
            ]);
            setPlans(data?.records || []);
            setSummaryPlans(summary?.records || []);
            setPublishRhythm(rhythm || null);
            setTotal(Number(data?.total) || 0);
            setLoading(false);
        } catch (error) {
            if (error?.isCancelled) return;
            console.error("loadPlans error:", error);
            toast.error(t("blogPlans.loadFailed"));
            setLoading(false);
        }
    }, [page, pageSize, t, toast]);

    useEffect(() => {
        loadPlans();
    }, [loadPlans]);

    return {
        plans,
        summaryPlans,
        publishRhythm,
        total,
        loading,
        page,
        pageSize,
        setPage,
        setPageSize,
        loadPlans,
    };
};

export default useBlogPlans;

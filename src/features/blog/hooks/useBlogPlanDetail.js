import { useCallback, useEffect, useState } from "react";
import { blogPlanService } from "../services/blogPlanService";

export const BLOG_PLAN_RUN_PAGE_SIZE = 10;

const useBlogPlanDetail = ({ id, t, toast }) => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [runs, setRuns] = useState([]);
    const [runsTotal, setRunsTotal] = useState(0);
    const [runsPage, setRunsPage] = useState(1);
    const [runsLoading, setRunsLoading] = useState(true);

    const loadPlan = useCallback(async () => {
        setLoading(true);
        setNotFound(false);
        try {
            const data = await blogPlanService.getPlan(id);
            setPlan(data);
            setLoading(false);
        } catch (error) {
            if (error?.isCancelled) return;
            setNotFound(true);
            setLoading(false);
        }
    }, [id]);

    const loadRuns = useCallback(
        async (page) => {
            setRunsLoading(true);
            try {
                const data = await blogPlanService.listRuns(id, {
                    page,
                    size: BLOG_PLAN_RUN_PAGE_SIZE,
                });
                setRuns(data?.records || []);
                setRunsTotal(Number(data?.total) || 0);
                setRunsLoading(false);
            } catch (error) {
                if (error?.isCancelled) return;
                toast.error(t("blogPlans.loadFailed"));
                setRunsLoading(false);
            }
        },
        [id, t, toast],
    );

    useEffect(() => {
        loadPlan();
    }, [loadPlan]);

    useEffect(() => {
        setRunsPage(1);
    }, [plan?.id]);

    useEffect(() => {
        if (plan) loadRuns(runsPage);
    }, [loadRuns, plan, runsPage]);

    return {
        plan,
        loading,
        notFound,
        runs,
        runsTotal,
        runsPage,
        runsLoading,
        setRunsPage,
        loadPlan,
        loadRuns,
        runPageSize: BLOG_PLAN_RUN_PAGE_SIZE,
    };
};

export default useBlogPlanDetail;

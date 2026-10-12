import { useCallback, useEffect, useRef, useState } from "react";
import { blogPlanService } from "../services/blogPlanService";

const useBlogPlans = () => {
    const [plans, setPlans] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const requestRef = useRef(null);
    const sequenceRef = useRef(0);
    const loadPlans = useCallback(async () => {
        requestRef.current?.abort();
        const controller = new AbortController();
        requestRef.current = controller;
        const sequence = ++sequenceRef.current;
        setLoading(true);
        setLoadError(false);
        try {
            const data = await blogPlanService.listPlans(
                { page, size: pageSize },
                { signal: controller.signal },
            );
            if (controller.signal.aborted || sequence !== sequenceRef.current)
                return;
            setPlans(data?.records || []);
            setTotal(Number(data?.total) || 0);
        } catch {
            if (controller.signal.aborted || sequence !== sequenceRef.current)
                return;
            setPlans([]);
            setTotal(0);
            setLoadError(true);
        } finally {
            if (!controller.signal.aborted && sequence === sequenceRef.current)
                setLoading(false);
        }
    }, [page, pageSize]);
    useEffect(() => {
        loadPlans();
        return () => requestRef.current?.abort();
    }, [loadPlans]);
    return {
        plans,
        total,
        loading,
        loadError,
        page,
        pageSize,
        setPage,
        setPageSize,
        loadPlans,
    };
};

export default useBlogPlans;

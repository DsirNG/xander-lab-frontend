import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { get } from "@api";

const PAGE_SIZE = 24;

const AgentImagesPage = () => {
    const { t } = useTranslation();
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [reloadToken, setReloadToken] = useState(0);
    const scrollRootRef = useRef(null);
    const sentinelRef = useRef(null);
    const requestRef = useRef(0);
    const nextPageRef = useRef(1);
    const loadingMoreRef = useRef(false);

    useEffect(() => {
        const requestId = ++requestRef.current;
        const controller = new AbortController();
        nextPageRef.current = 1;
        setLoading(true);
        setLoadError(null);

        get(
            "/api/blog/media/images/agent",
            { page: 1, size: PAGE_SIZE },
            { _silent: true, signal: controller.signal },
        )
            .then((data) => {
                if (requestId !== requestRef.current) return;
                setImages(Array.isArray(data?.records) ? data.records : []);
                setHasMore(Boolean(data?.hasMore));
            })
            .catch((error) => {
                if (
                    requestId !== requestRef.current ||
                    error?.code === "ERR_CANCELED"
                ) {
                    return;
                }
                setLoadError(error.message || t("blog.agentImages.loadFailed"));
            })
            .finally(() => {
                if (requestId === requestRef.current) setLoading(false);
            });

        return () => controller.abort();
    }, [t, reloadToken]);

    const handleLoadMore = useCallback(async () => {
        if (loadingMoreRef.current || !hasMore) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        setLoadError(null);
        const requestId = ++requestRef.current;
        const page = nextPageRef.current + 1;

        try {
            const data = await get(
                "/api/blog/media/images/agent",
                { page, size: PAGE_SIZE },
                { _silent: true },
            );
            if (requestId !== requestRef.current) return;
            const records = Array.isArray(data?.records) ? data.records : [];
            setImages((current) => [...current, ...records]);
            nextPageRef.current = page;
            setHasMore(Boolean(data?.hasMore));
        } catch (error) {
            if (
                requestId === requestRef.current &&
                error?.code !== "ERR_CANCELED"
            ) {
                setLoadError(error.message || t("blog.agentImages.loadFailed"));
            }
        } finally {
            loadingMoreRef.current = false;
            if (requestId === requestRef.current) setLoadingMore(false);
        }
    }, [hasMore, t]);

    useEffect(() => {
        const root = scrollRootRef.current;
        const sentinel = sentinelRef.current;
        if (
            !root ||
            !sentinel ||
            !hasMore ||
            loading ||
            loadingMore ||
            loadError ||
            typeof IntersectionObserver === "undefined"
        ) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    handleLoadMore();
                }
            },
            { root, rootMargin: "240px 0px" },
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [handleLoadMore, hasMore, loadError, loading, loadingMore]);

    const handleReload = () => setReloadToken((value) => value + 1);

    return (
        <div
            ref={scrollRootRef}
            className="h-full w-full overflow-y-auto bg-surface"
            aria-label={t("blog.agentImages.mine", "我的图片")}
        >
            <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {Array.from({ length: 12 }).map((_, index) => (
                            <div
                                key={index}
                                className="aspect-square w-full animate-pulse rounded-xl bg-surface-muted"
                            />
                        ))}
                    </div>
                ) : images.length === 0 && loadError ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                        <p className="text-sm text-danger-fg">{loadError}</p>
                        <button
                            type="button"
                            onClick={handleReload}
                            className="rounded-full border border-border bg-canvas px-4 py-1.5 text-xs font-semibold text-ink transition hover:bg-surface-muted"
                        >
                            {t("blog.agentImages.retry", "重新加载")}
                        </button>
                    </div>
                ) : images.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-sm text-ink-muted">
                            {t("blog.agentImages.emptyTitle")}
                        </p>
                        <p className="mt-1 text-xs text-ink-muted/70">
                            {t("blog.agentImages.emptyHint")}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {images.map((item) => (
                            <div
                                key={item.id}
                                className="group relative aspect-square w-full overflow-hidden rounded-xl border border-border/50 bg-surface-muted shadow-sm"
                            >
                                <img
                                    src={item.url}
                                    alt={item.title || ""}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {item.title ? (
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2 pt-8 opacity-0 transition-opacity group-hover:opacity-100">
                                        <div className="line-clamp-1 text-xs font-medium text-white">
                                            {item.title}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )}

                <div
                    ref={sentinelRef}
                    className="flex min-h-12 items-center justify-center"
                    aria-live="polite"
                >
                    {loadError && images.length > 0 ? (
                        <div className="flex items-center gap-3 text-xs text-danger-fg">
                            <span role="status">{loadError}</span>
                            <button
                                type="button"
                                onClick={handleLoadMore}
                                className="font-semibold text-ink underline underline-offset-2"
                            >
                                {t("blog.agentImages.retry", "重试加载")}
                            </button>
                        </div>
                    ) : loadingMore ? (
                        <Loader2
                            className="h-5 w-5 animate-spin text-ink-muted"
                            aria-label={t("blog.agentImages.loadingMore")}
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default AgentImagesPage;

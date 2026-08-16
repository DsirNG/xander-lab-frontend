import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Paperclip, Sparkles, Mic, ArrowUp, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { get } from '@api';

const EXAMPLES = [
  { id: 1, url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&q=80', title: '创建女孩漫画' },
  { id: 2, url: 'https://images.unsplash.com/photo-1544502062-f82887f03d1c?w=300&q=80', title: '动漫男孩' },
  { id: 3, url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80', title: '水下' },
  { id: 4, url: 'https://images.unsplash.com/photo-1490818387583-1b5f22223403?w=300&q=80', title: 'Summer list' },
  { id: 5, url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&q=80', title: '杂货合集' },
];

const PAGE_SIZE = 24;

const AgentImagesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const requestRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestRef.current;
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);
    get('/api/blog/media/images/agent', { page: 1, size: PAGE_SIZE }, {
      _silent: true,
      signal: controller.signal,
    })
      .then((data) => {
        if (requestId !== requestRef.current) return;
        setImages(Array.isArray(data?.records) ? data.records : []);
        setHasMore(Boolean(data?.hasMore));
      })
      .catch((error) => {
        if (requestId !== requestRef.current || error?.code === 'ERR_CANCELED') return;
        setLoadError(error.message || t('blog.agentImages.loadFailed'));
      })
      .finally(() => {
        if (requestId === requestRef.current) setLoading(false);
      });
    return () => controller.abort();
  }, [t]);

  const handleLoadMore = async () => {
    if (loadingMore) return;
    const nextPage = Math.floor(images.length / PAGE_SIZE) + 1;
    const requestId = ++requestRef.current;
    setLoadingMore(true);
    try {
      const data = await get('/api/blog/media/images/agent', { page: nextPage, size: PAGE_SIZE }, {
        _silent: true,
      });
      if (requestId !== requestRef.current) return;
      const records = Array.isArray(data?.records) ? data.records : [];
      setImages((current) => [...current, ...records]);
      setHasMore(Boolean(data?.hasMore));
    } catch (error) {
      if (requestId !== requestRef.current || error?.code === 'ERR_CANCELED') return;
      setLoadError(error.message || t('blog.agentImages.loadFailed'));
    } finally {
      if (requestId === requestRef.current) setLoadingMore(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    // Redirect to agent chat to generate the image
    navigate(`/workspace/agent?q=${encodeURIComponent('生成一张图片: ' + query)}`);
  };

  return (
    <div className="flex h-full w-full flex-col bg-surface overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <h1 className="text-3xl font-bold text-ink mb-8">{t('blog.agentImages.title')}</h1>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="relative mb-12 flex items-center w-full max-w-3xl mx-auto rounded-full border border-border bg-canvas px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
          <Paperclip className="h-5 w-5 text-ink-muted shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('blog.agentImages.inputPlaceholder')}
            className="flex-1 bg-transparent px-3 text-ink placeholder:text-ink-muted outline-none disabled:opacity-50"
          />
          <div className="flex items-center gap-2">
            <button type="button" className="flex items-center gap-1.5 px-2 text-sm font-semibold text-ink-muted hover:text-ink transition">
              <Sparkles className="h-4 w-4" />
              {t('blog.agentImages.think')}
            </button>
            <button type="button" className="grid h-8 w-8 place-items-center rounded-full text-ink-muted hover:bg-surface-muted transition">
              <Mic className="h-5 w-5" />
            </button>
            <button
              type="submit"
              disabled={!query.trim()}
              className="grid h-8 w-8 place-items-center rounded-full bg-ink text-white disabled:bg-surface-muted disabled:text-ink-muted transition"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Generated Examples */}
        <div className="mb-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-ink">{t('blog.agentImages.generated')}</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
            {EXAMPLES.map((ex) => (
              <div key={ex.id} className="group relative h-64 w-44 shrink-0 snap-center overflow-hidden rounded-[2rem] cursor-pointer shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                <img src={ex.url} alt={ex.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
                  <div className="text-sm font-bold text-white line-clamp-1">{ex.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Images Grid */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-ink">{t('blog.agentImages.mine')}</h2>
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-square w-full rounded-2xl bg-surface-muted animate-pulse" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-border/50 bg-canvas py-16 text-center">
              <p className="text-sm text-ink-muted">{t('blog.agentImages.emptyTitle')}</p>
              <p className="text-xs text-ink-muted/70">{t('blog.agentImages.emptyHint')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {images.map((item) => (
                  <div key={item.id} className="group relative aspect-square w-full overflow-hidden rounded-2xl cursor-pointer bg-surface-muted shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                    <img
                      src={item.url}
                      alt={item.title || ''}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {item.title ? (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-8 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="text-xs font-bold text-white line-clamp-1">{item.title}</div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              {loadError && (
                <p className="mt-4 text-center text-xs text-red-500">{loadError}</p>
              )}
              {hasMore && (
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 rounded-full border border-border bg-canvas px-5 py-2 text-sm font-semibold text-ink hover:bg-surface-muted transition disabled:opacity-50"
                  >
                    {loadingMore && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loadingMore ? t('blog.agentImages.loadingMore') : t('blog.agentImages.loadMore')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default AgentImagesPage;
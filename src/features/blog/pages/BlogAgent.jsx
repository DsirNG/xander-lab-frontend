import React, { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Bot, BookOpenCheck, ChevronRight, ExternalLink, FileText, GitFork, Layers, Loader2, Search, Send, Sparkles } from 'lucide-react';
import { blogAgentService } from '../services/blogAgentService';
import { useToast } from '@/hooks/useToast';

const stageKeys = ['analyze', 'research', 'write', 'review'];
const asArray = (value) => Array.isArray(value) ? value : [];

const BlogAgent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { taskId } = useParams();
  const toast = useToast();
  const [input, setInput] = useState('');
  const [taskData, setTaskData] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [streamText, setStreamText] = useState('');
  const streamBufferRef = useRef('');
  const streamErrorRef = useRef(null);
  const streamFrameRef = useRef(null);

  useEffect(() => {
    if (!taskId) return undefined;
    let active = true;
    const load = async () => {
      try {
        const data = await blogAgentService.getTask(taskId, { _silent: true });
        if (active) setTaskData(data);
      } catch (error) { if (active) toast.error(error.message || t('blog.agent.failed')); }
    };
    load();
    const timer = setInterval(load, 3000);
    return () => { active = false; clearInterval(timer); };
  }, [taskId, t, toast]);

  const task = taskData?.task;
  const contentBoundary = taskData?.contentBoundary || {};
  const knowledgeGraph = taskData?.knowledgeGraph || {};
  const graphNodes = asArray(knowledgeGraph.nodes);
  const graphEdges = asArray(knowledgeGraph.edges);
  const graphLabels = useMemo(() => new Map(graphNodes.map((node) => [node.id, node.label || node.id])), [graphNodes]);
  const stageIndex = Math.max(0, stageKeys.indexOf(task?.stage));
  const statusText = useMemo(() => {
    if (!task) return t('blog.agent.waiting');
    if (task.status === 'failed') return task.errorMessage || t('blog.agent.failed');
    if (task.status === 'ready') return t('blog.agent.ready');
    if (task.status === 'running') return t('blog.agent.running');
    return t('blog.agent.waiting');
  }, [task, t]);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.warning(t('blog.agent.inputRequired'));
      return;
    }
    setIsRunning(true);
    setTaskData(null);
    setStreamText('');
    streamBufferRef.current = '';
    streamErrorRef.current = null;
    try {
      const created = await blogAgentService.createTask({ input });
      navigate(`/blog/agent/${created.id}`, { replace: true });
      await blogAgentService.runTaskStream(created.id, ({ event, data }) => {
        if (event === 'delta') {
          streamBufferRef.current += data;
          if (!streamFrameRef.current) {
            streamFrameRef.current = requestAnimationFrame(() => {
              startTransition(() => setStreamText(streamBufferRef.current));
              streamFrameRef.current = null;
            });
          }
        } else if (event === 'complete') {
          setTaskData(data);
        } else if (event === 'error') {
          streamErrorRef.current = typeof data === 'string' ? data : t('blog.agent.failed');
        }
      });
      if (streamFrameRef.current) cancelAnimationFrame(streamFrameRef.current);
      if (streamBufferRef.current) setStreamText(streamBufferRef.current);
      if (streamErrorRef.current) throw new Error(streamErrorRef.current);
      toast.success(t('blog.agent.complete'));
    } catch (error) {
      toast.error(error.message || t('blog.agent.failed'));
    } finally {
      setIsRunning(false);
    }
  };

  const handlePublish = async () => {
    if (!task?.id) return;
    setIsPublishing(true);
    try {
      const post = await blogAgentService.publishTask(task.id);
      setTaskData((current) => ({ ...current, task: { ...current.task, publishedPostId: post.id } }));
      toast.success(t('blog.publishSuccess'));
    } catch (error) { toast.error(error.message || t('blog.publishError')); }
    finally { setIsPublishing(false); }
  };

  const handleCreateDraft = async () => {
    if (!task?.id) return;
    setIsSavingDraft(true);
    try {
      localStorage.setItem('xander-lab:blog-publish-draft', JSON.stringify({
        title: task.title,
        summary: task.summary,
        content: task.content,
        categoryId: task.categoryId,
        tags: taskData.tags || [],
      }));
      toast.success(t('blog.agent.draftCreated'));
      navigate('/blog/publish');
    } catch (error) {
      toast.error(error.message || t('blog.agent.failed'));
    } finally {
      setIsSavingDraft(false);
    }
  };

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
        <button onClick={() => navigate('/blog/')} className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" /> {t('blog.agent.back')}
        </button>
        <div className="flex items-center gap-2 text-sm font-black tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white"><Bot className="h-4 w-4" /></span>
          {t('blog.agent.title')}
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 p-4 sm:p-8 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-7 flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><Sparkles className="h-5 w-5" /></div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">{t('blog.agent.headline')}</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">{t('blog.agent.description')}</p>
            </div>
          </div>

          <label className="mb-2 block text-sm font-bold text-slate-700">{t('blog.agent.inputLabel')}</label>
          <textarea value={input} onChange={(event) => setInput(event.target.value)} disabled={isRunning}
            placeholder={t('blog.agent.inputPlaceholder')} className="min-h-64 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:opacity-60" />

          <button onClick={handleGenerate} disabled={isRunning} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-primary disabled:cursor-wait disabled:opacity-60">
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {isRunning ? t('blog.agent.running') : t('blog.agent.generate')}
          </button>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10">
          <div className="flex items-center justify-between"><h2 className="font-black">{t('blog.agent.workflow')}</h2><span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">{statusText}</span></div>
          <ol className="mt-6 space-y-4">
            {stageKeys.map((stage, index) => <li key={stage} className="flex gap-3"><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-black ${index <= stageIndex && task ? 'bg-primary text-white' : 'bg-white/10 text-slate-400'}`}>{index < stageIndex ? '✓' : index + 1}</span><div><p className="text-sm font-bold">{t(`blog.agent.stages.${stage}`)}</p><p className="mt-0.5 text-xs leading-5 text-slate-400">{t(`blog.agent.stageDescriptions.${stage}`)}</p></div></li>)}
          </ol>
          <p className="mt-7 border-t border-white/10 pt-5 text-xs leading-5 text-slate-400">{t('blog.agent.guardrail')}</p>
        </aside>

        {isRunning && <section className="xl:col-span-2 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-sm"><div className="flex items-center gap-2 border-b border-white/10 px-5 py-3 text-sm font-bold text-white"><Loader2 className="h-4 w-4 animate-spin text-primary" />{t('blog.agent.running')}</div><pre className="max-h-96 overflow-auto whitespace-pre-wrap p-5 text-xs leading-6 text-slate-200">{streamText || '…'}</pre></section>}

        {task && <section className="xl:col-span-2 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5"><div><span className="text-xs font-bold uppercase tracking-widest text-primary">{t('blog.agent.article')}</span><h2 className="mt-1 text-2xl font-black tracking-tight">{task.title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{task.summary}</p></div>{task.publishedPostId ? <button onClick={() => navigate(`/blog/${task.publishedPostId}`)} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-black text-white">查看文章</button> : task.status === 'ready' && <div className="flex gap-2"><button onClick={handleCreateDraft} disabled={isSavingDraft} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-black disabled:opacity-60">{isSavingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}{t('blog.agent.toDraft')}</button><button onClick={handlePublish} disabled={isPublishing} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-black text-white disabled:opacity-60">{isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}确认发布</button></div>}</div>
            {task.content ? <div className="prose prose-slate max-w-none prose-headings:font-black prose-a:text-primary"><ReactMarkdown remarkPlugins={[remarkGfm]}>{task.content}</ReactMarkdown></div> : <p className="text-sm text-slate-500">{statusText}</p>}
          </article>
          <aside className="space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-sm font-black"><Layers className="h-4 w-4 text-primary" />{t('blog.agent.contentFocus')}</div><div className="mt-4 space-y-4"><div><p className="text-xs font-bold text-slate-500">{t('blog.agent.mustCover')}</p><div className="mt-2 flex flex-wrap gap-1.5">{asArray(contentBoundary.mustCover).map((item) => <span key={item} className="rounded-lg bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">{item}</span>)}</div></div>{asArray(contentBoundary.relatedExpansion).length > 0 && <div><p className="text-xs font-bold text-slate-500">{t('blog.agent.relatedExpansion')}</p><p className="mt-1 text-xs leading-5 text-slate-600">{asArray(contentBoundary.relatedExpansion).join('、')}</p></div>}{asArray(contentBoundary.outOfScope).length > 0 && <div><p className="text-xs font-bold text-slate-500">{t('blog.agent.outOfScope')}</p><p className="mt-1 text-xs leading-5 text-slate-500">{asArray(contentBoundary.outOfScope).join('、')}</p></div>}</div></section>
            {knowledgeGraph.enabled && graphNodes.length > 0 && <section className="rounded-3xl border border-indigo-100 bg-indigo-50/60 p-5"><div className="flex items-center gap-2 text-sm font-black text-indigo-950"><GitFork className="h-4 w-4 text-indigo-600" />{t('blog.agent.knowledgeGraph')}</div><p className="mt-2 text-xs leading-5 text-indigo-900/70">{knowledgeGraph.reason}</p><div className="mt-4 flex flex-wrap gap-1.5">{graphNodes.map((node) => <span key={node.id} title={node.description} className="rounded-lg border border-indigo-200 bg-white px-2 py-1 text-xs font-semibold text-indigo-900">{node.label}</span>)}</div><div className="mt-4 space-y-2">{graphEdges.map((edge, index) => <div key={`${edge.from}-${edge.to}-${index}`} className="rounded-lg bg-white/80 px-2.5 py-2 text-xs leading-5 text-indigo-950"><strong>{graphLabels.get(edge.from) || edge.from}</strong><span className="mx-1.5 text-indigo-400">→</span><span>{edge.relation}</span><span className="mx-1.5 text-indigo-400">→</span><strong>{graphLabels.get(edge.to) || edge.to}</strong></div>)}</div></section>}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-sm font-black"><Search className="h-4 w-4 text-primary" />{t('blog.agent.sources')}</div><div className="mt-4 space-y-4">{taskData.sources?.length ? taskData.sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="block rounded-xl bg-slate-50 p-3 transition hover:bg-primary/5"><p className="line-clamp-2 text-sm font-bold text-slate-800">{source.title}</p><p className="mt-1 text-xs text-slate-500">{source.publisher || source.reliability}</p><ExternalLink className="mt-2 h-3.5 w-3.5 text-primary" /></a>) : <p className="text-sm leading-6 text-slate-500">{t('blog.agent.noSources')}</p>}</div></section><section className="rounded-3xl border border-amber-200 bg-amber-50 p-5"><div className="flex items-center gap-2 text-sm font-black text-amber-900"><BookOpenCheck className="h-4 w-4" />{t('blog.agent.review')}</div><p className="mt-3 text-sm leading-6 text-amber-900/80">{task.review || t('blog.agent.reviewPending')}</p></section></aside>
        </section>}
      </main>
    </div>
  );
};

export default BlogAgent;

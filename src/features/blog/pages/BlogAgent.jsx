import React, { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bot, Loader2, Plus, Send, Sparkles } from 'lucide-react';
import { blogAgentService } from '../services/blogAgentService';
import { useToast } from '@/hooks/useToast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import useIsMobile from '@/hooks/useIsMobile';
import AgentChatMessage from '../components/agent/AgentChatMessage';
import AgentProcessPanel from '../components/agent/AgentProcessPanel';
import AgentResultCard from '../components/agent/AgentResultCard';
import AgentPreviewPanel from '../components/agent/AgentPreviewPanel';

const RESULT_MESSAGE_ID = 'result';

const BlogAgent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { taskId } = useParams();
  const toast = useToast();
  const isMobile = useIsMobile(1024);
  const [input, setInput] = useState('');
  const [taskData, setTaskData] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isTaskLoading, setIsTaskLoading] = useState(Boolean(taskId));
  const [streamText, setStreamText] = useState('');
  const [startedAt, setStartedAt] = useState(null);
  const [endedAt, setEndedAt] = useState(null);
  const [pendingUserInput, setPendingUserInput] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState(null);
  const streamBufferRef = useRef('');
  const streamErrorRef = useRef(null);
  const streamFrameRef = useRef(null);
  const chatEndRef = useRef(null);
  const isRunningRef = useRef(false);
  isRunningRef.current = isRunning;
  const task = taskData?.task;
  const hasFinishedTurn = Boolean(task) && !isRunning && (task.status === 'ready' || task.status === 'failed');
  const inputLocked = isRunning || hasFinishedTurn;

  useEffect(() => {
    if (!taskId) {
      setIsTaskLoading(false);
      setTaskData(null);
      setPendingUserInput('');
      setStreamText('');
      setStartedAt(null);
      setEndedAt(null);
      setPreviewOpen(false);
      setSelectedResultId(null);
      return undefined;
    }

    // 本页正在跑流时由 stream 更新状态，不额外 getTask
    if (isRunningRef.current) {
      setIsTaskLoading(false);
      return undefined;
    }

    setIsTaskLoading(true);
    let active = true;
    const load = async () => {
      try {
        const data = await blogAgentService.getTask(taskId, { _silent: true });
        if (!active) return;
        setTaskData(data);
        setPendingUserInput(data?.task?.input || '');
        if (data?.task?.status === 'ready') {
          setSelectedResultId(RESULT_MESSAGE_ID);
          setPreviewOpen(true);
        }
      } catch (error) {
        if (active) toast.error(error.message || t('blog.agent.failed'));
      } finally {
        if (active) setIsTaskLoading(false);
      }
    };
    load();
    return () => { active = false; };
    // 仅在 taskId 变化时恢复；本地流式跑完不重复拉取，避免闪全屏 loading
  }, [taskId, t, toast]);

  const statusText = useMemo(() => {
    if (!task) return t('blog.agent.waiting');
    if (task.status === 'failed') return task.errorMessage || t('blog.agent.failed');
    if (task.status === 'ready') return t('blog.agent.ready');
    if (task.status === 'running' || isRunning) return t('blog.agent.running');
    return t('blog.agent.waiting');
  }, [task, isRunning, t]);

  const messages = useMemo(() => {
    const list = [];
    const userContent = pendingUserInput || task?.input;
    if (userContent) {
      list.push({ id: 'user', role: 'user', content: userContent });
    }

    if (isRunning || task) {
      const processStatus = isRunning
        ? 'running'
        : task?.status === 'failed'
          ? 'failed'
          : task?.status === 'ready'
            ? 'ready'
            : 'running';
      list.push({
        id: 'process',
        role: 'assistant',
        kind: 'process',
        status: processStatus,
        stage: task?.stage,
        streamText,
        startedAt,
        endedAt,
        errorMessage: task?.errorMessage,
      });
    }

    if (task?.status === 'ready' && (task.title || task.content)) {
      list.push({
        id: RESULT_MESSAGE_ID,
        role: 'assistant',
        kind: 'result',
        title: task.title,
        summary: task.summary,
        taskId: task.id,
      });
    }

    return list;
  }, [pendingUserInput, task, isRunning, streamText, startedAt, endedAt]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, streamText, isRunning]);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.warning(t('blog.agent.inputRequired'));
      return;
    }
    const submitted = input.trim();
    setIsRunning(true);
    setTaskData(null);
    setStreamText('');
    setPendingUserInput(submitted);
    setStartedAt(Date.now());
    setEndedAt(null);
    setPreviewOpen(false);
    setSelectedResultId(null);
    streamBufferRef.current = '';
    streamErrorRef.current = null;
    try {
      const created = await blogAgentService.createTask({ input: submitted });
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
      setEndedAt(Date.now());
      setSelectedResultId(RESULT_MESSAGE_ID);
      setPreviewOpen(true);
      setInput('');
      toast.success(t('blog.agent.complete'));
    } catch (error) {
      setEndedAt(Date.now());
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
    } catch (error) {
      toast.error(error.message || t('blog.publishError'));
    } finally {
      setIsPublishing(false);
    }
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

  const handleNewTask = () => {
    setInput('');
    setTaskData(null);
    setPendingUserInput('');
    setStreamText('');
    setStartedAt(null);
    setEndedAt(null);
    setPreviewOpen(false);
    setSelectedResultId(null);
    navigate('/blog/agent', { replace: true });
  };

  const handleSelectResult = () => {
    setSelectedResultId(RESULT_MESSAGE_ID);
    setPreviewOpen(true);
  };

  const showPreview = previewOpen && selectedResultId === RESULT_MESSAGE_ID && Boolean(task);
  const previewPanel = (
    <AgentPreviewPanel
      taskData={taskData}
      statusText={statusText}
      isPublishing={isPublishing}
      isSavingDraft={isSavingDraft}
      onPublish={handlePublish}
      onCreateDraft={handleCreateDraft}
      onViewPublished={() => task?.publishedPostId && navigate(`/blog/${task.publishedPostId}`)}
      onClose={() => setPreviewOpen(false)}
    />
  );

  return (
    <div className="flex h-dvh flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
        <button
          type="button"
          onClick={() => navigate('/blog/')}
          className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('blog.agent.back')}
        </button>
        <div className="flex items-center gap-2 text-sm font-black tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white">
            <Bot className="h-4 w-4" />
          </span>
          {t('blog.agent.title')}
        </div>
        <button
          type="button"
          onClick={handleNewTask}
          className="inline-flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t('blog.agent.newTask')}</span>
        </button>
      </header>

      {isTaskLoading ? (
        <LoadingSpinner fullScreen text={t('blog.agent.restoring')} />
      ) : (
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <section className={`flex min-h-0 min-w-0 flex-1 flex-col ${showPreview && !isMobile ? 'lg:max-w-[48%]' : ''}`}>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              {messages.length === 0 ? (
                <div className="mx-auto flex max-w-xl flex-col items-start gap-4 pt-8 sm:pt-16">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight">{t('blog.agent.headline')}</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{t('blog.agent.description')}</p>
                  </div>
                </div>
              ) : (
                <div className="mx-auto flex max-w-2xl flex-col gap-4">
                  {messages.map((message) => {
                    if (message.role === 'user') {
                      return <AgentChatMessage key={message.id} content={message.content} />;
                    }
                    if (message.kind === 'process') {
                      return (
                        <AgentProcessPanel
                          key={message.id}
                          status={message.status}
                          stage={message.stage}
                          streamText={message.streamText}
                          startedAt={message.startedAt}
                          endedAt={message.endedAt}
                          errorMessage={message.errorMessage}
                        />
                      );
                    }
                    if (message.kind === 'result') {
                      return (
                        <AgentResultCard
                          key={message.id}
                          title={message.title}
                          summary={message.summary}
                          selected={selectedResultId === message.id && previewOpen}
                          onSelect={handleSelectResult}
                        />
                      );
                    }
                    return null;
                  })}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
              <div className="mx-auto max-w-2xl">
                {hasFinishedTurn && (
                  <p className="mb-2 text-xs text-slate-500">{t('blog.agent.singleTurnHint')}</p>
                )}
                <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    disabled={inputLocked}
                    rows={2}
                    placeholder={inputLocked ? t('blog.agent.inputLockedPlaceholder') : t('blog.agent.inputPlaceholder')}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        if (!inputLocked) handleGenerate();
                      }
                    }}
                    className="max-h-40 min-h-[52px] flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-slate-400 disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={hasFinishedTurn ? handleNewTask : handleGenerate}
                    disabled={isRunning || (!hasFinishedTurn && !input.trim())}
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-black text-white transition hover:bg-primary disabled:cursor-wait disabled:opacity-60"
                  >
                    {isRunning ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : hasFinishedTurn ? (
                      <Plus className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isRunning
                      ? t('blog.agent.running')
                      : hasFinishedTurn
                        ? t('blog.agent.newTask')
                        : t('blog.agent.generate')}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {showPreview && !isMobile && (
            <aside className="hidden min-h-0 w-[52%] border-l border-slate-200 lg:block">
              {previewPanel}
            </aside>
          )}

          {showPreview && isMobile && (
            <div className="absolute inset-0 z-30 bg-white">
              {previewPanel}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogAgent;

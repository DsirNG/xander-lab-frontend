import React, { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bot, Loader2, MessageSquareText, Plus, Send, Sparkles, X } from 'lucide-react';
import { blogAgentService } from '../services/blogAgentService';
import { useToast } from '@/hooks/useToast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import useIsMobile from '@/hooks/useIsMobile';
import AgentChatMessage from '../components/agent/AgentChatMessage';
import AgentProcessPanel from '../components/agent/AgentProcessPanel';
import AgentResultCard from '../components/agent/AgentResultCard';
import AgentPreviewPanel from '../components/agent/AgentPreviewPanel';
import AgentSessionList from '../components/agent/AgentSessionList';
import {
  RESULT_MESSAGE_ID,
  TASK_TERMINAL_STATUSES,
  RECONNECT_BASE_DELAY,
  RECONNECT_MAX_DELAY,
  eventCursorKey,
  streamTextKey,
  createAbortError,
  isAbortError,
  waitForReconnect,
  readSessionValue,
  writeSessionValue,
  removeSessionValue,
  buildStoredMessages,
  getStoredProcessLogs,
} from '../utils/agentRuntime';

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
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [liveLogs, setLiveLogs] = useState([]);
  const [liveStage, setLiveStage] = useState('analyze');
  const [liveUserInput, setLiveUserInput] = useState('');
  const [mobileSessionsOpen, setMobileSessionsOpen] = useState(false);
  const streamBufferRef = useRef('');
  const streamErrorRef = useRef(null);
  const streamFrameRef = useRef(null);
  const activeRunAbortRef = useRef(null);
  const activeStreamTaskIdRef = useRef(null);
  const currentTaskIdRef = useRef(taskId);
  const toastRef = useRef(toast);
  const eventCursorRef = useRef({ taskId: null, eventId: 0 });
  const chatEndRef = useRef(null);
  const isRunningRef = useRef(false);
  isRunningRef.current = isRunning;
  toastRef.current = toast;
  currentTaskIdRef.current = taskId;
  const task = taskData?.task;
  const selectedVersion = taskData?.versions?.find((version) => String(version.id) === String(selectedVersionId));
  const isActiveStreamForCurrentTask = isRunning
    && String(activeStreamTaskIdRef.current) === String(taskId);
  const isTaskActive = isActiveStreamForCurrentTask || task?.status === 'running';
  const hasFinishedTurn = Boolean(task) && !isTaskActive && task.status === 'ready';
  const inputLocked = isTaskActive;

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      setSessions(await blogAgentService.getSessions({ _silent: true }) || []);
    } catch {
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const applyTaskSnapshot = useCallback((data) => {
    if (!data?.task) return;
    setTaskData(data);
    setLiveStage(data.task.stage || 'analyze');
    if (data.task.status === 'ready') {
      setSelectedVersionId(data.versions?.[0]?.id ?? null);
      setSelectedResultId(RESULT_MESSAGE_ID);
      setPreviewOpen(true);
    }
  }, []);

  const rememberEventId = useCallback((id, rawEventId) => {
    const eventId = Number(rawEventId);
    if (!Number.isSafeInteger(eventId) || eventId <= 0) return true;
    if (eventCursorRef.current.taskId !== String(id)) {
      eventCursorRef.current = {
        taskId: String(id),
        eventId: Number(readSessionValue(eventCursorKey(id), '0')) || 0,
      };
    }
    if (eventId <= eventCursorRef.current.eventId) return false;
    eventCursorRef.current.eventId = eventId;
    writeSessionValue(eventCursorKey(id), String(eventId));
    return true;
  }, []);

  const applyStreamEvent = useCallback((id, { id: eventId, event, data }) => {
    if (!rememberEventId(id, eventId)) return;
    if (event === 'delta') {
      streamBufferRef.current += data;
      writeSessionValue(streamTextKey(id), streamBufferRef.current);
      if (!streamFrameRef.current) {
        streamFrameRef.current = requestAnimationFrame(() => {
          startTransition(() => setStreamText(streamBufferRef.current));
          streamFrameRef.current = null;
        });
      }
    } else if (event === 'stage') {
      const [stage, message] = String(data).split('|', 2);
      setLiveStage(stage);
      setLiveLogs((current) => [...current, message || stage]);
      setTaskData((current) => current && String(current.task?.id) === String(id)
        ? { ...current, task: { ...current.task, stage, status: 'running' } }
        : current);
    } else if (event === 'complete') {
      if (String(currentTaskIdRef.current) === String(id)) applyTaskSnapshot(data);
      removeSessionValue(streamTextKey(id));
    } else if (event === 'error') {
      streamErrorRef.current = typeof data === 'string' ? data : t('blog.agent.failed');
    }
  }, [applyTaskSnapshot, rememberEventId, t]);

  const recoverTaskReliably = useCallback(async (id, signal, initialSnapshot = null) => {
    let snapshot = initialSnapshot;
    let reconnectAttempt = 0;
    const applySnapshotIfCurrent = (data) => {
      if (String(currentTaskIdRef.current) === String(id)) applyTaskSnapshot(data);
    };

    while (!signal?.aborted) {
      try {
        snapshot = snapshot || await blogAgentService.getTask(id, { _silent: true, signal });
        applySnapshotIfCurrent(snapshot);
        if (TASK_TERMINAL_STATUSES.has(snapshot?.task?.status)) return snapshot;

        const afterEventId = Number(readSessionValue(eventCursorKey(id), '0')) || 0;
        await blogAgentService.subscribeTaskEvents(
          id,
          afterEventId,
          (event) => applyStreamEvent(id, event),
          { _silent: true, signal },
        );

        // A normally closed stream can still race the task completion event.
        // Always confirm task state before deciding whether to reconnect.
        snapshot = await blogAgentService.getTask(id, { _silent: true, signal });
        applySnapshotIfCurrent(snapshot);
        if (TASK_TERMINAL_STATUSES.has(snapshot?.task?.status)) return snapshot;
      } catch (error) {
        if (signal?.aborted || isAbortError(error)) throw createAbortError();
        // Authentication and client errors cannot be repaired by reconnecting.
        if (error?.status && error.status < 500) throw error;
      }

      reconnectAttempt += 1;
      const delay = Math.min(RECONNECT_BASE_DELAY * (2 ** (reconnectAttempt - 1)), RECONNECT_MAX_DELAY);
      await waitForReconnect(delay, signal);
      // Fetch a fresh snapshot before each resumed SSE subscription.
      snapshot = null;
    }

    throw createAbortError();
  }, [applyStreamEvent, applyTaskSnapshot]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (!taskId) {
      setIsTaskLoading(false);
      setTaskData(null);
      setPendingUserInput('');
      setStreamText('');
      setStartedAt(null);
      setEndedAt(null);
      setLiveStage('analyze');
      setPreviewOpen(false);
      setSelectedResultId(null);
      setSelectedVersionId(null);
      return undefined;
    }

    // 本页正在跑流时由 stream 更新状态，不额外 getTask
    if (isRunningRef.current && String(activeStreamTaskIdRef.current) === String(taskId)) {
      setIsTaskLoading(false);
      return undefined;
    }

    setIsTaskLoading(true);
    let active = true;
    const controller = new AbortController();
    const load = async () => {
      try {
        const data = await blogAgentService.getTask(taskId, { _silent: true, signal: controller.signal });
        if (!active) return;
        applyTaskSnapshot(data);
        setPendingUserInput(data?.task?.input || '');
        setLiveUserInput('');
        setLiveLogs(data?.task?.status === 'running' ? getStoredProcessLogs(data.messages) : []);
        setIsTaskLoading(false);
        if (data?.task?.status === 'running') {
          const restoredStreamText = readSessionValue(streamTextKey(taskId));
          streamBufferRef.current = restoredStreamText;
          setStreamText(restoredStreamText);
          eventCursorRef.current = {
            taskId: String(taskId),
            eventId: Number(readSessionValue(eventCursorKey(taskId), '0')) || 0,
          };
          setIsRunning(true);
          setStartedAt((current) => current || Date.now());
          const recovered = await recoverTaskReliably(taskId, controller.signal, data);
          if (!active) return;
          setEndedAt(Date.now());
          if (recovered?.task?.status === 'ready') loadSessions();
        }
      } catch (error) {
        if (active && !isAbortError(error)) toastRef.current.error(error.message || t('blog.agent.failed'));
      } finally {
        if (active) {
          setIsTaskLoading(false);
          setIsRunning(false);
        }
      }
    };
    load();
    return () => {
      active = false;
      controller.abort();
    };
    // 本地流式执行由事件回调更新；重新进入 running 任务时使用快照恢复。
  }, [applyTaskSnapshot, loadSessions, recoverTaskReliably, taskId, t]);

  const statusText = useMemo(() => {
    if (!task) return t('blog.agent.waiting');
    if (task.status === 'failed') return task.errorMessage || t('blog.agent.failed');
    if (task.status === 'ready') return t('blog.agent.ready');
    if (task.status === 'running' || isRunning) return t('blog.agent.running');
    return t('blog.agent.waiting');
  }, [task, isRunning, t]);

  const messages = useMemo(() => {
    const list = buildStoredMessages(taskData?.messages);
    // A running task has one authoritative live process card. Historical process
    // records are used to seed its logs after refresh, not rendered as a second card.
    if (isTaskActive) {
      for (let index = list.length - 1; index >= 0; index -= 1) {
        if (list[index].kind === 'process') list.splice(index, 1);
      }
    }
    if (task?.status === 'failed') {
      const latestProcess = list.findLast?.((message) => message.kind === 'process')
        || [...list].reverse().find((message) => message.kind === 'process');
      if (latestProcess) {
        latestProcess.status = 'failed';
        latestProcess.errorMessage = task.errorMessage;
      }
    }
    if (list.length === 0 && (pendingUserInput || task?.input)) {
      list.push({ id: 'user', role: 'user', content: pendingUserInput || task.input });
    }
    if (liveUserInput && !list.some((message) => message.role === 'user' && message.content === liveUserInput)) {
      list.push({ id: 'live-user', role: 'user', content: liveUserInput });
    }
    if (isTaskActive) {
      const processStatus = isTaskActive
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
        stage: task?.stage || liveStage,
        streamText,
        startedAt,
        endedAt,
        errorMessage: task?.errorMessage,
        logs: liveLogs,
      });
    }
    if (task?.status === 'ready' && (task.title || task.content) && !list.some((message) => message.kind === 'result')) {
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
  }, [taskData?.messages, pendingUserInput, task, isTaskActive, streamText, startedAt, endedAt, liveLogs, liveStage, liveUserInput]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, streamText, isRunning]);

  useEffect(() => () => {
    activeRunAbortRef.current?.abort();
    if (streamFrameRef.current) cancelAnimationFrame(streamFrameRef.current);
  }, []);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.warning(t('blog.agent.inputRequired'));
      return;
    }
    const submitted = input.trim();
    setInput('');
    setIsRunning(true);
    setTaskData(null);
    setStreamText('');
    setPendingUserInput(submitted);
    setLiveUserInput(submitted);
    setLiveLogs([]);
    setLiveStage('analyze');
    setStartedAt(Date.now());
    setEndedAt(null);
    setPreviewOpen(false);
    setSelectedResultId(null);
    streamBufferRef.current = '';
    streamErrorRef.current = null;
    activeRunAbortRef.current?.abort();
    const controller = new AbortController();
    activeRunAbortRef.current = controller;
    let createdTaskId = null;
    try {
      const created = await blogAgentService.createTask({ input: submitted });
      createdTaskId = created.id;
      activeStreamTaskIdRef.current = created.id;
      removeSessionValue(eventCursorKey(created.id));
      removeSessionValue(streamTextKey(created.id));
      eventCursorRef.current = { taskId: String(created.id), eventId: 0 };
      navigate(`/blog/agent/${created.id}`, { replace: true });
      await blogAgentService.runTaskStream(
        created.id,
        (event) => applyStreamEvent(created.id, event),
        { signal: controller.signal },
      );
      const recovered = await recoverTaskReliably(created.id, controller.signal);
      if (streamFrameRef.current) cancelAnimationFrame(streamFrameRef.current);
      if (streamBufferRef.current) setStreamText(streamBufferRef.current);
      if (recovered?.task?.status === 'failed') throw new Error(recovered.task.errorMessage || t('blog.agent.failed'));
      if (streamErrorRef.current) throw new Error(streamErrorRef.current);
      setEndedAt(Date.now());
      setSelectedResultId(RESULT_MESSAGE_ID);
      setPreviewOpen(true);
      setInput('');
      setLiveUserInput('');
      setLiveLogs([]);
      loadSessions();
      toast.success(t('blog.agent.complete'));
    } catch (error) {
      if (controller.signal.aborted || isAbortError(error)) return;
      setEndedAt(Date.now());
      let finalError = error;
      if (createdTaskId) {
        try {
          const recovered = await recoverTaskReliably(createdTaskId, controller.signal);
          if (recovered?.task?.status === 'ready') {
            setEndedAt(Date.now());
            setInput('');
            setLiveUserInput('');
            setLiveLogs([]);
            loadSessions();
            toast.success(t('blog.agent.complete'));
            return;
          }
          finalError = new Error(recovered?.task?.errorMessage || error.message);
        } catch (recoveryError) {
          if (controller.signal.aborted || isAbortError(recoveryError)) return;
          finalError = recoveryError;
        }
      }
      loadSessions();
      toast.error(finalError.message || t('blog.agent.failed'));
    } finally {
      if (activeRunAbortRef.current === controller) {
        activeRunAbortRef.current = null;
        activeStreamTaskIdRef.current = null;
      }
      setIsRunning(false);
    }
  };

  const handleRevise = async () => {
    if (!task?.id || !input.trim()) return;
    const submitted = input.trim();
    setInput('');
    activeStreamTaskIdRef.current = task.id;
    setIsRunning(true);
    setLiveUserInput(submitted);
    setLiveLogs([]);
    setLiveStage('analyze');
    setStreamText('');
    setStartedAt(Date.now());
    setEndedAt(null);
    streamBufferRef.current = '';
    streamErrorRef.current = null;
    removeSessionValue(streamTextKey(task.id));
    activeRunAbortRef.current?.abort();
    const controller = new AbortController();
    activeRunAbortRef.current = controller;
    try {
      await blogAgentService.reviseTaskStream(
        task.id,
        submitted,
        (event) => applyStreamEvent(task.id, event),
        { signal: controller.signal },
      );
      const recovered = await recoverTaskReliably(task.id, controller.signal);
      if (recovered?.task?.status === 'failed') throw new Error(recovered.task.errorMessage || t('blog.agent.failed'));
      if (streamErrorRef.current) throw new Error(streamErrorRef.current);
      setEndedAt(Date.now());
      setInput('');
      setLiveUserInput('');
      setLiveLogs([]);
      setSelectedResultId(RESULT_MESSAGE_ID);
      setPreviewOpen(true);
      loadSessions();
      toast.success(t('blog.agent.revisionComplete'));
    } catch (error) {
      if (controller.signal.aborted || isAbortError(error)) return;
      setEndedAt(Date.now());
      let finalError = error;
      try {
        const recovered = await recoverTaskReliably(task.id, controller.signal);
        if (recovered?.task?.status === 'ready' && !recovered.task.errorMessage) {
          setEndedAt(Date.now());
          setInput('');
          setLiveUserInput('');
          setLiveLogs([]);
          loadSessions();
          toast.success(t('blog.agent.revisionComplete'));
          return;
        }
        finalError = new Error(recovered?.task?.errorMessage || error.message);
      } catch (recoveryError) {
        if (controller.signal.aborted || isAbortError(recoveryError)) return;
        finalError = recoveryError;
      }
      loadSessions();
      toast.error(finalError.message || t('blog.agent.failed'));
    } finally {
      if (activeRunAbortRef.current === controller) {
        activeRunAbortRef.current = null;
        activeStreamTaskIdRef.current = null;
      }
      setIsRunning(false);
    }
  };

  const handleSubmit = () => hasFinishedTurn ? handleRevise() : handleGenerate();

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
        summary: selectedVersion?.summary || task.summary,
        content: selectedVersion?.content || task.content,
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
    activeRunAbortRef.current?.abort();
    activeRunAbortRef.current = null;
    activeStreamTaskIdRef.current = null;
    setIsRunning(false);
    setInput('');
    setTaskData(null);
    setPendingUserInput('');
    setStreamText('');
    setStartedAt(null);
    setEndedAt(null);
    setPreviewOpen(false);
    setSelectedResultId(null);
    setSelectedVersionId(null);
    setLiveUserInput('');
    setLiveLogs([]);
    setLiveStage('analyze');
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
      selectedVersionId={selectedVersionId}
      statusText={statusText}
      isPublishing={isPublishing}
      isSavingDraft={isSavingDraft}
      onPublish={handlePublish}
      onCreateDraft={handleCreateDraft}
      onViewPublished={() => task?.publishedPostId && navigate(`/blog/${task.publishedPostId}`)}
      onSelectVersion={setSelectedVersionId}
      onClose={() => setPreviewOpen(false)}
    />
  );

  return (
    <div className="flex h-dvh flex-col bg-surface text-ink">
      <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-canvas/95 px-4 backdrop-blur sm:px-6">
        <button
          type="button"
          onClick={() => navigate('/blog/')}
          className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-ink-muted transition hover:bg-surface-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('blog.agent.back')}
        </button>
        <div className="flex items-center gap-2 text-sm font-black tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white">
            <Bot className="h-4 w-4" />
          </span>
          {t('blog.agent.title')}
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setMobileSessionsOpen(true)} className="rounded-xl p-2 text-ink-muted hover:bg-surface-muted lg:hidden" aria-label={t('blog.agent.conversations')}>
            <MessageSquareText className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleNewTask}
            className="inline-flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold text-ink-muted transition hover:bg-surface-muted hover:text-ink"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t('blog.agent.newTask')}</span>
          </button>
        </div>
      </header>

      {isTaskLoading ? (
        <LoadingSpinner fullScreen text={t('blog.agent.restoring')} />
      ) : (
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <AgentSessionList
            sessions={sessions}
            activeId={taskId}
            loading={sessionsLoading}
            disableNew={isRunning}
            onSelect={(id) => navigate(`/blog/agent/${id}`)}
            onNew={handleNewTask}
          />
          {mobileSessionsOpen && (
            <div className="absolute inset-0 z-40 flex bg-ink/40 lg:hidden">
              <AgentSessionList
                mobile
                sessions={sessions}
                activeId={taskId}
                loading={sessionsLoading}
                disableNew={isRunning}
                onSelect={(id) => {
                  setMobileSessionsOpen(false);
                  navigate(`/blog/agent/${id}`);
                }}
                onNew={() => {
                  setMobileSessionsOpen(false);
                  handleNewTask();
                }}
              />
              <button type="button" onClick={() => setMobileSessionsOpen(false)} className="m-3 grid h-10 w-10 place-items-center rounded-full bg-canvas text-ink-secondary" aria-label={t('common.aria.close', 'Close')}>
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          <section className={`flex min-h-0 min-w-0 flex-1 flex-col ${showPreview && !isMobile ? 'lg:max-w-[48%]' : ''}`}>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              {messages.length === 0 ? (
                <div className="mx-auto flex max-w-xl flex-col items-start gap-4 pt-8 sm:pt-16">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight">{t('blog.agent.headline')}</h1>
                    <p className="mt-2 text-sm leading-6 text-ink-muted">{t('blog.agent.description')}</p>
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
                          logs={message.logs}
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

            <div className="shrink-0 border-t border-border bg-canvas px-4 py-3 sm:px-6">
              <div className="mx-auto max-w-2xl">
                {hasFinishedTurn && <p className="mb-2 text-xs text-ink-muted">{t('blog.agent.multiTurnHint')}</p>}
                <div className="flex items-end gap-2 rounded-2xl border border-border bg-surface p-2 focus-within:border-accent focus-within:bg-canvas focus-within:ring-4 focus-within:ring-accent/10">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    disabled={inputLocked}
                    rows={2}
                    placeholder={inputLocked ? t('blog.agent.inputLockedPlaceholder') : t('blog.agent.inputPlaceholder')}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        if (!inputLocked) handleSubmit();
                      }
                    }}
                    className="max-h-40 min-h-[52px] flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-ink-faint disabled:opacity-60"
                  />
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={inputLocked || !input.trim()}
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-black text-white transition hover:bg-accent disabled:cursor-wait disabled:opacity-60"
                  >
                    {isTaskActive ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isTaskActive
                      ? t('blog.agent.running')
                      : hasFinishedTurn
                        ? t('blog.agent.revise')
                        : t('blog.agent.generate')}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {showPreview && !isMobile && (
            <aside className="hidden min-h-0 w-[52%] border-l border-border lg:block">
              {previewPanel}
            </aside>
          )}

          {showPreview && isMobile && (
            <div className="absolute inset-0 z-30 bg-canvas">
              {previewPanel}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogAgent;

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, X } from 'lucide-react';
import { blogAgentService } from '../services/blogAgentService';
import { useToast } from '@/hooks/useToast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import useIsMobile from '@/hooks/useIsMobile';
import AgentHeader from '../components/agent/AgentHeader';
import AgentChatInput from '../components/agent/AgentChatInput';
import AgentChatMessage from '../components/agent/AgentChatMessage';
import AgentProcessPanel from '../components/agent/AgentProcessPanel';
import AgentResultCard from '../components/agent/AgentResultCard';
import AgentPreviewPanel from '../components/agent/AgentPreviewPanel';
import AgentSessionList from '../components/agent/AgentSessionList';
import { RESULT_MESSAGE_ID, buildStoredMessages } from '../utils/agentRuntime';
import useBlogAgentTask from '../hooks/useBlogAgentTask';

const BlogAgent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { taskId } = useParams();
  const toast = useToast();
  const isMobile = useIsMobile(1024);
  const [input, setInput] = useState('');
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState(null);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [mobileSessionsOpen, setMobileSessionsOpen] = useState(false);
  const chatEndRef = useRef(null);

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

  const handleTaskReady = useCallback((data) => {
    setSelectedVersionId(data.versions?.[0]?.id ?? null);
    setSelectedResultId(RESULT_MESSAGE_ID);
    setPreviewOpen(true);
  }, []);

  const {
    taskData,
    setTaskData,
    isRunning,
    isTaskLoading,
    streamText,
    startedAt,
    endedAt,
    pendingUserInput,
    liveLogs,
    liveStage,
    liveUserInput,
    generate,
    revise,
    reset,
  } = useBlogAgentTask({
    taskId,
    onReady: handleTaskReady,
    onSessionsChanged: loadSessions,
  });

  const task = taskData?.task;
  const selectedVersion = taskData?.versions?.find((version) => String(version.id) === String(selectedVersionId));
  const isTaskActive = isRunning || task?.status === 'running';
  const hasFinishedTurn = Boolean(task) && !isTaskActive && task.status === 'ready';
  const inputLocked = isTaskActive;

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

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

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.warning(t('blog.agent.inputRequired'));
      return;
    }
    const submitted = input.trim();
    setInput('');
    setPreviewOpen(false);
    setSelectedResultId(null);
    await generate(submitted);
  };

  const handleRevise = async () => {
    if (!task?.id || !input.trim()) return;
    const submitted = input.trim();
    setInput('');
    await revise(task.id, submitted);
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
      navigate('/workspace/publish');
    } catch (error) {
      toast.error(error.message || t('blog.agent.failed'));
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleNewTask = () => {
    reset();
    setInput('');
    setPreviewOpen(false);
    setSelectedResultId(null);
    setSelectedVersionId(null);
    navigate('/workspace/agent', { replace: true });
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
      <AgentHeader
        t={t}
        onBack={() => navigate('/workspace/agent')}
        onNewTask={handleNewTask}
        onOpenSessions={() => setMobileSessionsOpen(true)}
      />

      {isTaskLoading ? (
        <LoadingSpinner fullScreen text={t('blog.agent.restoring')} />
      ) : (
        <div className="relative flex min-h-0 flex-1 overflow-hidden">
          <AgentSessionList
            sessions={sessions}
            activeId={taskId}
            loading={sessionsLoading}
            disableNew={isRunning}
            onSelect={(id) => navigate(`/workspace/agent/${id}`)}
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
                  navigate(`/workspace/agent/${id}`);
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

            <AgentChatInput
              t={t}
              input={input}
              setInput={setInput}
              isTaskActive={isTaskActive}
              hasFinishedTurn={hasFinishedTurn}
              inputLocked={inputLocked}
              onSubmit={handleSubmit}
            />
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

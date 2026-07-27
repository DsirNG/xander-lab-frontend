import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Download,
  History,
  ImagePlus,
  Loader2,
  Sparkles,
  Upload,
} from 'lucide-react';
import LoadingSpinner from '@components/common/LoadingSpinner';
import ThreeViewer from '../components/ThreeViewer';
import { img2threeService } from '../services/img2threeService';
import { authService } from '@features/auth/services/authService';
import { useToast } from '@/hooks/useToast';

const ACCEPTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const STAGE_KEYS = {
  analyze: 'stageAnalyze',
  spec: 'stageSpec',
  factory: 'stageFactory',
};

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const downloadText = (text, filename, mimeType = 'text/plain;charset=utf-8') => {
  downloadBlob(new Blob([text], { type: mimeType }), filename);
};

const parseStageEvent = (data) => {
  const raw = String(data ?? '');
  const [stage, message] = raw.split('|', 2);
  return { stage, message: message || stage };
};

const Img2ThreePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { taskId } = useParams();
  const toast = useToast();

  const [uploading, setUploading] = useState(false);
  const [running, setRunning] = useState(false);
  const [stageLabel, setStageLabel] = useState('');
  const [task, setTask] = useState(null);
  const [error, setError] = useState('');
  const [filePreviewUrl, setFilePreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [initialLoading, setInitialLoading] = useState(Boolean(taskId));
  const [dragActive, setDragActive] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyTasks, setHistoryTasks] = useState([]);

  const viewerApiRef = useRef(null);
  const streamStartedRef = useRef(false);
  const isRunningRef = useRef(false);
  isRunningRef.current = running;

  const stageText = useMemo(() => {
    if (stageLabel) return stageLabel;
    const stage = task?.stage;
    if (stage && STAGE_KEYS[stage]) return t(`img2three.${STAGE_KEYS[stage]}`);
    return '';
  }, [stageLabel, task?.stage, t]);

  const handleViewerReady = useCallback((api) => {
    viewerApiRef.current = api;
  }, []);

  const runStream = useCallback(async (id) => {
    if (isRunningRef.current) return;
    setRunning(true);
    setError('');
    streamStartedRef.current = true;
    let streamError = null;

    try {
      await img2threeService.runTaskStream(id, ({ event, data }) => {
        if (event === 'stage') {
          const { stage, message } = parseStageEvent(data);
          setStageLabel(message);
          setTask((current) => (current ? { ...current, stage, status: 'running' } : current));
        } else if (event === 'complete') {
          setTask(data);
          setStageLabel('');
        } else if (event === 'error') {
          streamError = typeof data === 'string' ? data : t('img2three.failed');
        }
      }, { _silent: true });

      if (streamError) throw new Error(streamError);
      toast.success(t('img2three.ready'));
    } catch (err) {
      const message = err?.message || t('img2three.failed');
      setError(message);
      try {
        const latest = await img2threeService.getTask(id, { _silent: true });
        setTask(latest);
      } catch {
        // keep original stream error
      }
      toast.error(message);
    } finally {
      setRunning(false);
    }
  }, [t, toast]);

  useEffect(() => {
    if (!authService.getLocalUserInfo()) {
      navigate('/login', { replace: true, state: { from: taskId ? `/lab/img2three/${taskId}` : '/lab/img2three' } });
    }
  }, [navigate, taskId]);

  useEffect(() => {
    if (!taskId) {
      setInitialLoading(false);
      setTask(null);
      setError('');
      setStageLabel('');
      streamStartedRef.current = false;
      return undefined;
    }

    if (isRunningRef.current) {
      setInitialLoading(false);
      return undefined;
    }

    let active = true;
    setInitialLoading(true);
    streamStartedRef.current = false;

    const loadTask = async () => {
      try {
        const data = await img2threeService.getTask(taskId, { _silent: true });
        if (!active) return;
        setTask(data);
        setError(data?.status === 'failed' ? (data.errorMessage || t('img2three.failed')) : '');
        if ((data?.status === 'created' || data?.status === 'running') && !streamStartedRef.current) {
          runStream(taskId);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || t('img2three.failed'));
          toast.error(err?.message || t('img2three.failed'));
        }
      } finally {
        if (active) setInitialLoading(false);
      }
    };

    loadTask();
    return () => { active = false; };
  }, [taskId, runStream, t, toast]);

  useEffect(() => () => {
    if (filePreviewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(filePreviewUrl);
    }
  }, [filePreviewUrl]);

  const validateAndSetFile = (file) => {
    if (!file || !ACCEPTED_IMAGE_TYPES.has(file.type)) {
      toast.warning(t('img2three.invalidImage'));
      return false;
    }
    setSelectedFile(file);
    setFilePreviewUrl((current) => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    setError('');
    return true;
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      toast.warning(t('img2three.chooseImage'));
      return;
    }
    setUploading(true);
    setError('');
    setStageLabel('');
    try {
      const created = await img2threeService.createTask(selectedFile);
      setTask(created);
      navigate(`/lab/img2three/${created.id}`, { replace: true });
      setUploading(false);
      await runStream(String(created.id));
    } catch (err) {
      setUploading(false);
      const message = err?.message || t('img2three.failed');
      setError(message);
      toast.error(message);
    }
  };

  const handleDownloadSpec = () => {
    if (!task?.sceneSpec) return;
    downloadText(JSON.stringify(task.sceneSpec, null, 2), 'spec.json', 'application/json;charset=utf-8');
  };

  const handleDownloadFactory = () => {
    if (!task?.factoryCode) return;
    downloadText(task.factoryCode, 'createModel.ts', 'text/typescript;charset=utf-8');
  };

  const handleDownloadGlb = async () => {
    try {
      const blob = await viewerApiRef.current?.exportGlb?.();
      if (!blob) throw new Error(t('img2three.failed'));
      downloadBlob(blob, `${task?.title || 'model'}.glb`);
    } catch (err) {
      toast.error(err?.message || t('img2three.failed'));
    }
  };

  const handleNewTask = () => {
    setSelectedFile(null);
    setFilePreviewUrl('');
    setTask(null);
    setError('');
    setStageLabel('');
    streamStartedRef.current = false;
    navigate('/lab/img2three', { replace: true });
  };

  const handleToggleHistory = async () => {
    const nextVisible = !historyVisible;
    setHistoryVisible(nextVisible);
    if (!nextVisible) return;
    setHistoryLoading(true);
    try {
      setHistoryTasks(await img2threeService.listTasks({ _silent: true }));
    } catch (err) {
      toast.error(err?.message || t('img2three.historyLoadFailed'));
    } finally {
      setHistoryLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner fullScreen text={t('img2three.restoring')} />;
  }

  const isReady = task?.status === 'ready' && task?.sceneSpec;
  const isBusy = uploading || running;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-caption font-semibold uppercase tracking-wide text-accent">{t('nav.img2three')}</p>
          <h1 className="mt-1 text-title font-bold text-ink">{t('img2three.title')}</h1>
          <p className="mt-2 max-w-2xl text-body text-ink-secondary">{t('img2three.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleToggleHistory}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink-secondary transition hover:border-accent hover:text-accent"
          >
            <History className="h-4 w-4" aria-hidden="true" />
            {t('img2three.history')}
          </button>
        {taskId ? (
          <button
            type="button"
            onClick={handleNewTask}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink-secondary transition hover:border-accent hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {t('img2three.newTask')}
          </button>
        ) : null}
        </div>
      </div>

      {historyVisible ? (
        <section className="mb-6 rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-body font-semibold text-ink">{t('img2three.history')}</h2>
            {historyLoading ? <Loader2 className="h-4 w-4 animate-spin text-accent" aria-label={t('img2three.historyLoading')} /> : null}
          </div>
          {!historyLoading && historyTasks.length === 0 ? <p className="text-caption text-ink-muted">{t('img2three.historyEmpty')}</p> : null}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {historyTasks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/lab/img2three/${item.id}`)}
                className="flex min-w-0 items-center gap-3 rounded-xl border border-border p-3 text-left transition hover:border-accent"
              >
                {item.referenceMediaUrl ? <img src={item.referenceMediaUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" /> : null}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{item.title || t('img2three.untitledTask')}</span>
                  <span className="mt-1 block text-caption text-ink-muted">{t(`img2three.status.${item.status}`, { defaultValue: item.status })}</span>
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {!taskId && !isReady ? (
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <label
            htmlFor="img2three-file"
            onDragEnter={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragActive(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              const file = event.dataTransfer.files?.[0];
              if (file) validateAndSetFile(file);
            }}
            className={`flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
              dragActive ? 'border-accent bg-accent-soft' : 'border-border bg-canvas hover:border-accent'
            }`}
          >
            {filePreviewUrl ? (
              <img
                src={filePreviewUrl}
                alt={t('img2three.preview')}
                className="mb-4 max-h-48 rounded-xl object-contain shadow-sm"
              />
            ) : (
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft text-accent">
                <ImagePlus className="h-8 w-8" aria-hidden="true" />
              </div>
            )}
            <p className="text-body font-semibold text-ink">{t('img2three.uploadHint')}</p>
            <p className="mt-2 text-caption text-ink-muted">{t('img2three.dropHint')}</p>
            <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white">
              <Upload className="h-4 w-4" aria-hidden="true" />
              {t('img2three.chooseImage')}
            </span>
            <input
              id="img2three-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) validateAndSetFile(file);
              }}
            />
          </label>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-caption text-ink-muted">{t('img2three.loginRequired')}</p>
            <button
              type="button"
              disabled={!selectedFile || isBusy}
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-fg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
              {isBusy ? t('img2three.generating') : t('img2three.generate')}
            </button>
          </div>
        </section>
      ) : null}

      {(isBusy || task?.status === 'running' || task?.status === 'created') && !isReady ? (
        <section className="mt-6 rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
          <LoadingSpinner size="md" text={stageText || t('img2three.generating')} />
          {task?.referenceMediaUrl || filePreviewUrl ? (
            <img
              src={task?.referenceMediaUrl || filePreviewUrl}
              alt={t('img2three.reference')}
              className="mx-auto mt-6 max-h-56 rounded-xl border border-border object-contain"
            />
          ) : null}
        </section>
      ) : null}

      {error && !isReady ? (
        <div className="mt-6 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {isReady ? (
        <section className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-title font-bold text-ink">{task.title || t('img2three.preview')}</h2>
              <p className="mt-1 text-caption text-ink-muted">{t('img2three.ready')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDownloadSpec}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink-secondary transition hover:border-accent hover:text-accent"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {t('img2three.downloadSpec')}
              </button>
              <button
                type="button"
                onClick={handleDownloadFactory}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink-secondary transition hover:border-accent hover:text-accent"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {t('img2three.downloadFactory')}
              </button>
              <button
                type="button"
                onClick={handleDownloadGlb}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white transition hover:bg-accent-fg"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {t('img2three.downloadGlb')}
              </button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <ThreeViewer
                sceneSpec={task.sceneSpec}
                className="h-[min(70vh,560px)] w-full"
                onReady={handleViewerReady}
              />
            </div>
            <aside className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-ink">{t('img2three.reference')}</h3>
              <img
                src={task.referenceMediaUrl || filePreviewUrl}
                alt={t('img2three.reference')}
                className="mt-3 w-full rounded-xl border border-border object-cover"
              />
            </aside>
          </div>
        </section>
      ) : null}

      <footer className="mt-10 border-t border-border pt-6 text-center text-caption text-ink-muted">
        <a
          href="https://github.com/img2threejs/img2threejs"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent hover:underline"
        >
          {t('img2three.attribution')}
        </a>
      </footer>
    </div>
  );
};

export default Img2ThreePage;

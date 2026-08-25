import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BookOpen, Brain, CheckCircle2, CirclePlus, Clock3, Mic, Sparkles, Square, Target } from 'lucide-react';
import Button from '@components/common/Button';
import CustomSelect from '@components/common/CustomSelect';
import FormField from '@components/common/FormField';
import LoadingSpinner from '@components/common/LoadingSpinner';
import Modal from '@components/common/Modal';
import { formInputCls } from '@components/common/formStyles';
import { knowledgeService } from '../services/knowledgeService';

const TERMINAL_ATTEMPT_STATUSES = new Set(['SUCCEEDED', 'FAILED']);

const KnowledgeMirrorPage = () => {
  const { t } = useTranslation();
  const { materialId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const attemptId = searchParams.get('attemptId');
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', knowledgeType: 'RECITATION', testMode: 'AUDIO_RECITATION' });
  const [attempt, setAttempt] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  const loadMaterials = useCallback(async (signal) => {
    try {
      const data = await knowledgeService.list({ signal, _silent: true });
      setMaterials(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadMaterials(controller.signal);
    return () => controller.abort();
  }, [loadMaterials]);

  useEffect(() => {
    if (!attemptId) {
      setAttempt(null);
      return undefined;
    }
    let active = true;
    let timer;
    const refresh = async () => {
      try {
        const next = await knowledgeService.getAttempt(attemptId, { _silent: true });
        if (!active) return;
        setAttempt(next);
        if (!TERMINAL_ATTEMPT_STATUSES.has(next.status)) timer = window.setTimeout(refresh, 2000);
        if (next.status === 'SUCCEEDED') loadMaterials();
      } catch {
        if (active) setAttempt(null);
      }
    };
    refresh();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [attemptId, loadMaterials]);

  useEffect(() => () => streamRef.current?.getTracks().forEach((track) => track.stop()), []);

  const activeMaterial = useMemo(
    () => materials.find((item) => String(item.id) === materialId) ?? materials[0] ?? null,
    [materialId, materials],
  );

  useEffect(() => {
    if (!materialId && materials.length > 0) navigate(`/workspace/knowledge/${materials[0].id}`, { replace: true });
  }, [materialId, materials, navigate]);

  // 概念题和练习题的成绩单由智能体判分后落库，切换知识时读一次最近记录。
  useEffect(() => {
    if (!activeMaterial || activeMaterial.testMode === 'AUDIO_RECITATION') {
      setQuizzes([]);
      return undefined;
    }
    let active = true;
    const controller = new AbortController();
    knowledgeService.listQuizzes(activeMaterial.id, { signal: controller.signal, _silent: true })
      .then((data) => { if (active) setQuizzes(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setQuizzes([]); });
    return () => {
      active = false;
      controller.abort();
    };
  }, [activeMaterial]);

  const stats = useMemo(() => {
    const mastered = materials.filter((item) => item.masteryLevel === 'MASTERED').length;
    const due = materials.filter((item) => item.nextReviewAt && new Date(item.nextReviewAt) <= new Date()).length;
    const average = materials.length
      ? Math.round(materials.reduce((sum, item) => sum + Number(item.masteryScore ?? 0), 0) / materials.length)
      : 0;
    return { mastered, learning: materials.length - mastered, due, average };
  }, [materials]);

  const createMaterial = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setCreating(true);
    try {
      const created = await knowledgeService.create(form);
      setMaterials((current) => [created, ...current]);
      setCreateOpen(false);
      setForm({ title: '', content: '', knowledgeType: 'RECITATION', testMode: 'AUDIO_RECITATION' });
      navigate(`/workspace/knowledge/${created.id}`);
      window.__toast?.('success', t('knowledge.created'));
    } finally {
      setCreating(false);
    }
  };

  const submitRecording = useCallback(async (blob) => {
    if (!activeMaterial) return;
    setUploading(true);
    try {
      const extension = blob.type.includes('ogg') ? 'ogg' : 'webm';
      const file = new File([blob], `recitation-${Date.now()}.${extension}`, { type: blob.type || 'audio/webm' });
      const created = await knowledgeService.uploadRecording(activeMaterial.id, file);
      setAttempt(created);
      setSearchParams({ attemptId: String(created.id) }, { replace: true });
    } finally {
      setUploading(false);
    }
  }, [activeMaterial, setSearchParams]);

  const requestMicrophone = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      window.__toast?.('error', t('knowledge.microphoneUnavailable'));
      return;
    }
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setPermissionBlocked(true);
      setPermissionOpen(true);
      return;
    }
    setPermissionOpen(false);
    streamRef.current = stream;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream);
    recorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      submitRecording(blob);
    };
    recorder.start();
    setRecording(true);
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      window.__toast?.('error', t('knowledge.microphoneUnavailable'));
      return;
    }
    try {
      const permission = await navigator.permissions?.query?.({ name: 'microphone' });
      if (permission?.state === 'granted') {
        await requestMicrophone();
        return;
      }
      setPermissionBlocked(permission?.state === 'denied');
    } catch {
      setPermissionBlocked(false);
    }
    setPermissionOpen(true);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  // 出题和判分都发生在对话里，所以这里只是带着一句开场白跳进智能体，由它调用 quiz_knowledge。
  const startAgentQuiz = () => {
    if (!activeMaterial) return;
    navigate(`/workspace/agent?q=${encodeURIComponent(t('knowledge.quizPrompt', { title: activeMaterial.title }))}`);
  };

  if (loading) return <LoadingSpinner fullScreen text={t('knowledge.loading')} />;

  const levelLabel = (level) => t(`knowledge.levels.${level || 'NEW'}`);
  const typeLabel = (type) => t(`knowledge.types.${type || 'RECITATION'}`);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-canvas p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-display text-ink">{t('knowledge.title')}</div>
            <div className="mt-1 text-body text-ink-muted">{t('knowledge.subtitle')}</div>
          </div>
          <Button icon={CirclePlus} onClick={() => setCreateOpen(true)}>{t('knowledge.add')}</Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [BookOpen, t('knowledge.stats.total'), materials.length],
            [Target, t('knowledge.stats.learning'), stats.learning],
            [CheckCircle2, t('knowledge.stats.mastered'), stats.mastered],
            [Brain, t('knowledge.stats.average'), `${stats.average}%`],
          ].map(([Icon, label, value]) => (
            <div key={label} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between text-ink-muted"><span className="text-caption">{label}</span><Icon className="h-4 w-4" /></div>
              <div className="mt-3 text-display text-ink">{value}</div>
            </div>
          ))}
        </div>

        {materials.length === 0 ? (
          <div className="grid min-h-80 place-items-center rounded-3xl border border-dashed border-border bg-surface p-8 text-center">
            <div><Brain className="mx-auto h-10 w-10 text-accent" /><div className="mt-4 text-title text-ink">{t('knowledge.empty')}</div><div className="mt-2 text-body text-ink-muted">{t('knowledge.emptyHint')}</div></div>
          </div>
        ) : (
          <div className="grid min-h-[520px] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-3xl border border-border bg-surface p-3">
              <div className="px-2 py-2 text-title text-ink">{t('knowledge.library')}</div>
              <div className="mt-1 space-y-2">
                {materials.map((item) => (
                  <button key={item.id} type="button" onClick={() => navigate(`/workspace/knowledge/${item.id}`)} className={`w-full rounded-2xl border p-3 text-left transition ${activeMaterial?.id === item.id ? 'border-accent bg-accent-soft' : 'border-transparent hover:border-border hover:bg-surface-muted'}`}>
                    <div className="flex items-start justify-between gap-2"><span className="text-body font-semibold text-ink">{item.title}</span><span className="rounded-full bg-canvas px-2 py-1 text-micro text-ink-muted">{item.masteryScore ?? 0}%</span></div>
                    <div className="mt-2 flex items-center justify-between text-caption text-ink-muted"><span>{typeLabel(item.knowledgeType)}</span><span>{levelLabel(item.masteryLevel)}</span></div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border"><div className="h-full rounded-full bg-accent" style={{ width: `${item.masteryScore ?? 0}%` }} /></div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-5">
                <div><div className="text-heading text-ink">{activeMaterial.title}</div><div className="mt-1 text-caption text-ink-muted">{typeLabel(activeMaterial.knowledgeType)} · {levelLabel(activeMaterial.masteryLevel)} · {t('knowledge.reviewCount', { count: activeMaterial.reviewCount ?? 0 })}</div></div>
                <div className="rounded-2xl bg-accent-soft px-4 py-2 text-center"><div className="text-micro text-accent">{t('knowledge.mastery')}</div><div className="text-heading text-accent">{activeMaterial.masteryScore ?? 0}%</div></div>
              </div>
              <div className="mt-5 rounded-2xl bg-surface-muted p-4"><div className="text-caption font-semibold text-ink-secondary">{t('knowledge.original')}</div><div className="mt-2 whitespace-pre-wrap text-body text-ink">{recording ? t('knowledge.originalHidden') : activeMaterial.content}</div></div>

              {activeMaterial.testMode === 'AUDIO_RECITATION' ? (
                <div className="mt-5 rounded-2xl border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-title text-ink">{t('knowledge.audioTest')}</div><div className="mt-1 text-caption text-ink-muted">{t('knowledge.audioHint')}</div></div>{recording ? <Button variant="danger" icon={Square} onClick={stopRecording}>{t('knowledge.stop')}</Button> : <Button icon={Mic} loading={uploading} onClick={startRecording}>{t('knowledge.start')}</Button>}</div>
                  {recording ? <div className="mt-4 flex items-center gap-2 text-body text-danger"><span className="h-2.5 w-2.5 animate-pulse rounded-full bg-danger" />{t('knowledge.recording')}</div> : null}
                </div>
              ) : (
                <AgentQuizPanel quiz={quizzes[0] ?? null} onStart={startAgentQuiz} />
              )}

              {attempt ? (
                <div className="mt-5 rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between gap-3"><div className="text-title text-ink">{t('knowledge.latestResult')}</div><span className="rounded-full bg-surface-muted px-3 py-1 text-caption text-ink-muted">{t(`knowledge.status.${attempt.status}`)}</span></div>
                  {attempt.status === 'SUCCEEDED' ? <div className="mt-4 grid gap-3 sm:grid-cols-4"><ResultStat label={t('knowledge.score')} value={`${attempt.score}%`} /><ResultStat label={t('knowledge.correct')} value={attempt.result?.correctCount ?? 0} /><ResultStat label={t('knowledge.missing')} value={attempt.result?.missingCount ?? 0} /><ResultStat label={t('knowledge.wrong')} value={attempt.result?.wrongCount ?? 0} /></div> : null}
                  {attempt.transcript ? <div className="mt-4 text-body text-ink-muted"><span className="font-semibold text-ink-secondary">{t('knowledge.transcript')}：</span>{attempt.transcript}</div> : null}
                  {attempt.errorMessage ? <div className="mt-4 text-body text-danger">{attempt.errorMessage}</div> : null}
                </div>
              ) : null}
              {activeMaterial.nextReviewAt ? <div className="mt-4 flex items-center gap-2 text-caption text-ink-muted"><Clock3 className="h-4 w-4" />{t('knowledge.nextReview', { time: new Date(activeMaterial.nextReviewAt).toLocaleString() })}</div> : null}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title={t('knowledge.createTitle')} width="max-w-2xl" footer={<><Button variant="ghost" onClick={() => setCreateOpen(false)}>{t('common.cancel')}</Button><Button type="submit" form="knowledge-create-form" loading={creating}>{t('knowledge.create')}</Button></>}>
        <form id="knowledge-create-form" className="space-y-4" onSubmit={createMaterial}>
          <FormField label={t('knowledge.form.title')} htmlFor="knowledge-title"><input id="knowledge-title" className={formInputCls} value={form.title} maxLength={100} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></FormField>
          <FormField label={t('knowledge.form.type')}><CustomSelect value={form.knowledgeType} onChange={(value) => setForm((current) => ({ ...current, knowledgeType: value, testMode: value === 'RECITATION' ? 'AUDIO_RECITATION' : value === 'MATH' ? 'PRACTICE' : 'AI_QA' }))} options={['RECITATION', 'CONCEPT', 'MATH'].map((value) => ({ value, label: typeLabel(value) }))} /></FormField>
          <FormField label={t('knowledge.form.content')} htmlFor="knowledge-content" hint={t('knowledge.form.contentHint')}><textarea id="knowledge-content" className={`${formInputCls} min-h-48 resize-y`} value={form.content} maxLength={10000} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} /></FormField>
        </form>
      </Modal>
      <Modal
        isOpen={permissionOpen}
        onClose={() => setPermissionOpen(false)}
        title={t('knowledge.permissionTitle')}
        width="max-w-md"
        footer={<><Button variant="ghost" onClick={() => setPermissionOpen(false)}>{t('common.cancel')}</Button><Button icon={Mic} onClick={requestMicrophone}>{t('knowledge.allowMicrophone')}</Button></>}
      >
        <div className="rounded-2xl bg-accent-soft p-4 text-body text-ink-secondary">
          {permissionBlocked ? t('knowledge.permissionBlockedHint') : t('knowledge.permissionHint')}
        </div>
        <div className="mt-4 text-caption text-ink-muted">{t('knowledge.permissionPrivacy')}</div>
      </Modal>
    </div>
  );
};

const ResultStat = ({ label, value }) => <div className="rounded-xl bg-surface-muted p-3"><div className="text-micro text-ink-muted">{label}</div><div className="mt-1 text-title text-ink">{value}</div></div>;

/**
 * 概念题与练习题的测验面板：一个进对话的入口，加上最近一次的逐题判分。
 *
 * 分数与逐题证据都来自服务端（智能体调用 grade_answer 时落库），这里只负责显示，
 * 不在前端重算总分——否则页面和掌握度统计就可能各说一套。
 */
export const AgentQuizPanel = ({ quiz = null, onStart }) => {
  const { t } = useTranslation();
  const items = Array.isArray(quiz?.items) ? quiz.items : [];
  const creditLabel = (credit) => {
    const value = Number(credit ?? 0);
    if (value >= 1) return t('knowledge.creditFull');
    return value > 0 ? t('knowledge.creditPartial') : t('knowledge.creditNone');
  };
  return (
    <div className="mt-5 rounded-2xl border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-title text-ink">{t('knowledge.agentTest')}</div>
          <div className="mt-1 text-caption text-ink-muted">{t('knowledge.agentTestHint')}</div>
        </div>
        <Button icon={Sparkles} onClick={onStart}>{t('knowledge.askAgentToQuiz')}</Button>
      </div>
      {quiz ? (
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-caption font-semibold text-ink-secondary">{t('knowledge.latestResult')}</div>
            {quiz.createdAt ? <span className="text-caption text-ink-muted">{t('knowledge.quizAt')}：{new Date(quiz.createdAt).toLocaleString()}</span> : null}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <ResultStat label={t('knowledge.score')} value={`${Math.round(Number(quiz.score ?? 0))}%`} />
            <ResultStat label={t('knowledge.correct')} value={`${quiz.correctCount ?? 0}/${quiz.questionCount ?? 0}`} />
          </div>
          {quiz.verdict ? <div className="mt-3 whitespace-pre-wrap text-body text-ink-muted">{quiz.verdict}</div> : null}
          {items.length > 0 ? (
            <ol className="mt-3 space-y-2">
              {items.map((item, index) => (
                <li key={index} className="rounded-xl bg-surface-muted p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-body text-ink">{item?.question}</span>
                    <span className="shrink-0 rounded-full bg-canvas px-2 py-1 text-micro text-ink-muted">{creditLabel(item?.credit)}</span>
                  </div>
                  {item?.userAnswer ? <div className="mt-2 text-caption text-ink-muted"><span className="font-semibold text-ink-secondary">{t('knowledge.yourAnswer')}：</span>{item.userAnswer}</div> : null}
                  {item?.comment ? <div className="mt-1 text-caption text-ink-muted">{item.comment}</div> : null}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 border-t border-border pt-4 text-body text-ink-muted">{t('knowledge.noQuizYet')}</div>
      )}
    </div>
  );
};

export default KnowledgeMirrorPage;

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    BookOpen,
    Brain,
    CheckCircle2,
    CirclePlus,
    Clock3,
    Target,
} from "lucide-react";
import Button from "@shared/ui/primitives/Button";
import LoadingSpinner from "@shared/ui/feedback/LoadingSpinner";
import KnowledgeAttemptResultPanel from "../components/KnowledgeAttemptResultPanel";
import KnowledgeAudioTestPanel from "../components/KnowledgeAudioTestPanel";
import KnowledgeDocBaseView from "../components/KnowledgeDocBaseView";
import KnowledgeEditorModal from "../components/KnowledgeEditorModal";
import KnowledgeActions from "../components/KnowledgeActions";
import KnowledgeMirrorMaterialList from "../components/KnowledgeMirrorMaterialList";
import AgentQuizPanel from "../components/AgentQuizPanel";
import { knowledgeService } from "../services/knowledgeService";
import { buildKnowledgeQuizPath } from "../utils/knowledgeNavigation";

const TERMINAL_ATTEMPT_STATUSES = new Set(["SUCCEEDED", "FAILED"]);
const ATTEMPT_POLL_INTERVAL_MS = 2000;
const ATTEMPT_POLL_RETRY_LIMIT = 3;
const EMPTY_FORM = {
    title: "",
    content: "",
    knowledgeType: "RECITATION",
    testMode: "AUDIO_RECITATION",
};

const newClientRequestId = () =>
    globalThis.crypto?.randomUUID?.() ??
    `recitation-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const KnowledgeMirrorPage = () => {
    const { t } = useTranslation();
    const { materialId } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const attemptId = searchParams.get("attemptId");
    const [activeTab, setActiveTab] = useState(materialId ? "MIRROR" : "DOCS");
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    // 归档视图是归档这个动作的另一半：没有它，归档就成了单向出口，用户再也拿不回内容。
    const [view, setView] = useState("ACTIVE");
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [attempt, setAttempt] = useState(null);
    const [attemptPollError, setAttemptPollError] = useState(false);
    const [attemptRetryVersion, setAttemptRetryVersion] = useState(0);
    const [quizzes, setQuizzes] = useState([]);
    const [recording, setRecording] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [permissionOpen, setPermissionOpen] = useState(false);
    const [permissionBlocked, setPermissionBlocked] = useState(false);
    const recorderRef = useRef(null);
    const streamRef = useRef(null);
    const chunksRef = useRef([]);

    const loadMaterials = useCallback(
        async (signal) => {
            try {
                const data = await knowledgeService.list(
                    view === "ARCHIVED" ? { archive: "ARCHIVED" } : undefined,
                    { signal, _silent: true },
                );
                const next = Array.isArray(data) ? data : [];
                setMaterials(next);
                setLoadError(false);
                return next;
            } catch (error) {
                if (!signal?.aborted) setLoadError(true);
                throw error;
            } finally {
                if (!signal?.aborted) setLoading(false);
            }
        },
        [view],
    );

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setLoadError(false);
        loadMaterials(controller.signal).catch(() => {});
        return () => controller.abort();
    }, [loadMaterials]);

    useEffect(() => {
        if (!attemptId) {
            setAttempt(null);
            return undefined;
        }
        let active = true;
        let timer;
        let retryCount = 0;
        setAttemptPollError(false);
        const refresh = async () => {
            try {
                const next = await knowledgeService.getAttempt(attemptId, {
                    _silent: true,
                });
                if (!active) return;
                setAttempt(next);
                setAttemptPollError(false);
                retryCount = 0;
                if (!TERMINAL_ATTEMPT_STATUSES.has(next.status)) {
                    timer = window.setTimeout(
                        refresh,
                        ATTEMPT_POLL_INTERVAL_MS,
                    );
                }
                if (next.status === "SUCCEEDED")
                    loadMaterials().catch(() => {});
            } catch {
                if (!active) return;
                setAttemptPollError(true);
                retryCount += 1;
                // 短暂网络抖动不能抹掉已经落库的任务；有限退避后停下，交给用户手动恢复。
                if (retryCount <= ATTEMPT_POLL_RETRY_LIMIT) {
                    const delay =
                        ATTEMPT_POLL_INTERVAL_MS * 2 ** (retryCount - 1);
                    timer = window.setTimeout(refresh, delay);
                }
            }
        };
        refresh();
        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [attemptId, attemptRetryVersion, loadMaterials]);

    useEffect(
        () => () =>
            streamRef.current?.getTracks().forEach((track) => track.stop()),
        [],
    );

    const activeMaterial = useMemo(
        () =>
            materials.find((item) => String(item.id) === materialId) ??
            materials[0] ??
            null,
        [materialId, materials],
    );

    useEffect(() => {
        if (materialId) {
            setActiveTab("MIRROR");
        }
    }, [materialId]);

    useEffect(() => {
        if (activeTab === "MIRROR" && !materialId && materials.length > 0)
            navigate(`/workspace/knowledge/${materials[0].id}`, {
                replace: true,
            });
    }, [activeTab, materialId, materials, navigate]);

    // 概念题和练习题的成绩单由智能体判分后落库，切换知识时读一次最近记录。
    useEffect(() => {
        if (!activeMaterial || activeMaterial.testMode === "AUDIO_RECITATION") {
            setQuizzes([]);
            return undefined;
        }
        let active = true;
        const controller = new AbortController();
        knowledgeService
            .listQuizzes(activeMaterial.id, {
                signal: controller.signal,
                _silent: true,
            })
            .then((data) => {
                if (active) setQuizzes(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                if (active) setQuizzes([]);
            });
        return () => {
            active = false;
            controller.abort();
        };
    }, [activeMaterial]);

    const stats = useMemo(() => {
        const mastered = materials.filter(
            (item) => item.masteryLevel === "MASTERED",
        ).length;
        const due = materials.filter(
            (item) =>
                item.nextReviewAt && new Date(item.nextReviewAt) <= new Date(),
        ).length;
        const average = materials.length
            ? Math.round(
                  materials.reduce(
                      (sum, item) => sum + Number(item.masteryScore ?? 0),
                      0,
                  ) / materials.length,
              )
            : 0;
        return {
            mastered,
            learning: materials.length - mastered,
            due,
            average,
        };
    }, [materials]);

    const openCreate = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setEditorOpen(true);
    };

    const openEdit = (material) => {
        setEditingId(material.id);
        setForm({
            title: material.title ?? "",
            content: material.content ?? "",
            knowledgeType: material.knowledgeType ?? "RECITATION",
            testMode: material.testMode ?? "AUDIO_RECITATION",
        });
        setEditorOpen(true);
    };

    const submitEditor = async (event) => {
        event.preventDefault();
        if (!form.title.trim() || !form.content.trim()) return;
        setSaving(true);
        try {
            if (editingId == null) {
                const created = await knowledgeService.create(form);
                setMaterials((current) => [created, ...current]);
                navigate(`/workspace/knowledge/${created.id}`);
                window.__toast?.("success", t("knowledge.created"));
            } else {
                // 服务端只写真正变了的字段，所以整份表单回传是安全的：没改的字段不会刷新 updated_at。
                const updated = await knowledgeService.update(editingId, form);
                setMaterials((current) =>
                    current.map((item) =>
                        item.id === updated.id ? updated : item,
                    ),
                );
                window.__toast?.("success", t("knowledge.updated"));
            }
            setEditorOpen(false);
            setEditingId(null);
            setForm(EMPTY_FORM);
        } finally {
            setSaving(false);
        }
    };

    const updateForm = (patch) =>
        setForm((current) => ({ ...current, ...patch }));

    // 归档、恢复和删除都会让这条知识离开当前视图，所以统一重新拉一次并把焦点交给第一条。
    const reloadAndFocusFirst = async () => {
        const next = await loadMaterials();
        navigate(
            next.length > 0
                ? `/workspace/knowledge/${next[0].id}`
                : "/workspace/knowledge",
            { replace: true },
        );
    };

    const archiveMaterial = async (material, archived) => {
        await knowledgeService.archive(material.id, archived);
        window.__toast?.(
            "success",
            t(archived ? "knowledge.archived" : "knowledge.restored"),
        );
        await reloadAndFocusFirst();
    };

    const deleteMaterial = async (material) => {
        await knowledgeService.remove(material.id);
        window.__toast?.("success", t("knowledge.deleted"));
        await reloadAndFocusFirst();
    };

    const submitRecording = useCallback(
        async (blob) => {
            if (!activeMaterial) return;
            setUploading(true);
            try {
                const extension = blob.type.includes("ogg") ? "ogg" : "webm";
                const file = new File(
                    [blob],
                    `recitation-${Date.now()}.${extension}`,
                    { type: blob.type || "audio/webm" },
                );
                const created = await knowledgeService.uploadRecording(
                    activeMaterial.id,
                    file,
                    newClientRequestId(),
                );
                setAttempt(created);
                setSearchParams(
                    { attemptId: String(created.id) },
                    { replace: true },
                );
            } finally {
                setUploading(false);
            }
        },
        [activeMaterial, setSearchParams],
    );

    const requestMicrophone = async () => {
        if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
            window.__toast?.("error", t("knowledge.microphoneUnavailable"));
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
            const blob = new Blob(chunksRef.current, {
                type: recorder.mimeType || "audio/webm",
            });
            stream.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
            submitRecording(blob);
        };
        recorder.start();
        setRecording(true);
    };

    const startRecording = async () => {
        if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
            window.__toast?.("error", t("knowledge.microphoneUnavailable"));
            return;
        }
        try {
            const permission = await navigator.permissions?.query?.({
                name: "microphone",
            });
            if (permission?.state === "granted") {
                await requestMicrophone();
                return;
            }
            setPermissionBlocked(permission?.state === "denied");
        } catch {
            setPermissionBlocked(false);
        }
        setPermissionOpen(true);
    };

    const stopRecording = () => {
        recorderRef.current?.stop();
        setRecording(false);
    };

    const retryAttempt = () => {
        setAttemptPollError(false);
        setAttemptRetryVersion((current) => current + 1);
    };

    // 出题和判分都发生在对话里，所以这里只是带着一句开场白跳进智能体，由它调用 quiz_knowledge。
    const startAgentQuiz = () => {
        if (!activeMaterial) return;
        navigate(buildKnowledgeQuizPath(t, activeMaterial));
    };

    if (activeTab === "MIRROR" && loading)
        return <LoadingSpinner fullScreen text={t("knowledge.loading")} />;

    if (activeTab === "MIRROR" && loadError && materials.length === 0) {
        return (
            <div className="grid h-full min-h-80 place-items-center bg-canvas p-6 text-center">
                <div className="max-w-md rounded-3xl border border-border bg-surface p-8">
                    <div className="text-heading text-ink">
                        {t("knowledge.loadErrorTitle")}
                    </div>
                    <div className="mt-2 text-body text-ink-muted">
                        {t("knowledge.loadErrorHint")}
                    </div>
                    <Button
                        className="mt-5"
                        onClick={() => {
                            setLoading(true);
                            loadMaterials().catch(() => {});
                        }}
                    >
                        {t("knowledge.retry")}
                    </Button>
                </div>
            </div>
        );
    }

    const levelLabel = (level) => t(`knowledge.levels.${level || "NEW"}`);
    const typeLabel = (type) => t(`knowledge.types.${type || "RECITATION"}`);

    return (
        <div
            className={`flex h-full min-h-0 flex-col ${
                activeTab === "DOCS" ? "overflow-hidden" : "overflow-y-auto bg-canvas p-3 sm:p-5 lg:p-6"
            }`}
        >
            <div className={`mx-auto flex h-full min-h-0 w-full ${activeTab === "DOCS" ? "flex-1" : "max-w-[1600px] gap-4"} flex-col`}>
                {/* 仅在 MIRROR 模式下展示模式切换与新建按钮 */}
                {activeTab === "MIRROR" ? (
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eef0f6] pb-4">
                        <div className="flex items-center gap-1.5 rounded-2xl bg-[#f4f5fa] p-1 shadow-2xs">
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveTab("DOCS");
                                    if (materialId)
                                        navigate("/workspace/knowledge", {
                                            replace: true,
                                        });
                                }}
                                className="flex items-center gap-2 rounded-xl px-4 py-2 text-caption font-semibold transition text-[#8e94ad] hover:text-[#111426] hover:bg-white/60"
                            >
                                <BookOpen className="h-4 w-4 text-[#6765f6]" />
                                <span>
                                    {t("knowledgeBase.tabDocs", "文档知识库")}
                                </span>
                            </button>
                            <button
                                type="button"
                                className="flex items-center gap-2 rounded-xl px-4 py-2 text-caption font-bold transition bg-white text-[#6765f6] shadow-xs"
                            >
                                <Brain className="h-4 w-4 text-[#6765f6]" />
                                <span>
                                    {t("knowledgeBase.tabMirror", "知识镜像 / 复习")}
                                </span>
                            </button>
                        </div>

                        <Button icon={CirclePlus} onClick={openCreate}>
                            {t("knowledge.add")}
                        </Button>
                    </div>
                ) : null}

                {activeTab === "DOCS" ? (
                    <KnowledgeDocBaseView onSwitchToMirror={() => setActiveTab("MIRROR")} />
                ) : (
                    <>
                        {loadError ? (
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-warning/30 bg-warning-soft p-3 text-body text-warning-fg">
                                <span>{t("knowledge.staleDataWarning")}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        loadMaterials().catch(() => {})
                                    }
                                >
                                    {t("knowledge.retry")}
                                </Button>
                            </div>
                        ) : null}
                        <div>
                            <div className="text-display text-ink">
                                {t("knowledge.title")}
                            </div>
                            <div className="mt-1 text-body text-ink-muted">
                                {t("knowledge.subtitle")}
                            </div>
                        </div>

                {view === "ACTIVE" ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {[
                            [
                                BookOpen,
                                t("knowledge.stats.total"),
                                materials.length,
                            ],
                            [
                                Target,
                                t("knowledge.stats.learning"),
                                stats.learning,
                            ],
                            [
                                CheckCircle2,
                                t("knowledge.stats.mastered"),
                                stats.mastered,
                            ],
                            [
                                Brain,
                                t("knowledge.stats.average"),
                                `${stats.average}%`,
                            ],
                        ].map(([Icon, label, value]) => (
                            <div
                                key={label}
                                className="rounded-2xl border border-border bg-surface p-4"
                            >
                                <div className="flex items-center justify-between text-ink-muted">
                                    <span className="text-caption">
                                        {label}
                                    </span>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="mt-3 text-display text-ink">
                                    {value}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : null}

                {view === "ACTIVE" && materials.length === 0 ? (
                    <div className="grid min-h-80 place-items-center rounded-3xl border border-dashed border-border bg-surface p-8 text-center">
                        <div>
                            <Brain className="mx-auto h-10 w-10 text-accent" />
                            <div className="mt-4 text-title text-ink">
                                {t("knowledge.empty")}
                            </div>
                            <div className="mt-2 text-body text-ink-muted">
                                {t("knowledge.emptyHint")}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid min-h-[520px] gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
                        <KnowledgeMirrorMaterialList
                            view={view}
                            materials={materials}
                            activeMaterial={activeMaterial}
                            onViewChange={setView}
                            onSelect={(id) =>
                                navigate(`/workspace/knowledge/${id}`)
                            }
                            typeLabel={typeLabel}
                            levelLabel={levelLabel}
                        />

                        {activeMaterial ? (
                            <div className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
                                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-5">
                                    <div>
                                        <div className="text-heading text-ink">
                                            {activeMaterial.title}
                                        </div>
                                        <div className="mt-1 text-caption text-ink-muted">
                                            {typeLabel(
                                                activeMaterial.knowledgeType,
                                            )}{" "}
                                            ·{" "}
                                            {levelLabel(
                                                activeMaterial.masteryLevel,
                                            )}{" "}
                                            ·{" "}
                                            {t("knowledge.reviewCount", {
                                                count:
                                                    activeMaterial.reviewCount ??
                                                    0,
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="rounded-2xl bg-accent-soft px-4 py-2 text-center">
                                            <div className="text-micro text-accent">
                                                {t("knowledge.mastery")}
                                            </div>
                                            <div className="text-heading text-accent">
                                                {activeMaterial.masteryScore ??
                                                    0}
                                                %
                                            </div>
                                        </div>
                                        <KnowledgeActions
                                            material={activeMaterial}
                                            onEdit={openEdit}
                                            onArchive={archiveMaterial}
                                            onDelete={deleteMaterial}
                                        />
                                    </div>
                                </div>
                                {activeMaterial.archivedAt ? (
                                    <div className="mt-4 rounded-2xl bg-surface-muted p-3 text-caption text-ink-muted">
                                        {t("knowledge.archivedNotice")}
                                    </div>
                                ) : null}
                                <div className="mt-5 rounded-2xl bg-surface-muted p-4">
                                    <div className="text-caption font-semibold text-ink-secondary">
                                        {t("knowledge.original")}
                                    </div>
                                    <div className="mt-2 whitespace-pre-wrap text-body text-ink">
                                        {recording
                                            ? t("knowledge.originalHidden")
                                            : activeMaterial.content}
                                    </div>
                                </div>

                                {activeMaterial.testMode ===
                                "AUDIO_RECITATION" ? (
                                    <KnowledgeAudioTestPanel
                                        recording={recording}
                                        uploading={uploading}
                                        permissionOpen={permissionOpen}
                                        permissionBlocked={permissionBlocked}
                                        onStart={startRecording}
                                        onStop={stopRecording}
                                        onClosePermission={() =>
                                            setPermissionOpen(false)
                                        }
                                        onRequestMicrophone={
                                            requestMicrophone
                                        }
                                    />
                                ) : (
                                    <AgentQuizPanel
                                        quiz={quizzes[0] ?? null}
                                        onStart={startAgentQuiz}
                                    />
                                )}

                                <KnowledgeAttemptResultPanel
                                    attempt={attempt}
                                    pollError={attemptPollError}
                                    onRetry={retryAttempt}
                                />
                                {activeMaterial.nextReviewAt ? (
                                    <div className="mt-4 flex items-center gap-2 text-caption text-ink-muted">
                                        <Clock3 className="h-4 w-4" />
                                        {t("knowledge.nextReview", {
                                            time: new Date(
                                                activeMaterial.nextReviewAt,
                                            ).toLocaleString(),
                                        })}
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <div className="grid place-items-center rounded-3xl border border-dashed border-border bg-surface p-8 text-center text-body text-ink-muted">
                                {t("knowledge.archivedEmptyHint")}
                            </div>
                        )}
                    </div>
                )}
                    </>
                )}
            </div>

            <KnowledgeEditorModal
                isOpen={editorOpen}
                onClose={() => setEditorOpen(false)}
                editingId={editingId}
                form={form}
                onFormChange={updateForm}
                onSubmit={submitEditor}
                saving={saving}
                typeLabel={typeLabel}
            />
        </div>
    );
};

export default KnowledgeMirrorPage;

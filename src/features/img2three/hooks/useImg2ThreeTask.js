import { useCallback, useEffect, useRef, useState } from "react";
import { img2threeService } from "../services/img2threeService";

const STAGE_KEYS = {
    analyze: "stageAnalyze",
    spec: "stageSpec",
    factory: "stageFactory",
};

const parseStageEvent = (data) => {
    const raw = String(data ?? "");
    const [stage, message] = raw.split("|", 2);
    return { stage, message: message || stage };
};

/**
 * Owns the task lifecycle for image-to-3D generation.
 * File selection, history, and viewer controls stay with the page.
 */
const useImg2ThreeTask = ({ taskId, t, navigate, toast }) => {
    const [uploading, setUploading] = useState(false);
    const [running, setRunning] = useState(false);
    const [recovering, setRecovering] = useState(false);
    const [stageLabel, setStageLabel] = useState("");
    const [task, setTask] = useState(null);
    const [error, setError] = useState("");
    const [initialLoading, setInitialLoading] = useState(Boolean(taskId));

    const startedStreamTaskIdsRef = useRef(new Set());
    const activeStreamTaskIdRef = useRef(null);
    const isRunningRef = useRef(false);
    isRunningRef.current = running;

    const stageText =
        stageLabel ||
        (task?.stage && STAGE_KEYS[task.stage]
            ? t(`img2three.${STAGE_KEYS[task.stage]}`)
            : "");

    const runStream = useCallback(
        async (id) => {
            const normalizedId = String(id || "");
            if (
                !normalizedId ||
                startedStreamTaskIdsRef.current.has(normalizedId)
            )
                return;
            if (
                activeStreamTaskIdRef.current &&
                activeStreamTaskIdRef.current !== normalizedId
            )
                return;

            startedStreamTaskIdsRef.current.add(normalizedId);
            activeStreamTaskIdRef.current = normalizedId;
            isRunningRef.current = true;
            setRunning(true);
            setError("");
            let streamError = null;

            try {
                await img2threeService.runTaskStream(
                    normalizedId,
                    ({ event, data }) => {
                        if (event === "stage") {
                            const { stage, message } = parseStageEvent(data);
                            setStageLabel(message);
                            setTask((current) =>
                                current
                                    ? { ...current, stage, status: "running" }
                                    : current,
                            );
                        } else if (event === "complete") {
                            setTask(data);
                            setStageLabel("");
                        } else if (event === "error") {
                            streamError =
                                typeof data === "string"
                                    ? data
                                    : t("img2three.failed");
                        }
                    },
                    { _silent: true },
                );

                if (streamError) throw new Error(streamError);
                toast.success(t("img2three.ready"));
            } catch (err) {
                let latest = null;
                try {
                    latest = await img2threeService.getTask(normalizedId, {
                        _silent: true,
                    });
                    setTask(latest);
                } catch {
                    // keep original stream error
                }
                if (latest?.status === "running") {
                    setError("");
                    return;
                }
                if (latest?.status === "ready") {
                    setError("");
                    setStageLabel("");
                    toast.success(t("img2three.ready"));
                    return;
                }
                const message =
                    latest?.errorMessage ||
                    err?.message ||
                    t("img2three.failed");
                setError(message);
                toast.error(message);
            } finally {
                if (activeStreamTaskIdRef.current === normalizedId) {
                    activeStreamTaskIdRef.current = null;
                    isRunningRef.current = false;
                }
                setRunning(false);
            }
        },
        [t, toast],
    );

    useEffect(() => {
        if (!taskId) {
            setInitialLoading(false);
            setTask(null);
            setError("");
            setStageLabel("");
            return undefined;
        }

        if (isRunningRef.current) {
            setInitialLoading(false);
            return undefined;
        }

        let active = true;
        setInitialLoading(true);

        const loadTask = async () => {
            try {
                const data = await img2threeService.getTask(taskId, {
                    _silent: true,
                });
                if (!active) return;
                setTask(data);
                setError(
                    data?.status === "failed"
                        ? data.errorMessage || t("img2three.failed")
                        : "",
                );
                if (data?.status === "created") runStream(taskId);
            } catch (err) {
                if (active) {
                    setError(err?.message || t("img2three.failed"));
                    toast.error(err?.message || t("img2three.failed"));
                }
            } finally {
                if (active) setInitialLoading(false);
            }
        };

        loadTask();
        return () => {
            active = false;
        };
    }, [taskId, runStream, t, toast]);

    useEffect(() => {
        if (!taskId || task?.status !== "running" || running) return undefined;

        let active = true;
        let timerId;
        setRecovering(true);
        setError("");

        const poll = async () => {
            try {
                while (active) {
                    await new Promise((resolve) => {
                        timerId = window.setTimeout(resolve, 2000);
                    });
                    if (!active) return;

                    const latest = await img2threeService.getTask(taskId, {
                        _silent: true,
                    });
                    if (!active) return;
                    setTask(latest);

                    if (latest?.status === "ready") {
                        setStageLabel("");
                        toast.success(t("img2three.ready"));
                        return;
                    }
                    if (latest?.status === "failed") {
                        const message =
                            latest.errorMessage || t("img2three.failed");
                        setError(message);
                        toast.error(message);
                        return;
                    }
                    if (latest?.status !== "running") return;
                }
            } catch (err) {
                if (!active) return;
                const message = err?.message || t("img2three.failed");
                setError(message);
                toast.error(message);
            } finally {
                if (active) setRecovering(false);
            }
        };

        poll();
        return () => {
            active = false;
            window.clearTimeout(timerId);
            setRecovering(false);
        };
    }, [running, task?.status, taskId, t, toast]);

    const startTask = useCallback(
        async (file) => {
            setUploading(true);
            setError("");
            setStageLabel("");
            try {
                const created = await img2threeService.createTask(file);
                setTask(created);
                const streamPromise = runStream(String(created.id));
                navigate(`/workspace/img2three/${created.id}`, {
                    replace: true,
                });
                setUploading(false);
                await streamPromise;
            } catch (err) {
                setUploading(false);
                const message = err?.message || t("img2three.failed");
                setError(message);
                toast.error(message);
            }
        },
        [navigate, runStream, t, toast],
    );

    const resetTask = useCallback(() => {
        setTask(null);
        setError("");
        setStageLabel("");
        setUploading(false);
        setInitialLoading(false);
    }, []);

    const clearError = useCallback(() => setError(""), []);

    return {
        task,
        error,
        stageText,
        uploading,
        running,
        recovering,
        initialLoading,
        startTask,
        resetTask,
        clearError,
    };
};

export default useImg2ThreeTask;

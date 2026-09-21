import { useCallback, useEffect, useRef, useState } from "react";
import { knowledgeService } from "../services/knowledgeService";

const newClientRequestId = () =>
    globalThis.crypto?.randomUUID?.() ??
    `recitation-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function useKnowledgeRecorder({
    materialId,
    onAttemptCreated,
    t,
}) {
    const [recording, setRecording] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [permissionOpen, setPermissionOpen] = useState(false);
    const [permissionBlocked, setPermissionBlocked] = useState(false);
    const recorderRef = useRef(null);
    const streamRef = useRef(null);
    const chunksRef = useRef([]);

    const submitRecording = useCallback(
        async (blob) => {
            if (!materialId) return;
            setUploading(true);
            try {
                const extension = blob.type.includes("ogg") ? "ogg" : "webm";
                const file = new File(
                    [blob],
                    `recitation-${Date.now()}.${extension}`,
                    { type: blob.type || "audio/webm" },
                );
                const created = await knowledgeService.uploadRecording(
                    materialId,
                    file,
                    newClientRequestId(),
                );
                onAttemptCreated(created);
            } finally {
                setUploading(false);
            }
        },
        [materialId, onAttemptCreated],
    );

    const requestMicrophone = useCallback(async () => {
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
    }, [submitRecording, t]);

    const startRecording = useCallback(async () => {
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
    }, [requestMicrophone, t]);

    const stopRecording = useCallback(() => {
        recorderRef.current?.stop();
        setRecording(false);
    }, []);

    useEffect(
        () => () => {
            recorderRef.current?.stop();
            streamRef.current?.getTracks().forEach((track) => track.stop());
        },
        [],
    );

    return {
        recording,
        uploading,
        permissionOpen,
        permissionBlocked,
        requestMicrophone,
        startRecording,
        stopRecording,
        setPermissionOpen,
    };
}

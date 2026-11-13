import { useEffect, useRef, useState } from "react";
import { Check, Copy, Pencil, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "@shared/ui/primitives/Button";

export default function AgentMessageActions({
    content,
    role,
    isStreaming,
    onEdit,
    onRegenerate,
}) {
    const { t } = useTranslation();
    const [status, setStatus] = useState("");
    const [speaking, setSpeaking] = useState(false);
    const pending = useRef(false);

    useEffect(() => {
        if (status !== "copied" && status !== "error") return;
        const timer = window.setTimeout(() => setStatus(""), 2000);
        return () => window.clearTimeout(timer);
    }, [status]);

    useEffect(() => {
        return () => window.speechSynthesis?.cancel();
    }, []);

    if (!content || isStreaming) return null;

    const copy = async () => {
        if (pending.current) return;
        pending.current = true;
        setStatus("pending");
        try {
            await navigator.clipboard.writeText(content);
            setStatus("copied");
        } catch {
            setStatus("error");
        } finally {
            pending.current = false;
        }
    };

    const toggleSpeech = () => {
        if (!window.speechSynthesis) return;
        if (speaking) {
            window.speechSynthesis.cancel();
            setSpeaking(false);
            return;
        }
        const utterance = new SpeechSynthesisUtterance(content);
        utterance.lang = document.documentElement.lang || "zh-CN";
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        setSpeaking(true);
    };

    const label = t(status === "copied" ? "common.copied" : "common.copy");
    return (
        <div
            className={`mt-1 flex items-center gap-1 ${role === "user" ? "justify-end" : "justify-start"}`}
        >
            <Button
                variant="ghost"
                size="xs"
                icon={status === "copied" ? Check : Copy}
                loading={status === "pending"}
                onClick={copy}
                aria-label={label}
                title={label}
            />
            {role === "assistant" && onRegenerate ? (
                <Button
                    variant="ghost"
                    size="xs"
                    icon={RotateCcw}
                    onClick={() => onRegenerate(content)}
                    aria-label={t("blog.agentChat.regenerate")}
                    title={t("blog.agentChat.regenerate")}
                />
            ) : null}
            {role === "assistant" && window.speechSynthesis ? (
                <Button
                    variant="ghost"
                    size="xs"
                    icon={speaking ? VolumeX : Volume2}
                    onClick={toggleSpeech}
                    aria-label={t(
                        speaking
                            ? "blog.agentChat.stopReading"
                            : "blog.agentChat.readAloud",
                    )}
                    title={t(
                        speaking
                            ? "blog.agentChat.stopReading"
                            : "blog.agentChat.readAloud",
                    )}
                />
            ) : null}
            {role === "user" && onEdit ? (
                <Button
                    variant="ghost"
                    size="xs"
                    icon={Pencil}
                    onClick={() => onEdit(content)}
                    aria-label={t("blog.agentChat.editMessage")}
                    title={t("blog.agentChat.editMessage")}
                />
            ) : null}
            <span
                role="status"
                className={
                    status === "error" ? "text-caption text-danger" : "sr-only"
                }
            >
                {status === "error"
                    ? t("common.copyFailed")
                    : status === "copied"
                      ? label
                      : ""}
            </span>
        </div>
    );
}

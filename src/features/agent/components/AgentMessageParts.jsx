import { useTranslation } from "react-i18next";
import {
    Ban,
    Check,
    Circle,
    CircleDot,
    Image as ImageIcon,
    ListChecks,
    Sparkles,
} from "lucide-react";
import QuizCardStack from "./QuizCardStack";
import { parseQuizPayload } from "./quizPayload";
import ArtifactCard from "./ArtifactCard";
import { parseArtifactPayload } from "./artifactPayload";

export { default as ImageToolResult } from "./ImageToolResult";

const PLAN_STATUS = {
    DONE: {
        Icon: Check,
        tone: "text-emerald-600",
        label: "planDone",
        strike: true,
    },
    IN_PROGRESS: {
        Icon: CircleDot,
        tone: "text-orange-500",
        label: "planInProgress",
        strike: false,
    },
    DROPPED: {
        Icon: Ban,
        tone: "text-ink-faint",
        label: "planDropped",
        strike: true,
    },
    PENDING: {
        Icon: Circle,
        tone: "text-ink-faint",
        label: "planPending",
        strike: false,
    },
};

export const PlanCard = ({ items = [] }) => {
    const { t } = useTranslation();
    if (items.length === 0) return null;

    return (
        <div className="rounded-xl border border-border bg-canvas px-3 py-2.5 text-xs leading-5">
            <div className="flex items-center gap-2 font-semibold text-ink-secondary">
                <ListChecks
                    className="h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                />
                <span>{t("blog.agentChat.planTitle")}</span>
            </div>
            <ol className="mt-1.5 flex flex-col gap-1">
                {items.map((item, index) => {
                    const status =
                        PLAN_STATUS[item?.status] || PLAN_STATUS.PENDING;
                    const { Icon } = status;
                    return (
                        <li
                            key={`${index}-${item?.title ?? ""}`}
                            className="flex items-start gap-2 text-ink-muted"
                        >
                            <Icon
                                className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${status.tone}`}
                                aria-hidden="true"
                            />
                            <span className="min-w-0">
                                <span
                                    className={
                                        status.strike
                                            ? "line-through opacity-70"
                                            : ""
                                    }
                                >
                                    {item?.title}
                                </span>
                                <span className="sr-only">{` (${t(`blog.agentChat.${status.label}`)})`}</span>
                                {item?.note ? (
                                    <span className="text-ink-faint">{` — ${item.note}`}</span>
                                ) : null}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
};

export const ImageToolProgressPanel = ({ message }) => {
    const { t } = useTranslation();
    return (
        <div
            className="relative flex h-64 w-64 flex-col overflow-hidden rounded-[2rem] bg-surface-muted p-5 sm:h-80 sm:w-80 sm:p-6"
            role="status"
            aria-live="polite"
        >
            <div
                className="absolute inset-0 animate-pulse opacity-10"
                style={{
                    backgroundImage:
                        "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)",
                    backgroundSize: "24px 24px",
                }}
                aria-hidden="true"
            />
            <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-ink/5 blur-3xl" />
            <div className="relative z-10 flex items-center gap-1.5 text-sm font-semibold text-ink-secondary">
                <Sparkles
                    className="h-4 w-4 animate-pulse text-ink-muted"
                    aria-hidden="true"
                />
                <span>{message || t("blog.agentChat.generatingImage")}</span>
                <span
                    className="ml-1 mt-1 flex items-center gap-0.5"
                    aria-hidden="true"
                >
                    {[0, 1, 2].map((index) => (
                        <span
                            key={index}
                            className="h-1 w-1 animate-bounce rounded-full bg-current opacity-70"
                            style={{ animationDelay: `${index * 150}ms` }}
                        />
                    ))}
                </span>
            </div>
            <div className="relative z-10 flex flex-1 items-center justify-center">
                <ImageIcon
                    className="h-12 w-12 animate-pulse text-ink-faint"
                    aria-hidden="true"
                />
            </div>
        </div>
    );
};

export const ThinkingIndicator = ({ label }) => (
    <div
        className="flex justify-start"
        role="status"
        aria-live="polite"
        aria-label={label}
    >
        <div
            className="inline-flex min-h-8 items-center gap-1 px-1"
            aria-hidden="true"
        >
            {[0, 1, 2].map((index) => (
                <span
                    key={index}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted"
                    style={{ animationDelay: `${index * 140}ms` }}
                />
            ))}
        </div>
    </div>
);

export const QuizMessage = ({ message, onSubmit }) => {
    const payload = parseQuizPayload(message);
    return payload ? (
        <QuizCardStack payload={payload} onSubmit={onSubmit} />
    ) : null;
};

/** 交付卡消息：正文是 JSON，解析失败就不渲染，绝不把裸 JSON 糊在对话里。 */
export const ArtifactMessage = ({ message }) => {
    const payload = parseArtifactPayload(message);
    return payload ? <ArtifactCard payload={payload} /> : null;
};

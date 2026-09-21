import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import Button from "@shared/ui/primitives/Button";

export const ResultStat = ({ label, value }) => (
    <div className="rounded-xl bg-surface-muted p-3">
        <div className="text-micro text-ink-muted">{label}</div>
        <div className="mt-1 text-title text-ink">{value}</div>
    </div>
);

/**
 * 概念题与练习题的测验面板：一个进对话的入口，加上最近一次的逐题判分。
 *
 * 分数与逐题证据都来自服务端（智能体调用 grade_answer 时落库），这里只负责显示，
 * 不在前端重算总分——否则页面和掌握度统计就可能各说一套。
 */
const AgentQuizPanel = ({ quiz = null, onStart }) => {
    const { t } = useTranslation();
    const items = Array.isArray(quiz?.items) ? quiz.items : [];
    const creditLabel = (credit) => {
        const value = Number(credit ?? 0);
        if (value >= 1) return t("knowledge.creditFull");
        return value > 0
            ? t("knowledge.creditPartial")
            : t("knowledge.creditNone");
    };
    return (
        <div className="mt-5 rounded-2xl border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div className="text-title text-ink">
                        {t("knowledge.agentTest")}
                    </div>
                    <div className="mt-1 text-caption text-ink-muted">
                        {t("knowledge.agentTestHint")}
                    </div>
                </div>
                <Button icon={Sparkles} onClick={onStart}>
                    {t("knowledge.askAgentToQuiz")}
                </Button>
            </div>
            {quiz ? (
                <div className="mt-4 border-t border-border pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-caption font-semibold text-ink-secondary">
                            {t("knowledge.latestResult")}
                        </div>
                        {quiz.createdAt ? (
                            <span className="text-caption text-ink-muted">
                                {t("knowledge.quizAt")}：
                                {new Date(quiz.createdAt).toLocaleString()}
                            </span>
                        ) : null}
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <ResultStat
                            label={t("knowledge.score")}
                            value={`${Math.round(Number(quiz.score ?? 0))}%`}
                        />
                        <ResultStat
                            label={t("knowledge.correct")}
                            value={`${quiz.correctCount ?? 0}/${quiz.questionCount ?? 0}`}
                        />
                    </div>
                    {quiz.verdict ? (
                        <div className="mt-3 whitespace-pre-wrap text-body text-ink-muted">
                            {quiz.verdict}
                        </div>
                    ) : null}
                    {items.length > 0 ? (
                        <ol className="mt-3 space-y-2">
                            {items.map((item, index) => (
                                <li
                                    key={index}
                                    className="rounded-xl bg-surface-muted p-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-body text-ink">
                                            {item?.question}
                                        </span>
                                        <span className="shrink-0 rounded-full bg-canvas px-2 py-1 text-micro text-ink-muted">
                                            {creditLabel(item?.credit)}
                                        </span>
                                    </div>
                                    {item?.userAnswer ? (
                                        <div className="mt-2 text-caption text-ink-muted">
                                            <span className="font-semibold text-ink-secondary">
                                                {t("knowledge.yourAnswer")}：
                                            </span>
                                            {item.userAnswer}
                                        </div>
                                    ) : null}
                                    {item?.comment ? (
                                        <div className="mt-1 text-caption text-ink-muted">
                                            {item.comment}
                                        </div>
                                    ) : null}
                                </li>
                            ))}
                        </ol>
                    ) : null}
                </div>
            ) : (
                <div className="mt-4 border-t border-border pt-4 text-body text-ink-muted">
                    {t("knowledge.noQuizYet")}
                </div>
            )}
        </div>
    );
};

export default AgentQuizPanel;

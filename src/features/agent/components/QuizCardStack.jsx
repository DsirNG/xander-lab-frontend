import React, { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CircleAlert, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const normalizeQuiz = (payload) => {
    const questions = Array.isArray(payload?.questions) ? payload.questions : [];
    return {
        id: payload?.id || payload?.quizId || "quiz",
        title: payload?.title || "",
        questions: questions.map((question, index) => ({
            id: question.id || `question-${index + 1}`,
            prompt: question.prompt || question.question || "",
            type: question.type || "single",
            options: Array.isArray(question.options)
                ? question.options.map((option, optionIndex) =>
                      typeof option === "string"
                          ? { value: option, label: option }
                          : { value: option.value ?? option.id ?? optionIndex, label: option.label ?? option.text ?? "" },
                  )
                : [],
        })),
    };
};

export const QuizCardStack = ({ payload, onSubmit }) => {
    const { t } = useTranslation();
    const quiz = useMemo(() => normalizeQuiz(payload), [payload]);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);

    if (!quiz.questions.length) return null;

    const question = quiz.questions[current];
    const answer = answers[question.id];
    const answeredCount = Object.keys(answers).length;
    const isLast = current === quiz.questions.length - 1;

    const updateAnswer = (value) => {
        if (submitted) return;
        setAnswers((existing) => ({ ...existing, [question.id]: value }));
    };

    const toggleMultiple = (value) => {
        const values = Array.isArray(answer) ? answer : [];
        updateAnswer(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
    };

    const submit = () => {
        if (submitted) return;
        setSubmitted(true);
        onSubmit?.({
            type: "submit_quiz",
            quiz_id: quiz.id,
            answers: quiz.questions.map((item) => ({
                question_id: item.id,
                answer: answers[item.id] ?? null,
            })),
        });
    };

    return (
        <section className="my-2 w-full max-w-2xl" aria-label={quiz.title || t("blog.agentChat.quizTitle")}>
            <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div className="min-w-0">
                    <div className="text-title text-ink">{quiz.title || t("blog.agentChat.quizTitle")}</div>
                    <div className="mt-1 text-caption text-ink-muted">
                        {t("blog.agentChat.quizProgress", { current: current + 1, total: quiz.questions.length })}
                    </div>
                </div>
                <div className="shrink-0 text-caption text-ink-muted">
                    {t("blog.agentChat.quizAnswered", { count: answeredCount, total: quiz.questions.length })}
                </div>
            </div>

            <div className="relative min-h-[22rem] overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-7">
                <div className="pointer-events-none absolute inset-x-5 top-0 h-1 rounded-b-full bg-accent/70" />
                <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-accent-soft text-caption font-semibold text-accent-fg">
                        {String(current + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1 text-body font-semibold leading-6 text-ink">
                        {question.prompt}
                    </div>
                </div>

                {question.options.length ? (
                    <div className="mt-7 grid gap-2.5">
                        {question.options.map((option, index) => {
                            const selected = Array.isArray(answer)
                                ? answer.includes(option.value)
                                : answer === option.value;
                            return (
                                <button
                                    key={`${question.id}-${option.value}`}
                                    type="button"
                                    disabled={submitted}
                                    onClick={() => question.type === "multiple" ? toggleMultiple(option.value) : updateAnswer(option.value)}
                                    className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 text-left text-body transition ${selected ? "border-accent bg-accent-soft text-accent-fg" : "border-border bg-canvas text-ink-secondary hover:border-border-strong hover:bg-surface-muted"} disabled:cursor-default`}
                                >
                                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border text-caption font-semibold ${selected ? "border-accent bg-accent text-white" : "border-border-strong bg-surface text-ink-muted"}`}>
                                        {selected ? <Check className="h-4 w-4" /> : LETTERS[index] || index + 1}
                                    </span>
                                    <span className="min-w-0 flex-1">{option.label}</span>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <textarea
                        value={answer || ""}
                        disabled={submitted}
                        onChange={(event) => updateAnswer(event.target.value)}
                        placeholder={t("blog.agentChat.quizAnswerPlaceholder")}
                        className="mt-7 min-h-28 w-full resize-y rounded-xl border border-border bg-canvas p-3 text-body text-ink outline-none focus:border-accent"
                    />
                )}

                {submitted ? (
                    <div className="mt-6 flex items-center gap-2 rounded-xl bg-success-soft px-3 py-2 text-caption font-semibold text-success-fg">
                        <Check className="h-4 w-4" />
                        {t("blog.agentChat.quizSubmitted")}
                    </div>
                ) : null}
            </div>

            <div className="mt-3 flex items-center justify-between gap-2">
                <button type="button" onClick={() => setCurrent((value) => Math.max(0, value - 1))} disabled={current === 0} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-caption font-semibold text-ink-muted hover:bg-surface-muted disabled:opacity-40" aria-label={t("blog.agentChat.quizPrevious")}>
                    <ArrowLeft className="h-4 w-4" /> {t("blog.agentChat.quizPrevious")}
                </button>
                {isLast ? (
                    <button type="button" onClick={submit} disabled={submitted} className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-body font-semibold text-white hover:bg-ink-secondary disabled:opacity-50">
                        <Send className="h-4 w-4" /> {t("blog.agentChat.quizSubmit")}
                    </button>
                ) : (
                    <button type="button" onClick={() => setCurrent((value) => Math.min(quiz.questions.length - 1, value + 1))} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-caption font-semibold text-ink hover:bg-surface-muted">
                        {t("blog.agentChat.quizNext")} <ArrowRight className="h-4 w-4" />
                    </button>
                )}
            </div>
            {answeredCount < quiz.questions.length && !submitted ? (
                <div className="mt-2 flex items-center justify-end gap-1 text-micro text-ink-muted">
                    <CircleAlert className="h-3.5 w-3.5" /> {t("blog.agentChat.quizUnanswered", { count: quiz.questions.length - answeredCount })}
                </div>
            ) : null}
        </section>
    );
};

export default QuizCardStack;

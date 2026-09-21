import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Button from "@shared/ui/primitives/Button";
import { ResultStat } from "./AgentQuizPanel";

const KnowledgeAttemptResultPanel = ({ attempt, pollError, onRetry }) => {
    const { t } = useTranslation();

    if (!attempt && !pollError) return null;

    return (
        <div className="mt-5 rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between gap-3">
                <div className="text-title text-ink">
                    {t("knowledge.latestResult")}
                </div>
                {attempt ? (
                    <span className="rounded-full bg-surface-muted px-3 py-1 text-caption text-ink-muted">
                        {t(`knowledge.status.${attempt.status}`)}
                    </span>
                ) : null}
            </div>
            {attempt?.status === "SUCCEEDED" ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <ResultStat
                        label={t("knowledge.score")}
                        value={`${attempt.score}%`}
                    />
                    <ResultStat
                        label={t("knowledge.correct")}
                        value={attempt.result?.correctCount ?? 0}
                    />
                    <ResultStat
                        label={t("knowledge.missing")}
                        value={attempt.result?.missingCount ?? 0}
                    />
                    <ResultStat
                        label={t("knowledge.wrong")}
                        value={attempt.result?.wrongCount ?? 0}
                    />
                </div>
            ) : null}
            {attempt?.transcript ? (
                <div className="mt-4 text-body text-ink-muted">
                    <span className="font-semibold text-ink-secondary">
                        {t("knowledge.transcript")}：
                    </span>
                    {attempt.transcript}
                </div>
            ) : null}
            {attempt?.errorMessage ? (
                <div className="mt-4 text-body text-danger">
                    {attempt.errorMessage}
                </div>
            ) : null}
            {pollError ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-warning-soft p-3 text-caption text-warning-fg">
                    <span>{t("knowledge.attemptPollError")}</span>
                    <Button variant="outline" size="sm" onClick={onRetry}>
                        {t("knowledge.retryAttempt")}
                    </Button>
                </div>
            ) : null}
        </div>
    );
};

KnowledgeAttemptResultPanel.propTypes = {
    attempt: PropTypes.shape({
        status: PropTypes.string,
        score: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        result: PropTypes.shape({
            correctCount: PropTypes.number,
            missingCount: PropTypes.number,
            wrongCount: PropTypes.number,
        }),
        transcript: PropTypes.string,
        errorMessage: PropTypes.string,
    }),
    pollError: PropTypes.bool.isRequired,
    onRetry: PropTypes.func.isRequired,
};

export default KnowledgeAttemptResultPanel;

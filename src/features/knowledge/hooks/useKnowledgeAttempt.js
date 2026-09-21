import { useCallback, useEffect, useState } from "react";
import { knowledgeService } from "../services/knowledgeService";

const TERMINAL_ATTEMPT_STATUSES = new Set(["SUCCEEDED", "FAILED"]);
const ATTEMPT_POLL_INTERVAL_MS = 2000;
const ATTEMPT_POLL_RETRY_LIMIT = 3;

/**
 * Owns the async attempt lifecycle shown by the knowledge mirror page.
 * The page only composes the result with the recorder and detail panel.
 */
const useKnowledgeAttempt = ({ attemptId, loadMaterials }) => {
    const [attempt, setAttempt] = useState(null);
    const [attemptPollError, setAttemptPollError] = useState(false);
    const [attemptRetryVersion, setAttemptRetryVersion] = useState(0);

    useEffect(() => {
        if (!attemptId) {
            setAttempt(null);
            setAttemptPollError(false);
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

    const registerAttempt = useCallback((nextAttempt) => {
        setAttempt(nextAttempt);
        setAttemptPollError(false);
    }, []);

    const retryAttempt = useCallback(() => {
        setAttemptPollError(false);
        setAttemptRetryVersion((current) => current + 1);
    }, []);

    return {
        attempt,
        attemptPollError,
        registerAttempt,
        retryAttempt,
    };
};

export default useKnowledgeAttempt;

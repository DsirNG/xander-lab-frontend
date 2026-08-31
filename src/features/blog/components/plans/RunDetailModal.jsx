import { useTranslation } from "react-i18next";
import Modal from "@components/common/Modal";

const Row = ({ label, children }) => (
    <div className="flex items-start justify-between gap-6 py-2 text-sm">
        <span className="shrink-0 text-ink-faint">{label}</span>
        <span className="break-all text-right text-ink-secondary">
            {children || "—"}
        </span>
    </div>
);

/**
 * 执行记录详情弹窗
 */
const RunDetailModal = ({ isOpen, run, onClose }) => {
    const { t } = useTranslation();
    if (!run) return null;

    const error =
        run.errorMessage ||
        (run.reviewPass === false ? run.reviewReason : "") ||
        run.csdnErrorMessage ||
        run.juejinErrorMessage;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t("blogPlans.runDetailTitle")}
            width="max-w-lg"
        >
            <div className="divide-y divide-border">
                <Row label={t("blogPlans.status")}>
                    {t(`blogPlans.runStatus.${run.status}`) || run.status}
                </Row>
                <Row label={t("blogPlans.triggerType")}>
                    {run.triggerType === "MANUAL"
                        ? t("blogPlans.triggerManual")
                        : t("blogPlans.triggerAuto")}
                </Row>
                <Row label={t("blogPlans.scheduledAt")}>
                    {run.scheduledAt
                        ? new Date(run.scheduledAt).toLocaleString()
                        : "—"}
                </Row>
                <Row label={t("blogPlans.startedAt")}>
                    {run.startedAt
                        ? new Date(run.startedAt).toLocaleString()
                        : "—"}
                </Row>
                <Row label={t("blogPlans.finishedAt")}>
                    {run.finishedAt
                        ? new Date(run.finishedAt).toLocaleString()
                        : "—"}
                </Row>
                <Row label={t("blogPlans.agentTaskId")}>{run.agentTaskId}</Row>
                <Row label={t("blogPlans.reviewResult")}>
                    {run.reviewPass == null
                        ? "—"
                        : run.reviewPass
                          ? t("blogPlans.reviewPassed")
                          : t("blogPlans.reviewRejected")}
                </Row>
                {run.reviewPass === false && run.reviewReason && (
                    <Row label={t("blogPlans.reviewReason")}>
                        {run.reviewReason}
                    </Row>
                )}
                <Row label="CSDN">{run.csdnStatus || "—"}</Row>
                {run.csdnExternalId && (
                    <Row label={t("blogPlans.csdnExternalId")}>
                        {run.csdnExternalId}
                    </Row>
                )}
                {run.csdnErrorCode && (
                    <Row label={t("blogPlans.csdnErrorCode")}>
                        {run.csdnErrorCode}
                    </Row>
                )}
                <Row label={t("blogPlans.juejin")}>
                    {run.juejinStatus || "—"}
                </Row>
                {run.juejinExternalId && (
                    <Row label={t("blogPlans.juejinExternalId")}>
                        {run.juejinExternalId}
                    </Row>
                )}
                {run.juejinErrorCode && (
                    <Row label={t("blogPlans.juejinErrorCode")}>
                        {run.juejinErrorCode}
                    </Row>
                )}
                {run.localPostId && (
                    <Row label={t("blogPlans.localPost")}>
                        <a
                            href={`/blog/${run.localPostId}`}
                            className="text-accent hover:underline"
                        >
                            #{run.localPostId}
                        </a>
                    </Row>
                )}
                {run.csdnUrl && (
                    <Row label={t("blogPlans.csdnLink")}>
                        <a
                            href={run.csdnUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                        >
                            CSDN
                        </a>
                    </Row>
                )}
                {run.juejinUrl && (
                    <Row label={t("blogPlans.juejinLink")}>
                        <a
                            href={run.juejinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                        >
                            {t("blogPlans.juejin")}
                        </a>
                    </Row>
                )}
                {error && (
                    <Row label={t("blogPlans.error")}>
                        <span className="text-red-600 dark:text-red-400">
                            {error}
                        </span>
                    </Row>
                )}
            </div>
        </Modal>
    );
};

export default RunDetailModal;

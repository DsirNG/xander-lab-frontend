import PropTypes from "prop-types";
import { Mic, Square } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "@shared/ui/primitives/Button";
import Modal from "@shared/ui/overlays/Modal";

const KnowledgeAudioTestPanel = ({
    recording,
    uploading,
    permissionOpen,
    permissionBlocked,
    onStart,
    onStop,
    onClosePermission,
    onRequestMicrophone,
}) => {
    const { t } = useTranslation();

    return (
        <>
            <div className="mt-5 rounded-2xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="text-title text-ink">
                            {t("knowledge.audioTest")}
                        </div>
                        <div className="mt-1 text-caption text-ink-muted">
                            {t("knowledge.audioHint")}
                        </div>
                    </div>
                    {recording ? (
                        <Button variant="danger" icon={Square} onClick={onStop}>
                            {t("knowledge.stop")}
                        </Button>
                    ) : (
                        <Button
                            icon={Mic}
                            loading={uploading}
                            onClick={onStart}
                        >
                            {t("knowledge.start")}
                        </Button>
                    )}
                </div>
                {recording ? (
                    <div className="mt-4 flex items-center gap-2 text-body text-danger">
                        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-danger" />
                        {t("knowledge.recording")}
                    </div>
                ) : null}
            </div>
            <Modal
                isOpen={permissionOpen}
                onClose={onClosePermission}
                title={t("knowledge.permissionTitle")}
                width="max-w-md"
                footer={
                    <>
                        <Button variant="ghost" onClick={onClosePermission}>
                            {t("common.cancel")}
                        </Button>
                        <Button icon={Mic} onClick={onRequestMicrophone}>
                            {t("knowledge.allowMicrophone")}
                        </Button>
                    </>
                }
            >
                <div className="rounded-2xl bg-accent-soft p-4 text-body text-ink-secondary">
                    {permissionBlocked
                        ? t("knowledge.permissionBlockedHint")
                        : t("knowledge.permissionHint")}
                </div>
                <div className="mt-4 text-caption text-ink-muted">
                    {t("knowledge.permissionPrivacy")}
                </div>
            </Modal>
        </>
    );
};

KnowledgeAudioTestPanel.propTypes = {
    recording: PropTypes.bool.isRequired,
    uploading: PropTypes.bool.isRequired,
    permissionOpen: PropTypes.bool.isRequired,
    permissionBlocked: PropTypes.bool.isRequired,
    onStart: PropTypes.func.isRequired,
    onStop: PropTypes.func.isRequired,
    onClosePermission: PropTypes.func.isRequired,
    onRequestMicrophone: PropTypes.func.isRequired,
};

export default KnowledgeAudioTestPanel;

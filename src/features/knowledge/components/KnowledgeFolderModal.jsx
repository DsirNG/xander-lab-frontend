import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Modal from "@shared/ui/overlays/Modal";
import Button from "@shared/ui/primitives/Button";
import FormField from "@shared/ui/forms/FormField";
import { formInputCls } from "@shared/ui/forms/formStyles";

/**
 * 新建 / 重命名文件夹弹窗
 */
const KnowledgeFolderModal = ({
    isOpen,
    onClose,
    onSubmit,
    folder = null,
    parentId = 0,
    loading = false,
}) => {
    const { t } = useTranslation();
    const [name, setName] = useState("");

    const submittingRef = useRef(false);
    const [submitting, setSubmitting] = useState(false);
    const busy = loading || submitting;
    const isEdit = Boolean(folder);

    useEffect(() => {
        if (isOpen) {
            setName(folder?.name || "");
        }
    }, [isOpen, folder]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed || busy || submittingRef.current) return;
        submittingRef.current = true;
        setSubmitting(true);
        try {
            await onSubmit({
                id: folder?.id,
                parentId: folder ? folder.parentId : parentId,
                name: trimmed,
            });
        } finally {
            submittingRef.current = false;
            setSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                if (!submittingRef.current && !loading) onClose();
            }}
            title={
                isEdit
                    ? t("knowledgeBase.folders.renameTitle", "重命名文件夹")
                    : t("knowledgeBase.folders.createTitle", "新建文件夹")
            }
            width="max-w-md"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={busy}>
                        {t("common.cancel", "取消")}
                    </Button>
                    <Button
                        type="submit"
                        form="folder-form"
                        loading={busy}
                        disabled={!name.trim()}
                    >
                        {t("common.confirm", "确定")}
                    </Button>
                </>
            }
        >
            <form
                id="folder-form"
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <FormField
                    label={t("knowledgeBase.folders.nameLabel", "文件夹名称")}
                    required
                >
                    <input
                        type="text"
                        className={formInputCls}
                        placeholder={t(
                            "knowledgeBase.folders.namePlaceholder",
                            "例如：机器学习、前端规范",
                        )}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        maxLength={120}
                    />
                </FormField>
            </form>
        </Modal>
    );
};

KnowledgeFolderModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    folder: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        parentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    parentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    loading: PropTypes.bool,
};

export default KnowledgeFolderModal;

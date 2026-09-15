import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Modal from "@components/common/Modal";
import Button from "@components/common/Button";
import FormField from "@components/common/FormField";
import { formInputCls } from "@components/common/formStyles";

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

    const isEdit = Boolean(folder);

    useEffect(() => {
        if (isOpen) {
            setName(folder?.name || "");
        }
    }, [isOpen, folder]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) return;
        await onSubmit({
            id: folder?.id,
            parentId: folder ? folder.parentId : parentId,
            name: trimmed,
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                isEdit
                    ? t("knowledgeBase.folders.renameTitle", "重命名文件夹")
                    : t("knowledgeBase.folders.createTitle", "新建文件夹")
            }
            width="max-w-md"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        {t("common.cancel", "取消")}
                    </Button>
                    <Button
                        type="submit"
                        form="folder-form"
                        loading={loading}
                        disabled={!name.trim()}
                    >
                        {t("common.confirm", "确定")}
                    </Button>
                </>
            }
        >
            <form id="folder-form" onSubmit={handleSubmit} className="space-y-4">
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

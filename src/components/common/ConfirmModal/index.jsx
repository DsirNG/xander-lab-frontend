import React from "react";
import { useTranslation } from "react-i18next";
import Modal from "@components/common/Modal";
import Button from "@components/common/Button";

/**
 * 二次确认弹窗（删除、退出登录等危险操作）
 */
const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    children,
    confirmText,
    cancelText,
    confirming = false,
    danger = true,
    closeOnOutsideClick = true,
}) => {
    const { t } = useTranslation();
    const resolvedConfirm = confirmText || t("common.confirm");
    const resolvedCancel = cancelText || t("common.cancel");

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                if (!confirming) onClose?.();
            }}
            title={title}
            width="max-w-sm"
            closeOnOutsideClick={closeOnOutsideClick && !confirming}
            hideCloseButton={confirming}
            footer={
                <>
                    <Button
                        onClick={onClose}
                        disabled={confirming}
                        variant="ghost"
                        size="lg"
                    >
                        {resolvedCancel}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        loading={confirming}
                        variant={danger ? "danger" : "ink"}
                        size="lg"
                    >
                        {resolvedConfirm}
                    </Button>
                </>
            }
        >
            {children || (
                <div className="text-body font-medium leading-relaxed text-ink-muted">
                    {message}
                </div>
            )}
        </Modal>
    );
};

export default ConfirmModal;

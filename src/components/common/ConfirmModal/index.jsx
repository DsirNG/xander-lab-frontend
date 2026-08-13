import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Modal from '@components/common/Modal';

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
    const resolvedConfirm = confirmText || t('common.confirm');
    const resolvedCancel = cancelText || t('common.cancel');

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
            footer={(
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={confirming}
                        className="rounded-xl px-5 py-2.5 text-caption font-bold text-ink-muted transition hover:bg-surface-muted disabled:opacity-50"
                    >
                        {resolvedCancel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={confirming}
                        className={`inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-caption font-bold text-white transition active:scale-95 disabled:opacity-60 ${
                            danger
                                ? 'bg-danger shadow-lg shadow-danger/20 hover:bg-danger-fg'
                                : 'bg-ink hover:bg-accent'
                        }`}
                    >
                        {confirming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                        {resolvedConfirm}
                    </button>
                </>
            )}
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

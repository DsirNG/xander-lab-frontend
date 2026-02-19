import React, { useContext } from 'react';
import { createPortal } from 'react-dom';
import { ToastContext } from './ToastContext';
import ToastItem from './ToastItem';

const ToastContainer = () => {
    const { toasts, remove } = useContext(ToastContext);

    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-3 pointer-events-none w-full max-w-md px-6">
            {toasts.map((toast) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    onRemove={() => remove(toast.id)}
                />
            ))}
        </div>,
        document.body
    );
};

export default ToastContainer;

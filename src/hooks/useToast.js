import { useContext, useMemo } from "react";
import ToastContext from "../components/common/Toast/toastContextValue";

/**
 * 返回稳定的 toast 方法对象。
 * 方法引用由 ToastProvider 的 toastApi useMemo 保证稳定，
 * 因此依赖 toast 的组件不会因 toast 列表增删而被重复触发。
 */
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    const { success, error, info, warning, remove } = context;
    return useMemo(
        () => ({ success, error, info, warning, remove }),
        [success, error, info, warning, remove],
    );
};

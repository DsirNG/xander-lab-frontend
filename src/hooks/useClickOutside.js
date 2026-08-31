import { useEffect } from "react";

/**
 * 点击元素外部时触发回调的 hook
 * @param {React.RefObject} ref - 目标元素的 ref
 * @param {Function} callback - 点击外部时的回调
 * @param {boolean} enabled - 是否启用监听，默认 true
 */
const useClickOutside = (ref, callback, enabled = true) => {
    useEffect(() => {
        if (!enabled) return;

        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback(event);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [ref, callback, enabled]);
};

export default useClickOutside;

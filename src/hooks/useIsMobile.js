import { useState, useEffect } from "react";

/**
 * 响应式移动端检测 hook
 * 使用 window.matchMedia 替代 resize 事件监听，性能更优
 * @param {number} breakpoint - 断点宽度，默认 1024
 * @returns {boolean} 是否为移动端视口
 */
const useIsMobile = (breakpoint = 1024) => {
    const [isMobile, setIsMobile] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth < breakpoint : false,
    );

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
        const handler = (e) => setIsMobile(e.matches);

        // 初始同步
        setIsMobile(mql.matches);

        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, [breakpoint]);

    return isMobile;
};

export default useIsMobile;

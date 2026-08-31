import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PureReadingContext from "./pureReadingContextValue";

export const PureReadingProvider = ({ children }) => {
    const [isPureReading, setIsPureReading] = useState(false);
    const location = useLocation();

    // 路由切换时自动重置纯净阅读状态
    useEffect(() => {
        setIsPureReading(false);
    }, [location.pathname]);

    // Esc 键按键监听：按下 Esc 键时退出纯净阅读模式
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape" && isPureReading) {
                setIsPureReading(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isPureReading]);

    const togglePureReading = () => setIsPureReading((prev) => !prev);

    return (
        <PureReadingContext.Provider
            value={{
                isPureReading,
                setIsPureReading,
                togglePureReading,
            }}
        >
            {children}
        </PureReadingContext.Provider>
    );
};

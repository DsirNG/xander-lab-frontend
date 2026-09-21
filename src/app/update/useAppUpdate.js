import { useCallback, useEffect, useState } from "react";
import { get } from "@api/http";
import { APP_UPDATE_EVENT, requireAppUpdate } from "./appUpdate";

const CHECK_INTERVAL_MS = 2 * 60 * 1000;

export default function useAppUpdate() {
    const [updateRequired, setUpdateRequired] = useState(false);

    const checkVersion = useCallback(async () => {
        try {
            const manifest = await get(
                "/version.json",
                { t: Date.now() },
                {
                    baseURL: "",
                    _silent: true,
                    _skipRetry: true,
                    dedupe: false,
                    withToken: false,
                    headers: {
                        Accept: "application/json",
                        "Cache-Control": "no-cache",
                    },
                },
            );
            if (
                manifest.version &&
                manifest.version !== import.meta.env.VITE_APP_VERSION
            ) {
                requireAppUpdate();
            }
        } catch {
            // A temporary network failure is not evidence that a new version exists.
        }
    }, []);

    useEffect(() => {
        const handleUpdateRequired = () => setUpdateRequired(true);
        const handlePreloadError = (event) => {
            event.preventDefault();
            requireAppUpdate();
        };
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") checkVersion();
        };

        window.addEventListener(APP_UPDATE_EVENT, handleUpdateRequired);
        window.addEventListener("vite:preloadError", handlePreloadError);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        const intervalId = window.setInterval(checkVersion, CHECK_INTERVAL_MS);
        checkVersion();

        return () => {
            window.removeEventListener(APP_UPDATE_EVENT, handleUpdateRequired);
            window.removeEventListener("vite:preloadError", handlePreloadError);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            );
            window.clearInterval(intervalId);
        };
    }, [checkVersion]);

    return updateRequired;
}

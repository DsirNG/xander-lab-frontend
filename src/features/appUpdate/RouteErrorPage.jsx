import { useEffect } from "react";
import { useRouteError } from "react-router-dom";
import { isChunkLoadError, requireAppUpdate } from "./appUpdate";

export default function RouteErrorPage() {
    const error = useRouteError();

    useEffect(() => {
        if (isChunkLoadError(error)) requireAppUpdate();
    }, [error]);

    if (isChunkLoadError(error)) return null;
    throw error;
}

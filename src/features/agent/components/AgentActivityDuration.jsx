import { useEffect, useState } from "react";
import { formatActivityDuration } from "../utils/formatActivityDuration";

const AgentActivityDuration = ({ startedAt, durationMs, active = false }) => {
    const [now, setNow] = useState(0);

    useEffect(() => {
        if (!startedAt) return undefined;
        setNow(Date.now());
        if (!active) return undefined;
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, [active, startedAt]);

    const elapsed = Number.isFinite(durationMs)
        ? durationMs
        : startedAt
          ? Math.max(0, now - startedAt)
          : null;

    if (elapsed == null) return null;
    return <span>{formatActivityDuration(elapsed)}</span>;
};

export default AgentActivityDuration;

export const formatActivityDuration = (durationMs) => {
    const totalSeconds = Math.max(0, Math.floor((durationMs || 0) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
};

export const APP_UPDATE_EVENT = "app:update-required";

const CHUNK_ERROR_PATTERNS = [
    "Failed to fetch dynamically imported module",
    "Importing a module script failed",
    "ChunkLoadError",
];

export const isChunkLoadError = (error) => {
    const message =
        error instanceof Error ? error.message : String(error ?? "");
    return CHUNK_ERROR_PATTERNS.some((pattern) => message.includes(pattern));
};

export const requireAppUpdate = () => {
    window.dispatchEvent(new CustomEvent(APP_UPDATE_EVENT));
};

export const reloadApp = () => {
    window.location.reload();
};

(() => {
    const storageKey = "dinqor.workspace.theme";
    let themeMode = "system";

    try {
        const stored = window.localStorage.getItem(storageKey);
        if (["light", "dark", "system"].includes(stored)) {
            themeMode = stored;
        }
    } catch {
        // Keep the system preference when local storage is unavailable.
    }

    let prefersDark = false;
    try {
        prefersDark =
            window.matchMedia?.("(prefers-color-scheme: dark)").matches ??
            false;
    } catch {
        // Fall back to the light theme when matchMedia is unavailable.
    }

    const resolvedTheme =
        themeMode === "system" ? (prefersDark ? "dark" : "light") : themeMode;
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
})();

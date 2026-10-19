/** Keeps text-only paste native; file paste uses the same upload validation as the picker. */
export function pasteAttachments(event, { input, onInputChange, onFilesSelected }) {
    const clipboard = event.clipboardData;
    if (!clipboard) return;
    let files = Array.from(clipboard.files || []);
    if (!files.length) {
        files = Array.from(clipboard.items || [])
            .filter((item) => item.kind === "file")
            .map((item) => item.getAsFile())
            .filter(Boolean);
    }
    if (!files.length) return;
    event.preventDefault();
    const text = clipboard.getData("text/plain");
    if (text) {
        const start = event.currentTarget.selectionStart ?? input.length;
        const end = event.currentTarget.selectionEnd ?? start;
        onInputChange(`${input.slice(0, start)}${text}${input.slice(end)}`);
    }
    void onFilesSelected(files);
}

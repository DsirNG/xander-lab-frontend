import { useSyncExternalStore } from "react";

const STORAGE_KEY = "agent.replyLanguage";
const CHANGE_EVENT = "agent:reply-language-change";
export const REPLY_LANGUAGES = ["auto", "zh", "en"];

export function getReplyLanguage() {
    try {
        const value = window.localStorage.getItem(STORAGE_KEY);
        return REPLY_LANGUAGES.includes(value) ? value : "auto";
    } catch {
        return "auto";
    }
}

export function setReplyLanguage(value) {
    if (!REPLY_LANGUAGES.includes(value)) return;
    try {
        window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
        return;
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(listener) {
    const onStorage = (event) => {
        if (event.key === STORAGE_KEY || event.key === null) listener();
    };
    window.addEventListener(CHANGE_EVENT, listener);
    window.addEventListener("storage", onStorage);
    return () => {
        window.removeEventListener(CHANGE_EVENT, listener);
        window.removeEventListener("storage", onStorage);
    };
}

export function useReplyLanguage() {
    return useSyncExternalStore(subscribe, getReplyLanguage, () => "auto");
}

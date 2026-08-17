/**
 * 博客发布页本地存储助手
 * Blog Publish Storage Helpers
 * @module features/blog/services/publishStorage
 * @author DinQorAI Team
 * @created 2026-08-13
 */

export const DRAFT_STORAGE_KEY = 'xander-lab:blog-publish-draft';
export const PUBLISH_REQUEST_STORAGE_KEY = 'xander-lab:blog-publish-request';

export const createPublishRequestId = () => globalThis.crypto?.randomUUID?.()
    || `publish-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const loadDraft = () => {
    try {
        const draft = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY));
        if (draft && typeof draft === 'object') {
            return { ...draft, tags: Array.isArray(draft.tags) ? draft.tags : [] };
        }
        return null;
    } catch {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        return null;
    }
};

export const saveDraft = (formData) => {
    try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
        return true;
    } catch (error) {
        console.error('Failed to save blog draft:', error);
        return false;
    }
};

export const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
};

export const getPublishRequestId = () => localStorage.getItem(PUBLISH_REQUEST_STORAGE_KEY);

export const ensurePublishRequestId = () => {
    let requestId = getPublishRequestId();
    if (!requestId) {
        requestId = createPublishRequestId();
        localStorage.setItem(PUBLISH_REQUEST_STORAGE_KEY, requestId);
    }
    return requestId;
};

export const clearPublishRequestId = () => {
    localStorage.removeItem(PUBLISH_REQUEST_STORAGE_KEY);
};
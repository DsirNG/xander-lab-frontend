import { useCallback, useEffect, useRef, useState } from "react";
import { loadDraft, saveDraft, clearDraft } from "../services/publishStorage";

const EMPTY_FORM = {
    title: "",
    categoryId: "",
    summary: "",
    content: "",
    tags: [],
};
const AUTO_SAVE_DEBOUNCE_MS = 3000;

/**
 * 博客发布页表单状态：字段管理、校验、本地草稿恢复与自动保存
 */
const usePublishForm = ({ isEditMode }) => {
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [draftStatus, setDraftStatus] = useState("none");
    const [isDraftStatusVisible, setIsDraftStatusVisible] = useState(false);

    const disabledRef = useRef(false);
    const isEditModeRef = useRef(isEditMode);
    const saveTimerRef = useRef(null);
    const latestFormRef = useRef(formData);

    useEffect(() => {
        isEditModeRef.current = isEditMode;
    }, [isEditMode]);

    useEffect(() => {
        latestFormRef.current = formData;
    }, [formData]);

    const setField = useCallback((field, value) => {
        setFormData((current) => ({ ...current, [field]: value }));
    }, []);

    const resetFromPost = useCallback((post) => {
        setFormData({
            title: post.title || "",
            categoryId: post.category != null ? String(post.category) : "",
            summary: post.summary || "",
            content: post.content || "",
            tags: Array.isArray(post.tags) ? post.tags : [],
        });
    }, []);

    const setDefaultCategory = useCallback((value) => {
        if (!value) return;
        setFormData((current) => ({
            ...current,
            categoryId: current.categoryId || value,
        }));
    }, []);

    useEffect(() => {
        if (isEditMode) return;
        const draft = loadDraft();
        if (draft) {
            setFormData((current) => ({ ...current, ...draft }));
            setDraftStatus("restored");
            setIsDraftStatusVisible(true);
        }
    }, [isEditMode]);

    useEffect(() => {
        if (isEditMode || disabledRef.current) return;
        const isEmpty =
            !formData.title &&
            !formData.summary &&
            !formData.content &&
            formData.tags.length === 0;
        if (isEmpty) return;
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
            if (saveDraft(formData)) {
                setDraftStatus("saved");
                setIsDraftStatusVisible(true);
            }
        }, AUTO_SAVE_DEBOUNCE_MS);
        return () => clearTimeout(saveTimerRef.current);
    }, [formData, isEditMode]);

    useEffect(
        () => () => {
            clearTimeout(saveTimerRef.current);
            if (!disabledRef.current && !isEditModeRef.current) {
                const isEmpty =
                    !latestFormRef.current.title &&
                    !latestFormRef.current.summary &&
                    !latestFormRef.current.content &&
                    latestFormRef.current.tags.length === 0;
                if (!isEmpty) saveDraft(latestFormRef.current);
            }
        },
        [],
    );

    const consumeDraft = useCallback(() => {
        disabledRef.current = true;
        clearDraft();
        setIsDraftStatusVisible(false);
        setDraftStatus("none");
    }, []);

    return {
        formData,
        setField,
        resetFromPost,
        setDefaultCategory,
        draftStatus,
        isDraftStatusVisible,
        consumeDraft,
    };
};

export default usePublishForm;

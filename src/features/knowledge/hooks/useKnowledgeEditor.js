import { useCallback, useState } from "react";
import { knowledgeService } from "../services/knowledgeService";

const EMPTY_FORM = {
    title: "",
    content: "",
    knowledgeType: "RECITATION",
    testMode: "AUDIO_RECITATION",
};

const useKnowledgeEditor = ({ navigate, setMaterials, t }) => {
    const [editorOpen, setEditorOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    const openCreate = useCallback(() => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setEditorOpen(true);
    }, []);

    const openEdit = useCallback((material) => {
        setEditingId(material.id);
        setForm({
            title: material.title ?? "",
            content: material.content ?? "",
            knowledgeType: material.knowledgeType ?? "RECITATION",
            testMode: material.testMode ?? "AUDIO_RECITATION",
        });
        setEditorOpen(true);
    }, []);

    const closeEditor = useCallback(() => setEditorOpen(false), []);

    const submitEditor = useCallback(
        async (event) => {
            event.preventDefault();
            if (!form.title.trim() || !form.content.trim()) return;

            setSaving(true);
            try {
                if (editingId == null) {
                    const created = await knowledgeService.create(form);
                    setMaterials((current) => [created, ...current]);
                    navigate(`/workspace/knowledge/${created.id}`);
                    window.__toast?.("success", t("knowledge.created"));
                } else {
                    // 服务端只写真正变了的字段，所以整份表单回传是安全的：没改的字段不会刷新 updated_at。
                    const updated = await knowledgeService.update(
                        editingId,
                        form,
                    );
                    setMaterials((current) =>
                        current.map((item) =>
                            item.id === updated.id ? updated : item,
                        ),
                    );
                    window.__toast?.("success", t("knowledge.updated"));
                }
                setEditorOpen(false);
                setEditingId(null);
                setForm(EMPTY_FORM);
            } finally {
                setSaving(false);
            }
        },
        [editingId, form, navigate, setMaterials, t],
    );

    const updateForm = useCallback(
        (patch) => setForm((current) => ({ ...current, ...patch })),
        [],
    );

    return {
        editorOpen,
        editingId,
        saving,
        form,
        openCreate,
        openEdit,
        closeEditor,
        updateForm,
        submitEditor,
    };
};

export default useKnowledgeEditor;

import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Button from "@shared/ui/primitives/Button";
import CustomSelect from "@shared/ui/forms/CustomSelect";
import FormField from "@shared/ui/forms/FormField";
import Modal from "@shared/ui/overlays/Modal";
import { formInputCls } from "@shared/ui/forms/formStyles";

const KnowledgeEditorModal = ({
    isOpen,
    onClose,
    editingId,
    form,
    onFormChange,
    onSubmit,
    saving,
    typeLabel,
}) => {
    const { t } = useTranslation();
    const isCreating = editingId == null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t(
                isCreating
                    ? "knowledge.createTitle"
                    : "knowledge.editTitle",
            )}
            width="max-w-2xl"
            footer={
                <>
                    <Button variant="ghost" onClick={onClose}>
                        {t("common.cancel")}
                    </Button>
                    <Button
                        type="submit"
                        form="knowledge-editor-form"
                        loading={saving}
                    >
                        {t(isCreating ? "knowledge.create" : "knowledge.save")}
                    </Button>
                </>
            }
        >
            <form
                id="knowledge-editor-form"
                className="space-y-4"
                onSubmit={onSubmit}
            >
                <FormField
                    label={t("knowledge.form.title")}
                    htmlFor="knowledge-title"
                >
                    <input
                        id="knowledge-title"
                        className={formInputCls}
                        value={form.title}
                        maxLength={100}
                        onChange={(event) =>
                            onFormChange({ title: event.target.value })
                        }
                    />
                </FormField>
                <FormField label={t("knowledge.form.type")}>
                    <CustomSelect
                        value={form.knowledgeType}
                        onChange={(value) =>
                            onFormChange({
                                knowledgeType: value,
                                testMode:
                                    value === "RECITATION"
                                        ? "AUDIO_RECITATION"
                                        : value === "MATH"
                                          ? "PRACTICE"
                                          : "AI_QA",
                            })
                        }
                        options={["RECITATION", "CONCEPT", "MATH"].map(
                            (value) => ({ value, label: typeLabel(value) }),
                        )}
                    />
                </FormField>
                <FormField
                    label={t("knowledge.form.content")}
                    htmlFor="knowledge-content"
                    hint={t("knowledge.form.contentHint")}
                >
                    <textarea
                        id="knowledge-content"
                        className={`${formInputCls} min-h-48 resize-y`}
                        value={form.content}
                        maxLength={10000}
                        onChange={(event) =>
                            onFormChange({ content: event.target.value })
                        }
                    />
                </FormField>
                {isCreating ? null : (
                    <div className="rounded-2xl bg-surface-muted p-3 text-caption text-ink-muted">
                        {t("knowledge.editResetHint")}
                    </div>
                )}
            </form>
        </Modal>
    );
};

KnowledgeEditorModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    editingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    form: PropTypes.shape({
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        knowledgeType: PropTypes.string.isRequired,
        testMode: PropTypes.string.isRequired,
    }).isRequired,
    onFormChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    saving: PropTypes.bool.isRequired,
    typeLabel: PropTypes.func.isRequired,
};

export default KnowledgeEditorModal;

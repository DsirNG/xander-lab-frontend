import Modal from "@shared/ui/overlays/Modal";
import Button from "@shared/ui/primitives/Button";
import FormField from "@shared/ui/forms/FormField";
import { formInputCls } from "@shared/ui/forms/formStyles";

const KnowledgeCreateTagModal = ({
    isOpen,
    saving,
    value,
    onChange,
    onClose,
    onSubmit,
}) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="新建标签"
        width="max-w-sm"
        footer={
            <>
                <Button variant="ghost" onClick={onClose} disabled={saving}>
                    取消
                </Button>
                <Button
                    type="submit"
                    form="create-tag-inline-form"
                    loading={saving}
                    disabled={!value.trim()}
                >
                    确定
                </Button>
            </>
        }
    >
        <form id="create-tag-inline-form" onSubmit={onSubmit} className="space-y-4">
            <FormField label="标签名称" required>
                <input
                    type="text"
                    className={formInputCls}
                    placeholder="例如：AI、产品设计"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    maxLength={60}
                    autoFocus
                />
            </FormField>
        </form>
    </Modal>
);

export default KnowledgeCreateTagModal;

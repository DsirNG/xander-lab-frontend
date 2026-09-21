import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Archive,
    ArchiveRestore,
    Pencil,
    Trash2,
} from "lucide-react";
import Button from "@shared/ui/primitives/Button";
import Modal from "@shared/ui/overlays/Modal";

/**
 * 一条知识的编辑、归档与删除入口。
 *
 * 删除的二次确认放在这个组件里而不是调用方：删除会连带清掉录音记录和测验留档且不可恢复，
 * 这个保证不能取决于每个调用方是否记得自己加一层确认。归档是可逆的，所以直接执行。
 */
const KnowledgeActions = ({ material, onEdit, onArchive, onDelete }) => {
    const { t } = useTranslation();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [busy, setBusy] = useState("");
    const archived = Boolean(material?.archivedAt);
    const run = async (kind, action) => {
        setBusy(kind);
        try {
            await action();
        } finally {
            setBusy("");
        }
    };
    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    variant="ghost"
                    icon={Pencil}
                    onClick={() => onEdit(material)}
                >
                    {t("knowledge.edit")}
                </Button>
                <Button
                    variant="ghost"
                    icon={archived ? ArchiveRestore : Archive}
                    loading={busy === "archive"}
                    onClick={() =>
                        run("archive", () => onArchive(material, !archived))
                    }
                >
                    {t(archived ? "knowledge.restore" : "knowledge.archive")}
                </Button>
                <Button
                    variant="danger"
                    icon={Trash2}
                    onClick={() => setConfirmOpen(true)}
                >
                    {t("knowledge.delete")}
                </Button>
            </div>
            <Modal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                title={t("knowledge.deleteTitle")}
                width="max-w-md"
                footer={
                    <>
                        <Button
                            variant="ghost"
                            onClick={() => setConfirmOpen(false)}
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            variant="danger"
                            icon={Trash2}
                            loading={busy === "delete"}
                            onClick={() =>
                                run("delete", async () => {
                                    await onDelete(material);
                                    setConfirmOpen(false);
                                })
                            }
                        >
                            {t("knowledge.deleteConfirm")}
                        </Button>
                    </>
                }
            >
                <div className="text-body text-ink-secondary">
                    {t("knowledge.deleteWarning", { title: material?.title })}
                </div>
                <div className="mt-3 text-caption text-ink-muted">
                    {t("knowledge.deleteArchiveHint")}
                </div>
            </Modal>
        </>
    );
};

export default KnowledgeActions;

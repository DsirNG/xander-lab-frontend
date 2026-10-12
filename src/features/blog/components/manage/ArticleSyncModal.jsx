import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@shared/ui/overlays/Modal";
import Button from "@shared/ui/primitives/Button";
import { blogService } from "../../services/blogService";

const PLATFORMS = [
    { id: "csdn", name: "CSDN", sync: blogService.syncToCsdn },
    { id: "juejin", labelKey: "blogPlans.juejin", sync: blogService.syncToJuejin },
];

const ArticleSyncModal = ({ post, onClose, onSynced, onCompleted }) => {
    const { t } = useTranslation();
    const [selected, setSelected] = useState([]);
    const [completed, setCompleted] = useState({});
    const [errors, setErrors] = useState({});
    const [busy, setBusy] = useState(false);
    const syncingRef = useRef(false);
    const isSynced = (id) => Boolean(post[`${id}Synced`] || completed[id]);
    const pending = selected.filter((id) => !isSynced(id));
    const close = () => { if (!syncingRef.current) onClose(); };
    const confirm = async () => {
        if (syncingRef.current || !pending.length) return;
        syncingRef.current = true;
        setBusy(true);
        let changed = false;
        try {
            for (const id of pending) {
                const platform = PLATFORMS.find((item) => item.id === id);
                setErrors((current) => ({ ...current, [id]: "" }));
                try {
                    await platform.sync(post.id, { _silent: true });
                    setCompleted((current) => ({ ...current, [id]: true }));
                    changed = true;
                    onSynced?.(id);
                } catch (error) {
                    setErrors((current) => ({ ...current, [id]: error?.response?.data?.message || error?.message || t("articleSync.failed") }));
                }
            }
            if (changed) await onCompleted?.();
        } finally {
            syncingRef.current = false;
            setBusy(false);
        }
    };
    return (
        <Modal isOpen onClose={close} title={t("articleSync.title")} height={420} footer={
            <div className="flex justify-end gap-2">
                <Button variant="outline" disabled={busy} onClick={close}>{t("common.close")}</Button>
                <Button variant="ink" loading={busy} disabled={!pending.length} onClick={confirm}>{t("articleSync.confirm")}</Button>
            </div>
        }>
            <p className="truncate text-sm font-medium text-ink" title={post.title}>{post.title}</p>
            <p className="mt-2 text-caption text-ink-muted">{t("articleSync.hint")}</p>
            <div className="mt-5 space-y-3">
                {PLATFORMS.map(({ id, name, labelKey }) => {
                    const synced = isSynced(id);
                    return <div key={id}>
                        <label className={`flex items-center gap-3 rounded-xl border border-border p-4 ${synced ? "bg-surface-muted text-ink-faint" : "text-ink"}`}>
                            <input type="checkbox" checked={synced || selected.includes(id)} disabled={synced || busy} onChange={(event) => setSelected((current) => event.target.checked ? [...current, id] : current.filter((value) => value !== id))} className="h-4 w-4 accent-ink" />
                            <span className="flex-1 text-sm font-medium">{name || t(labelKey)}</span>
                            {synced ? <span className="text-caption">{t("articleSync.synced")}</span> : null}
                        </label>
                        {errors[id] ? <p role="alert" className="mt-2 text-caption text-danger">{errors[id]}</p> : null}
                    </div>;
                })}
            </div>
        </Modal>
    );
};

export default ArticleSyncModal;

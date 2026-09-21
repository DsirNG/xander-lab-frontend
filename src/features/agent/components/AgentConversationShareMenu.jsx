import { Loader2, Link2 } from "lucide-react";
import useClickOutside from "@shared/hooks/useClickOutside";
import { useRef } from "react";

const AgentConversationShareMenu = ({
    open,
    conversationId,
    loading,
    copied,
    onToggle,
    onClose,
    onCopy,
}) => {
    const menuRef = useRef(null);

    useClickOutside(menuRef, onClose, open);

    return (
        <div ref={menuRef} className="relative">
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={open}
                aria-haspopup="dialog"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-canvas px-3 py-1.5 text-sm font-bold text-ink-muted transition-colors hover:text-accent"
            >
                <Link2 className="h-4 w-4" /> 分享
            </button>
            {open ? (
                <div
                    role="dialog"
                    aria-label="分享对话"
                    className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[calc(100vw-2.5rem)] rounded-xl border border-border bg-canvas p-3 shadow-xl"
                >
                    <div className="mb-2 text-sm font-bold text-ink-secondary">
                        分享对话链接
                    </div>
                    <p className="mb-2 text-xs text-ink-muted">
                        复制链接后，对方无需登录即可查看此对话
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onCopy}
                            disabled={loading || !conversationId}
                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-bold text-white transition hover:bg-accent/90 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />{" "}
                                    生成中...
                                </>
                            ) : copied ? (
                                "已复制"
                            ) : (
                                <>
                                    <Link2 className="h-4 w-4" /> 复制分享链接
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default AgentConversationShareMenu;

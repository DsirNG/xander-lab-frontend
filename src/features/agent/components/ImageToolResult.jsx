import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@shared/ui/overlays/Modal";
import AgentMarkdown from "./AgentMarkdown";

/**
 * 图片工具结果的展示：把地址渲染成图片本身。
 *
 * <p>单独成文件是为了让分享页这类公共页面能只依赖这一小块——
 * 它此前从 AgentChat 整页导入，会把整个对话页的依赖拖进公开链接的 chunk。</p>
 */
const ImageToolResult = ({ url, title = "", storageStatus }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    // Inline previews are accepted only as bounded raster image data, never arbitrary data URLs.
    const inline = typeof url === "string" && url.length <= 28_000_100 && /^data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/]+=*$/i.test(url);
    return <div>
        {inline ? <>
            <button type="button" onClick={() => setOpen(true)} className="block max-w-full cursor-zoom-in rounded-xl">
                <img src={url} alt={title} className="my-3 max-h-80 max-w-full rounded-xl object-contain" />
            </button>
            <Modal isOpen={open} onClose={() => setOpen(false)} title={title}>
                <img src={url} alt={title} className="max-h-full max-w-full object-contain" />
            </Modal>
        </> : <AgentMarkdown content={`![${title.replaceAll("[", "").replaceAll("]", "")}](${url})`} />}
        {storageStatus ? <div role="status" className="text-caption text-ink-muted">{t(storageStatus === "failed" ? "blog.agentChat.imageSaveFailed" : "blog.agentChat.imageSaving")}</div> : null}
    </div>;
};

export default ImageToolResult;

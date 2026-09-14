import React from "react";
import AgentMarkdown from "./AgentMarkdown";

/**
 * 图片工具结果的展示：把地址渲染成图片本身。
 *
 * <p>单独成文件是为了让分享页这类公共页面能只依赖这一小块——
 * 它此前从 AgentChat 整页导入，会把整个对话页的依赖拖进公开链接的 chunk。</p>
 */
const ImageToolResult = ({ url, title = "" }) => (
    <AgentMarkdown
        content={`![${title.replaceAll("[", "").replaceAll("]", "")}](${url})`}
    />
);

export default ImageToolResult;

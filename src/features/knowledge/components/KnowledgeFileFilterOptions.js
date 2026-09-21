export const EXTENSION_OPTIONS = [
    { value: "", label: "全部类型" },
    { value: "pdf", label: "PDF" },
    { value: "md", label: "Markdown (.md)" },
    { value: "docx", label: "Word (.docx)" },
    { value: "txt", label: "纯文本 (.txt)" },
];

export const STATUS_OPTIONS = [
    { value: "", label: "全部状态" },
    { value: "READY", label: "已解析" },
    { value: "PENDING", label: "解析中" },
    { value: "UNSUPPORTED", label: "未解析" },
    { value: "FAILED", label: "解析失败" },
];

export const SORT_OPTIONS = [
    { value: "recent", label: "最近更新" },
    { value: "oldest", label: "最早更新" },
    { value: "name", label: "按名称" },
    { value: "size", label: "按大小" },
];

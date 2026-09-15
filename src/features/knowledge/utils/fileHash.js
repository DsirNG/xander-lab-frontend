/**
 * 计算文件的 SHA-256 十六进制哈希值
 * 基于浏览器原生 crypto.subtle，用于大文件断点续传的会话去重与完整性校验。
 *
 * @param {File | Blob} file
 * @returns {Promise<string>} 64 字符十六进制小写哈希
 */
export async function computeFileSha256(file) {
    if (!crypto?.subtle?.digest) {
        throw new Error("当前浏览器环境不支持 Web Crypto API");
    }

    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * 格式化字节大小为易读文本（B, KB, MB, GB）
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
    if (bytes == null || isNaN(bytes) || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

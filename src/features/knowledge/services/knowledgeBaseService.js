import {
    delete as del,
    get,
    post,
    put,
    upload as httpUpload,
} from "@api";
import { computeFileSha256 } from "../utils/fileHash";

const BASE = "/api/knowledge-base";
const DEFAULT_CHUNK_SIZE = 2 * 1024 * 1024; // 2MB
const DIRECT_UPLOAD_MAX_BYTES = 4 * 1024 * 1024; // 4MB 以下小文件直传

export const knowledgeBaseService = {
    // ─────────────────────────────────────────────
    // 1. 文件夹树 (Folders)
    // ─────────────────────────────────────────────
    folders: {
        /** 列出全部文件夹（扁平列表，前端按 parentId 装树） */
        list: (config) => get(`${BASE}/folders`, undefined, config),

        /** 新建文件夹 */
        create: ({ parentId = 0, name }, config) =>
            post(`${BASE}/folders`, { parentId, name }, config),

        /** 重命名文件夹 */
        rename: (folderId, name, config) =>
            put(`${BASE}/folders/${folderId}/name`, { name }, config),

        /** 移动文件夹到新父级 */
        move: (folderId, parentId, config) =>
            put(`${BASE}/folders/${folderId}/parent`, { parentId }, config),

        /** 删除文件夹（recursive 为 true 时连同子文件夹与文件一并删除） */
        delete: (folderId, recursive = false, config) =>
            del(`${BASE}/folders/${folderId}`, { recursive }, config),
    },

    // ─────────────────────────────────────────────
    // 2. 文件管理与检索 (Files)
    // ─────────────────────────────────────────────
    files: {
        /**
         * 多维文件检索
         * @param {Object} query
         * @param {number} [query.folderId] - 目标文件夹 id（不传为全库检索）
         * @param {boolean} [query.recursive] - 是否递归子文件夹
         * @param {string} [query.keyword] - 关键词模糊匹配
         * @param {number[]} [query.tagIds] - 标签筛选（要求同时具备）
         * @param {string} [query.extension] - 扩展名
         * @param {string} [query.structureStatus] - 结构图状态
         * @param {number} [query.page=1]
         * @param {number} [query.size=20]
         */
        search: (query = {}, config) => get(`${BASE}/files`, query, config),

        /** 文件详情 */
        detail: (fileId, config) =>
            get(`${BASE}/files/${fileId}`, undefined, config),

        /** 知识结构全景预览：文件信息 + 章节目录 + 结构图 + 正文首屏片段 */
        preview: (fileId, config) =>
            get(`${BASE}/files/${fileId}/preview`, undefined, config),

        /** 抽取出的完整纯文本正文 */
        content: (fileId, config) =>
            get(`${BASE}/files/${fileId}/content`, undefined, config),

        /** 章节树形目录 */
        chapters: (fileId, config) =>
            get(`${BASE}/files/${fileId}/chapters`, undefined, config),

        /** 重命名文件展示名 */
        rename: (fileId, displayName, config) =>
            put(`${BASE}/files/${fileId}/name`, { displayName }, config),

        /** 移动文件到目标文件夹 */
        move: (fileId, folderId, config) =>
            put(`${BASE}/files/${fileId}/folder`, { folderId }, config),

        /** 删除文件（级联清除存储与衍生内容） */
        delete: (fileId, config) =>
            del(`${BASE}/files/${fileId}`, undefined, config),

        /** 重新提取正文与识别章节结构图 */
        reidentify: (fileId, config) =>
            post(`${BASE}/files/${fileId}/reidentify`, undefined, config),

        /** 表单直传（小文件） */
        uploadDirect: (file, folderId, tagNames = [], config) => {
            const formData = new FormData();
            formData.append("file", file);
            return post(`${BASE}/files/upload`, formData, {
                params: { folderId, tagNames },
                headers: { "Content-Type": "multipart/form-data" },
                ...config,
            });
        },
    },

    // ─────────────────────────────────────────────
    // 3. 知识结构导图 (Structure)
    // ─────────────────────────────────────────────
    structure: {
        /**
         * 读取结构图
         * @param {number} fileId
         * @param {number} [chapterId] - 不传读整书，传了读该章
         */
        read: (fileId, chapterId, config) =>
            get(
                `${BASE}/files/${fileId}/structure`,
                chapterId ? { chapterId } : undefined,
                config,
            ),

        /** 整书维度重新生成结构图 */
        regenerate: (fileId, config) =>
            post(
                `${BASE}/files/${fileId}/structure/regenerate`,
                undefined,
                config,
            ),

        /** 按章按需生成结构图 */
        generateChapter: (fileId, chapterId, config) =>
            post(
                `${BASE}/files/${fileId}/chapters/${chapterId}/structure`,
                undefined,
                config,
            ),
    },

    // ─────────────────────────────────────────────
    // 4. 标签词表与文件打标 (Tags)
    // ─────────────────────────────────────────────
    tags: {
        /** 获取当前用户全部标签（含使用计数） */
        list: (config) => get(`${BASE}/tags`, undefined, config),

        /** 新建标签 */
        create: ({ name, color, description }, config) =>
            post(`${BASE}/tags`, { name, color, description }, config),

        /** 编辑标签 */
        update: (tagId, { name, color, description }, config) =>
            put(`${BASE}/tags/${tagId}`, { name, color, description }, config),

        /** 删除标签（解除所有文件关联） */
        delete: (tagId, config) =>
            del(`${BASE}/tags/${tagId}`, undefined, config),

        /** 给文件追加手动标签（标签不存在自动创建） */
        attachToFile: (fileId, names = [], config) =>
            post(`${BASE}/files/${fileId}/tags`, { names }, config),

        /** 整体替换文件的手动标签 */
        replaceFileTags: (fileId, names = [], config) =>
            put(`${BASE}/files/${fileId}/tags`, { names }, config),

        /** 移除文件上的指定标签 */
        detachFromFile: (fileId, tagId, config) =>
            del(`${BASE}/files/${fileId}/tags/${tagId}`, undefined, config),
    },

    // ─────────────────────────────────────────────
    // 5. 分片上传与断点续传 (Uploads)
    // ─────────────────────────────────────────────
    uploads: {
        /** 初始化会话（支持秒传判别与断点续传查验） */
        init: (payload, config) => post(`${BASE}/uploads/init`, payload, config),

        /** 查询上传进度与缺失分片 */
        status: (uploadId, config) =>
            get(`${BASE}/uploads/${uploadId}`, undefined, config),

        /** 上传单片 */
        uploadChunk: (uploadId, chunkIndex, chunkBlob, config) => {
            const formData = new FormData();
            formData.append("chunk", chunkBlob, `chunk-${chunkIndex}`);
            return post(
                `${BASE}/uploads/${uploadId}/chunks/${chunkIndex}`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    ...config,
                },
            );
        },

        /** 完成分片并合并入库 */
        complete: (uploadId, tagNames = [], config) =>
            post(`${BASE}/uploads/${uploadId}/complete`, { tagNames }, config),

        /** 放弃并清理会话 */
        abort: (uploadId, config) =>
            del(`${BASE}/uploads/${uploadId}`, undefined, config),
    },

    // ─────────────────────────────────────────────
    // 6. 智能上传协调器 (Smart Uploader)
    // ─────────────────────────────────────────────
    /**
     * 智能上传：自动根据文件大小选择表单直传或分片断点续传
     * @param {Object} params
     * @param {File} params.file - 上传文件
     * @param {number} params.folderId - 目标文件夹 ID
     * @param {string[]} [params.tagNames] - 附加标签
     * @param {Function} [params.onProgress] - 进度回调 (progress: number, stageText: string) => void
     * @param {AbortSignal} [params.signal]
     * @returns {Promise<Object>} KnowledgeFileView
     */
    async uploadSmart({
        file,
        folderId,
        tagNames = [],
        onProgress = () => {},
        signal,
    }) {
        if (!folderId || folderId <= 0) {
            throw new Error("必须选择具体的存储文件夹");
        }

        // 小于 4MB 的文件直接走直传接口
        if (file.size <= DIRECT_UPLOAD_MAX_BYTES) {
            onProgress(20, "正在直传文件...");
            const res = await knowledgeBaseService.files.uploadDirect(
                file,
                folderId,
                tagNames,
                { signal },
            );
            onProgress(100, "上传完成，已入库");
            return res;
        }

        // 大文件分片断点续传流程
        onProgress(5, "正在校验文件完整性 (SHA-256)...");
        const fileHash = await computeFileSha256(file);
        if (signal?.aborted) throw new Error("上传已取消");

        onProgress(15, "正在初始化分片会话...");
        const session = await knowledgeBaseService.uploads.init(
            {
                originalName: file.name,
                folderId,
                sizeBytes: file.size,
                fileHash,
                chunkSize: DEFAULT_CHUNK_SIZE,
            },
            { signal },
        );

        // 如果服务端已经完成该文件（秒传命中）
        if (session.status === "COMPLETED" && session.fileId) {
            onProgress(100, "秒传成功，文件已就绪");
            return await knowledgeBaseService.files.detail(session.fileId, {
                signal,
            });
        }

        const totalChunks = session.totalChunks;
        const missingChunks = new Set(session.missingChunks || []);

        let uploadedChunks = totalChunks - missingChunks.size;

        for (let i = 0; i < totalChunks; i++) {
            if (signal?.aborted) throw new Error("上传已取消");

            // 如果该分片已经确认落盘，跳过
            if (!missingChunks.has(i)) continue;

            const start = i * DEFAULT_CHUNK_SIZE;
            const end = Math.min(file.size, start + DEFAULT_CHUNK_SIZE);
            const chunkBlob = file.slice(start, end);

            await knowledgeBaseService.uploads.uploadChunk(
                session.uploadId,
                i,
                chunkBlob,
                { signal },
            );

            uploadedChunks++;
            const pct = Math.min(
                95,
                Math.round((uploadedChunks / totalChunks) * 80) + 15,
            );
            onProgress(
                pct,
                `正在分片上传 (${uploadedChunks}/${totalChunks})...`,
            );
        }

        onProgress(95, "正在合并分片并生成知识结构...");
        const result = await knowledgeBaseService.uploads.complete(
            session.uploadId,
            tagNames,
            { signal },
        );
        onProgress(100, "处理完成");
        return result;
    },
};

import { afterEach, describe, expect, it, vi } from "vitest";

const apiMock = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    upload: vi.fn(),
}));

vi.mock("@api", () => apiMock);

const { knowledgeBaseService } = await import("./knowledgeBaseService.js");

afterEach(() => {
    vi.clearAllMocks();
});

describe("knowledgeBaseService", () => {
    describe("folders", () => {
        it("list 文件夹请求对应端点", () => {
            knowledgeBaseService.folders.list();
            expect(apiMock.get).toHaveBeenCalledWith(
                "/api/knowledge-base/folders",
                undefined,
                undefined,
            );
        });

        it("create 文件夹向端点提交 parentId 与 name", () => {
            knowledgeBaseService.folders.create({ parentId: 3, name: "微服务架构" });
            expect(apiMock.post).toHaveBeenCalledWith(
                "/api/knowledge-base/folders",
                { parentId: 3, name: "微服务架构" },
                undefined,
            );
        });

        it("rename 文件夹更新名称", () => {
            knowledgeBaseService.folders.rename(12, "分布式系统");
            expect(apiMock.put).toHaveBeenCalledWith(
                "/api/knowledge-base/folders/12/name",
                { name: "分布式系统" },
                undefined,
            );
        });

        it("move 文件夹更新父级", () => {
            knowledgeBaseService.folders.move(12, 0);
            expect(apiMock.put).toHaveBeenCalledWith(
                "/api/knowledge-base/folders/12/parent",
                { parentId: 0 },
                undefined,
            );
        });

        it("delete 文件夹支持 recursive 参数", () => {
            knowledgeBaseService.folders.delete(12, true);
            expect(apiMock.delete).toHaveBeenCalledWith(
                "/api/knowledge-base/folders/12",
                { recursive: true },
                undefined,
            );
        });
    });

    describe("files", () => {
        it("search 文件多维条件检索", () => {
            const query = { folderId: 5, keyword: "设计模式", page: 1, size: 20 };
            knowledgeBaseService.files.search(query);
            expect(apiMock.get).toHaveBeenCalledWith(
                "/api/knowledge-base/files",
                query,
                undefined,
            );
        });

        it("preview 读取文件知识综合预览", () => {
            knowledgeBaseService.files.preview(88);
            expect(apiMock.get).toHaveBeenCalledWith(
                "/api/knowledge-base/files/88/preview",
                undefined,
                undefined,
            );
        });

        it("content 读取抽取的正文", () => {
            knowledgeBaseService.files.content(88);
            expect(apiMock.get).toHaveBeenCalledWith(
                "/api/knowledge-base/files/88/content",
                undefined,
                undefined,
            );
        });

        it("chapters 读取章节大纲目录", () => {
            knowledgeBaseService.files.chapters(88);
            expect(apiMock.get).toHaveBeenCalledWith(
                "/api/knowledge-base/files/88/chapters",
                undefined,
                undefined,
            );
        });

        it("reidentify 触发重新识别", () => {
            knowledgeBaseService.files.reidentify(88);
            expect(apiMock.post).toHaveBeenCalledWith(
                "/api/knowledge-base/files/88/reidentify",
                undefined,
                undefined,
            );
        });
    });

    describe("structure", () => {
        it("read 结构导图支持整书或单章维度", () => {
            knowledgeBaseService.structure.read(88);
            expect(apiMock.get).toHaveBeenCalledWith(
                "/api/knowledge-base/files/88/structure",
                undefined,
                undefined,
            );

            knowledgeBaseService.structure.read(88, 7);
            expect(apiMock.get).toHaveBeenCalledWith(
                "/api/knowledge-base/files/88/structure",
                { chapterId: 7 },
                undefined,
            );
        });

        it("regenerate 重新生成整书导图", () => {
            knowledgeBaseService.structure.regenerate(88);
            expect(apiMock.post).toHaveBeenCalledWith(
                "/api/knowledge-base/files/88/structure/regenerate",
                undefined,
                undefined,
            );
        });

        it("generateChapter 按章按需生成", () => {
            knowledgeBaseService.structure.generateChapter(88, 15);
            expect(apiMock.post).toHaveBeenCalledWith(
                "/api/knowledge-base/files/88/chapters/15/structure",
                undefined,
                undefined,
            );
        });
    });

    describe("tags", () => {
        it("list 标签词表", () => {
            knowledgeBaseService.tags.list();
            expect(apiMock.get).toHaveBeenCalledWith(
                "/api/knowledge-base/tags",
                undefined,
                undefined,
            );
        });

        it("attachToFile 给文件追加标签", () => {
            knowledgeBaseService.tags.attachToFile(88, ["React", "Hooks"]);
            expect(apiMock.post).toHaveBeenCalledWith(
                "/api/knowledge-base/files/88/tags",
                { names: ["React", "Hooks"] },
                undefined,
            );
        });

        it("detachFromFile 从文件移除标签", () => {
            knowledgeBaseService.tags.detachFromFile(88, 3);
            expect(apiMock.delete).toHaveBeenCalledWith(
                "/api/knowledge-base/files/88/tags/3",
                undefined,
                undefined,
            );
        });
    });
});

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@locales/index";
import KnowledgeMirrorPage, {
    AgentQuizPanel,
    KnowledgeActions,
} from "./KnowledgeMirrorPage";
import { buildKnowledgeQuizPath } from "../utils/knowledgeNavigation";
import { knowledgeService } from "../services/knowledgeService";

vi.mock("../services/knowledgeService", () => ({
    knowledgeService: {
        list: vi.fn(),
        listQuizzes: vi.fn(),
        getAttempt: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        archive: vi.fn(),
        remove: vi.fn(),
        uploadRecording: vi.fn(),
    },
}));

// 语言由浏览器环境探测，不同机器上的 jsdom 未必一致；断言按钮文案前先把语言钉死。
beforeAll(async () => {
    await i18n.changeLanguage("zh");
});

const recitationMaterial = {
    id: 9,
    title: "岳阳楼记",
    content: "先天下之忧而忧",
    knowledgeType: "RECITATION",
    testMode: "AUDIO_RECITATION",
    masteryLevel: "NEW",
    masteryScore: 0,
};

beforeEach(() => {
    vi.clearAllMocks();
    knowledgeService.list.mockResolvedValue([recitationMaterial]);
    knowledgeService.listQuizzes.mockResolvedValue([]);
});

const renderPage = (entry = "/workspace/knowledge/9") =>
    render(
        <MemoryRouter initialEntries={[entry]}>
            <Routes>
                <Route
                    path="/workspace/knowledge/:materialId?"
                    element={<KnowledgeMirrorPage />}
                />
            </Routes>
        </MemoryRouter>,
    );

describe("KnowledgeMirrorPage reliability", () => {
    it("加载失败显示错误态，重试成功后才显示知识内容", async () => {
        knowledgeService.list
            .mockRejectedValueOnce(new Error("temporary network failure"))
            .mockResolvedValueOnce([recitationMaterial]);

        renderPage();

        expect(await screen.findByText("知识库加载失败")).toBeInTheDocument();
        expect(
            screen.queryByText("从第一个知识点开始"),
        ).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "重新加载" }));

        expect(await screen.findAllByText("岳阳楼记")).toHaveLength(2);
        expect(knowledgeService.list).toHaveBeenCalledTimes(2);
    });

    it("任务查询失败保留 URL 中的任务并允许手动恢复", async () => {
        knowledgeService.getAttempt
            .mockRejectedValueOnce(new Error("temporary network failure"))
            .mockResolvedValueOnce({
                id: 77,
                status: "SUCCEEDED",
                score: 88,
                result: {},
            });

        renderPage("/workspace/knowledge/9?attemptId=77");

        expect(
            await screen.findByText(/暂时无法刷新录音任务/),
        ).toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "立即重试" }));

        expect(await screen.findByText("检查完成")).toBeInTheDocument();
        expect(screen.getByText("88%")).toBeInTheDocument();
        expect(knowledgeService.getAttempt).toHaveBeenCalledTimes(2);
    });

    it("麦克风权限被拒绝时给出明确恢复指引", async () => {
        const originalPermissions = navigator.permissions;
        const originalMediaDevices = navigator.mediaDevices;
        const originalMediaRecorder = window.MediaRecorder;
        Object.defineProperty(navigator, "permissions", {
            configurable: true,
            value: { query: vi.fn().mockResolvedValue({ state: "denied" }) },
        });
        Object.defineProperty(navigator, "mediaDevices", {
            configurable: true,
            value: { getUserMedia: vi.fn() },
        });
        Object.defineProperty(window, "MediaRecorder", {
            configurable: true,
            value: vi.fn(),
        });

        try {
            renderPage();
            fireEvent.click(
                await screen.findByRole("button", { name: "开始录音" }),
            );

            expect(
                await screen.findByText(/麦克风权限此前已被拒绝/),
            ).toBeInTheDocument();
            expect(
                screen.getByText(/点击地址栏左侧的权限图标/),
            ).toBeInTheDocument();
        } finally {
            Object.defineProperty(navigator, "permissions", {
                configurable: true,
                value: originalPermissions,
            });
            Object.defineProperty(navigator, "mediaDevices", {
                configurable: true,
                value: originalMediaDevices,
            });
            Object.defineProperty(window, "MediaRecorder", {
                configurable: true,
                value: originalMediaRecorder,
            });
        }
    });
});

const quiz = {
    id: 5,
    score: 50,
    questionCount: 2,
    correctCount: 1,
    verdict: "推导那题没答上",
    createdAt: "2026-08-20T10:00:00",
    items: [
        {
            question: "和角公式怎么写",
            userAnswer: "sin a cos b + cos a sin b",
            credit: 1,
        },
        {
            question: "怎么推导",
            userAnswer: "画单位圆…",
            comment: "方向对了但写错了符号",
            credit: 0.5,
        },
    ],
};

describe("knowledge quiz handoff", () => {
    it("把 materialId 带进智能体开场白，同名知识也不会靠标题猜", () => {
        const path = buildKnowledgeQuizPath(
            (_key, values) =>
                `测验 ${values.title}，知识 ID ${values.materialId}`,
            { id: 91, title: "同名知识" },
        );

        expect(decodeURIComponent(path)).toContain("知识 ID 91");
        expect(path).toMatch(/^\/workspace\/agent\?q=/);
    });
});

describe("AgentQuizPanel", () => {
    it("把服务端算出的分数和逐题判分原样摆出来，不在前端重算总分", () => {
        render(<AgentQuizPanel quiz={quiz} onStart={() => {}} />);

        expect(screen.getByText("50%")).toBeInTheDocument();
        expect(screen.getByText("1/2")).toBeInTheDocument();
        expect(screen.getByText("推导那题没答上")).toBeInTheDocument();
        expect(screen.getByText("和角公式怎么写")).toBeInTheDocument();
        expect(screen.getByText("方向对了但写错了符号")).toBeInTheDocument();
        expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });

    it("答对一半的题不显示成答对，用户才知道错在哪", () => {
        const { container } = render(
            <AgentQuizPanel quiz={quiz} onStart={() => {}} />,
        );
        const labels = [...container.querySelectorAll("li .rounded-full")].map(
            (node) => node.textContent,
        );

        expect(labels[0]).not.toEqual(labels[1]);
        expect(new Set(labels).size).toBe(2);
    });

    it("没测验过时给出提示而不是一片空白的成绩单", () => {
        render(<AgentQuizPanel quiz={null} onStart={() => {}} />);

        expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
        expect(screen.queryByText("50%")).not.toBeInTheDocument();
        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("入口按钮把出题这件事交给对话，页面自己不出题", async () => {
        const onStart = vi.fn();
        render(<AgentQuizPanel quiz={null} onStart={onStart} />);

        fireEvent.click(screen.getByRole("button"));

        expect(onStart).toHaveBeenCalledTimes(1);
    });

    it("缺字段的历史记录不至于把页面打崩", () => {
        render(
            <AgentQuizPanel
                quiz={{ items: [{}, null], score: null }}
                onStart={() => {}}
            />,
        );

        expect(screen.getByText("0%")).toBeInTheDocument();
        expect(screen.getByText("0/0")).toBeInTheDocument();
        expect(screen.getAllByRole("listitem")).toHaveLength(2);
    });
});

const active = { id: 3, title: "牛顿第二定律", archivedAt: null };
const archived = {
    id: 4,
    title: "勾股定理",
    archivedAt: "2026-08-01T09:00:00",
};
const noop = () => {};

describe("KnowledgeActions", () => {
    it("删除必须先二次确认，点一下按钮不会直接删掉", () => {
        const onDelete = vi.fn();
        render(
            <KnowledgeActions
                material={active}
                onEdit={noop}
                onArchive={noop}
                onDelete={onDelete}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "删除" }));

        expect(onDelete).not.toHaveBeenCalled();
        expect(screen.getByText("删除这条知识？")).toBeInTheDocument();
    });

    it("确认弹窗点名要删的是哪一条，并提示归档这个可逆的选择", async () => {
        const onDelete = vi.fn().mockResolvedValue(undefined);
        render(
            <KnowledgeActions
                material={active}
                onEdit={noop}
                onArchive={noop}
                onDelete={onDelete}
            />,
        );
        fireEvent.click(screen.getByRole("button", { name: "删除" }));

        expect(screen.getByText(/牛顿第二定律/)).toBeInTheDocument();
        expect(screen.getByText(/改用归档/)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: "确认删除" }));

        await waitFor(() => expect(onDelete).toHaveBeenCalledWith(active));
    });

    it("取消就是不删：关掉弹窗不会顺手触发删除", () => {
        const onDelete = vi.fn();
        render(
            <KnowledgeActions
                material={active}
                onEdit={noop}
                onArchive={noop}
                onDelete={onDelete}
            />,
        );
        fireEvent.click(screen.getByRole("button", { name: "删除" }));

        fireEvent.click(screen.getByRole("button", { name: "取消" }));

        expect(onDelete).not.toHaveBeenCalled();
    });

    it("在用的知识给归档入口，归档过的给恢复入口——否则归档就成了单向出口", () => {
        const onArchive = vi.fn().mockResolvedValue(undefined);
        const { unmount } = render(
            <KnowledgeActions
                material={active}
                onEdit={noop}
                onArchive={onArchive}
                onDelete={noop}
            />,
        );

        expect(
            screen.queryByRole("button", { name: "恢复" }),
        ).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "归档" }));
        expect(onArchive).toHaveBeenCalledWith(active, true);
        unmount();

        render(
            <KnowledgeActions
                material={archived}
                onEdit={noop}
                onArchive={onArchive}
                onDelete={noop}
            />,
        );
        expect(
            screen.queryByRole("button", { name: "归档" }),
        ).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "恢复" }));
        expect(onArchive).toHaveBeenLastCalledWith(archived, false);
    });

    it("编辑入口把这条知识交给调用方，自己不改数据", () => {
        const onEdit = vi.fn();
        render(
            <KnowledgeActions
                material={active}
                onEdit={onEdit}
                onArchive={noop}
                onDelete={noop}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "编辑" }));

        expect(onEdit).toHaveBeenCalledWith(active);
    });
});

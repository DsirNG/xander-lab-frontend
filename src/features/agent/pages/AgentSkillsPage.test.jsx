import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const listMock = vi.fn();
const listToolsMock = vi.fn();
const archiveMock = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("../services/agentSkillService", () => ({
    agentSkillService: {
        list: (...args) => listMock(...args),
        listTools: (...args) => listToolsMock(...args),
        create: vi.fn(),
        archive: (...args) => archiveMock(...args),
    },
    parseSkillToolNames: (raw) => {
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
        } catch {
            return [];
        }
    },
}));

vi.mock("@/hooks/useToast", () => ({
    useToast: () => ({ success: toastSuccess, error: toastError }),
}));

// 工厂只跑一次，所以这个 t 在所有渲染之间保持同一引用——真实的
// react-i18next 也是稳定的。若每次渲染都返回新函数，loadData 的
// useCallback([t]) 会不断重建，useEffect 就会无限重取列表。
vi.mock("react-i18next", () => {
    const t = (key) => key;
    return { useTranslation: () => ({ t }) };
});

import AgentSkillsPage from "./AgentSkillsPage";

const skill = (over = {}) => ({
    id: 1,
    skillKey: "release-notes",
    version: 2,
    name: "发版说明",
    description: "写发版说明时读它",
    instructions: "先列改动，再列影响",
    toolNamesJson: '["query_posts","publish_post"]',
    status: "ACTIVE",
    updatedAt: "2026-09-14T10:00:00",
    ...over,
});

describe("AgentSkillsPage", () => {
    beforeEach(() => {
        listMock.mockReset();
        listToolsMock.mockReset();
        archiveMock.mockReset();
        toastSuccess.mockReset();
        toastError.mockReset();
        listToolsMock.mockResolvedValue([]);
    });

    it("渲染技能的名称、标识、版本号与工具数", async () => {
        listMock.mockResolvedValue([skill()]);

        render(<AgentSkillsPage />);

        expect(await screen.findByText("发版说明")).toBeInTheDocument();
        expect(screen.getByText("release-notes")).toBeInTheDocument();
        expect(screen.getByText("v2")).toBeInTheDocument();
        expect(screen.getByText("blog.agentSkills.toolCount")).toBeInTheDocument();
    });

    // 与 AgentImagesPage 同一类缺陷：加载失败曾被渲染成"还没有数据"的空态，
    // 用户既看不到原因也没有重试入口。
    it("加载失败时给出错误态与重试，而不是伪装成空列表", async () => {
        listMock.mockRejectedValue(new Error("boom"));

        render(<AgentSkillsPage />);

        expect(await screen.findByText("boom")).toBeInTheDocument();
        expect(
            screen.getByText("blog.agentImages.retry"),
        ).toBeInTheDocument();
        expect(
            screen.queryByText("blog.agentSkills.emptyTitle"),
        ).not.toBeInTheDocument();
    });

    it("归档走二次确认，确认后调用归档并重新拉取列表", async () => {
        listMock.mockResolvedValue([skill()]);
        archiveMock.mockResolvedValue(undefined);

        render(<AgentSkillsPage />);

        await screen.findByText("发版说明");
        expect(listMock).toHaveBeenCalledTimes(1);

        fireEvent.click(
            screen.getByLabelText("blog.agentSkills.actionsFor"),
        );
        fireEvent.click(
            screen.getByRole("menuitem", {
                name: "blog.agentSkills.archive",
            }),
        );
        expect(
            await screen.findByText("blog.agentSkills.archiveTitle"),
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", {
                name: "blog.agentSkills.archive",
            }),
        );

        await waitFor(() => expect(archiveMock).toHaveBeenCalledWith(1));
        await waitFor(() => expect(listMock).toHaveBeenCalledTimes(2));
        expect(toastSuccess).toHaveBeenCalled();
    });

    it("归档失败时提示错误，且不谎报成功", async () => {
        listMock.mockResolvedValue([skill()]);
        archiveMock.mockRejectedValue(new Error("forbidden"));

        render(<AgentSkillsPage />);

        await screen.findByText("发版说明");
        fireEvent.click(
            screen.getByLabelText("blog.agentSkills.actionsFor"),
        );
        fireEvent.click(
            screen.getByRole("menuitem", {
                name: "blog.agentSkills.archive",
            }),
        );
        fireEvent.click(
            screen.getByRole("button", {
                name: "blog.agentSkills.archive",
            }),
        );

        await waitFor(() => expect(toastError).toHaveBeenCalledWith("forbidden"));
        expect(toastSuccess).not.toHaveBeenCalled();
        // 失败后不应重取列表，否则看起来像归档成功了。
        expect(listMock).toHaveBeenCalledTimes(1);
    });
});

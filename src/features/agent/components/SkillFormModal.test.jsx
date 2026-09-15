import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const createMock = vi.fn();
const toastSuccess = vi.fn();

vi.mock("../services/agentSkillService", () => ({
    agentSkillService: { create: (...args) => createMock(...args) },
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
    useToast: () => ({ success: toastSuccess, error: vi.fn() }),
}));

// 同 AgentSkillsPage.test：t 必须跨渲染稳定，否则依赖 [t] 的 useCallback 会不断重建。
vi.mock("react-i18next", () => {
    const t = (key) => key;
    return { useTranslation: () => ({ t }) };
});

import SkillFormModal from "./SkillFormModal";

const TOOLS = [
    { name: "query_posts", description: "查已发布的文章" },
    { name: "publish_post", description: "把文章发到平台" },
];

const fill = (values) => {
    const ids = {
        key: "blog.agentSkills.fieldKey",
        name: "blog.agentSkills.fieldName",
        description: "blog.agentSkills.fieldDescription",
        instructions: "blog.agentSkills.fieldInstructions",
    };
    Object.entries(values).forEach(([field, value]) => {
        fireEvent.change(screen.getByLabelText(ids[field]), {
            target: { value },
        });
    });
};

const renderModal = (props = {}) =>
    render(
        <SkillFormModal
            isOpen
            tools={TOOLS}
            onClose={vi.fn()}
            onSaved={vi.fn()}
            {...props}
        />,
    );

const VALID = {
    key: "release-notes",
    name: "发版说明",
    description: "写发版说明时读它",
    instructions: "先列改动，再列影响",
};

describe("SkillFormModal", () => {
    beforeEach(() => {
        createMock.mockReset();
        toastSuccess.mockReset();
        createMock.mockResolvedValue({ id: 1 });
    });

    it("提交时去掉首尾空格，并把勾选的工具一起带上", async () => {
        renderModal();

        fill({ ...VALID, name: " 发版说明 " });
        fireEvent.click(screen.getByLabelText(/query_posts/));
        fireEvent.click(screen.getByRole("button", { name: "common.save" }));

        await waitFor(() =>
            expect(createMock).toHaveBeenCalledWith({
                skillKey: "release-notes",
                name: "发版说明",
                description: "写发版说明时读它",
                instructions: "先列改动，再列影响",
                toolNames: ["query_posts"],
            }),
        );
        expect(toastSuccess).toHaveBeenCalled();
    });

    // 标识会被后端按 ^[a-z][a-z0-9-]{1,79}$ 校验，客户端先拦一次，
    // 免得用户填完整张表才拿到一个 400。
    it("标识不合规时本地就拦下，不发请求", async () => {
        renderModal();

        fill({ ...VALID, key: "Release Notes" });
        fireEvent.click(screen.getByRole("button", { name: "common.save" }));

        expect(
            await screen.findByText("blog.agentSkills.formKeyInvalid"),
        ).toBeInTheDocument();
        expect(createMock).not.toHaveBeenCalled();
    });

    it("必填项为空时不发请求", async () => {
        renderModal();

        fill({ ...VALID, description: "   " });
        fireEvent.click(screen.getByRole("button", { name: "common.save" }));

        expect(
            await screen.findByText("blog.agentSkills.formDescriptionRequired"),
        ).toBeInTheDocument();
        expect(createMock).not.toHaveBeenCalled();
    });

    it("服务端拒绝时把原因显示在表单里，不静默失败", async () => {
        createMock.mockRejectedValue({
            response: { data: { message: "Skill包含未注册工具" } },
        });

        renderModal();
        fill(VALID);
        fireEvent.click(screen.getByRole("button", { name: "common.save" }));

        expect(
            await screen.findByText("Skill包含未注册工具"),
        ).toBeInTheDocument();
        expect(toastSuccess).not.toHaveBeenCalled();
    });

    it("新建版本时回填历史内容，且标识不可改", async () => {
        renderModal({
            prefill: {
                skillKey: "release-notes",
                name: "发版说明",
                description: "旧描述",
                instructions: "旧步骤",
                toolNamesJson: '["publish_post"]',
            },
        });

        expect(screen.getByLabelText("blog.agentSkills.fieldKey")).toHaveValue(
            "release-notes",
        );
        expect(screen.getByLabelText("blog.agentSkills.fieldKey")).toBeDisabled();
        expect(screen.getByLabelText("blog.agentSkills.fieldName")).toHaveValue(
            "发版说明",
        );
        // toolNamesJson 里的历史选择要回填到勾选态。
        expect(screen.getByLabelText(/publish_post/)).toBeChecked();
        expect(screen.getByLabelText(/query_posts/)).not.toBeChecked();
    });
});

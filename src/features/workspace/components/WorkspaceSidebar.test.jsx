import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WorkspaceSidebar from "./WorkspaceSidebar";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key, fallback) =>
            ({
                "workspace.agent.newConversation": "新建对话",
                "contentLibrary.articles": "文章",
                "contentLibrary.plans": "发布计划",
                "workspace.agent.nav.writing": "创作",
                "workspace.agent.nav.documents": "文档",
                "workspace.agent.nav.memory": "记忆",
                "workspace.menu.images": "图片",
                "workspace.menu.plugins": "插件",
                "workspace.agent.workspaceNav": "工作区",
                "workspace.agent.tools": "工具",
                "blog.agentChat.recentChats": "最近聊天",
                "workspace.agent.groups.pinned": "置顶",
                "workspace.agent.groups.recent": "最近",
                "blog.agent.untitled": "未命名对话",
            })[key] || fallback || key,
    }),
}));

vi.mock("./WorkspaceAccountMenu", () => ({ default: () => null }));
vi.mock("./WorkspaceConversationSearchModal", () => ({ default: () => null }));

const renderSidebar = ({ activeConversationId = null, activeView = null } = {}) =>
    render(
        <WorkspaceSidebar
            sessions={[
                {
                    id: "chat-1",
                    title: "当前对话",
                    status: "done",
                    updatedAt: "2026-10-14 12:00:00",
                },
            ]}
            activeConversationId={activeConversationId}
            activeView={activeView}
            onNewConversation={vi.fn()}
            onSelectConversation={vi.fn()}
            onTogglePin={vi.fn()}
            onOpenSettings={vi.fn()}
            onSelectView={vi.fn()}
        />,
    );

describe("WorkspaceSidebar selection", () => {
    it("selects the active conversation without also selecting new conversation", () => {
        renderSidebar({ activeConversationId: "chat-1" });

        const newConversation = screen
            .getByText("新建对话")
            .closest("button");
        const selectedConversation = screen
            .getByText("当前对话")
            .closest(".group");

        expect(selectedConversation).toHaveClass("bg-surface-muted");
        expect(newConversation).not.toHaveClass("bg-surface-muted");
        expect(newConversation).not.toHaveAttribute("aria-current", "page");
    });

    it("uses the same selection style and clears chat selection for workspace views", () => {
        renderSidebar({ activeConversationId: "chat-1", activeView: "articles" });

        const workspaceNav = within(
            screen.getByRole("navigation", { name: "工具" }),
        );
        const selectedView = workspaceNav.getByRole("button", {
            name: "文章",
        });
        const conversation = screen.getByText("当前对话").closest(".group");

        expect(selectedView).toHaveClass("bg-surface-muted", "text-ink");
        expect(selectedView).toHaveAttribute("aria-current", "page");
        expect(conversation).not.toHaveClass("bg-surface-muted");
    });

    it("selects new conversation only when no chat or workspace view is active", () => {
        renderSidebar();

        const newConversation = screen
            .getByText("新建对话")
            .closest("button");
        const conversation = screen.getByText("当前对话").closest(".group");

        expect(newConversation).toHaveClass("bg-surface-muted", "text-ink");
        expect(newConversation).toHaveAttribute("aria-current", "page");
        expect(conversation).not.toHaveClass("bg-surface-muted");
    });
});

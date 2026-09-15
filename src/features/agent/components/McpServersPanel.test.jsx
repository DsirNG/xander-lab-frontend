import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("@/hooks/useToast", () => ({
    useToast: () => ({ success: toastSuccess, error: toastError }),
}));

// 工厂只跑一次，t 在所有渲染之间保持同一引用——真实的 react-i18next 也是稳定的。
// 每次渲染都返回新函数的话，loadData 的 useCallback([t]) 会不断重建，列表会无限重取。
// initReactI18next 必须一并给出：组件链会经 @api 引到 locales/index.js，
// 那里要 .use(initReactI18next)，缺了它整个测试文件起不来。
vi.mock("react-i18next", () => {
    const t = (key) => key;
    return {
        useTranslation: () => ({ t }),
        initReactI18next: { type: "3rdParty", init: () => {} },
    };
});

import McpServersPanel from "./McpServersPanel";

const server = (over = {}) => ({
    id: 1,
    serverKey: "github",
    displayName: "GitHub",
    endpointUrl: "https://mcp.example.com/mcp",
    enabled: true,
    platformOwned: true,
    headersConfigured: false,
    tools: [{ name: "create_issue", description: "建 issue", inputSchema: null }],
    lastStatus: "OK",
    lastError: null,
    ...over,
});

const buildService = (over = {}) => ({
    list: vi.fn().mockResolvedValue([server()]),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    probe: vi.fn(),
    ...over,
});

describe("McpServersPanel", () => {
    beforeEach(() => {
        toastSuccess.mockReset();
        toastError.mockReset();
    });

    it("渲染服务器名称、标识、端点与工具数", async () => {
        const service = buildService();

        render(<McpServersPanel service={service} variant="user" />);

        expect(await screen.findByText("GitHub")).toBeInTheDocument();
        expect(screen.getByText("github")).toBeInTheDocument();
        expect(
            screen.getByText("https://mcp.example.com/mcp"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("blog.agentMcp.toolsCount"),
        ).toBeInTheDocument();
    });

    // 与 AgentSkillsPage 同一类缺陷：加载失败曾被渲染成"还没有数据"的空态，
    // 用户既看不到原因也没有重试入口。
    it("加载失败时给出错误态与重试，而不是伪装成空列表", async () => {
        const service = buildService({
            list: vi.fn().mockRejectedValue(new Error("boom")),
        });

        render(<McpServersPanel service={service} variant="user" />);

        expect(await screen.findByText("boom")).toBeInTheDocument();
        expect(screen.getByText("blog.agentImages.retry")).toBeInTheDocument();
        expect(
            screen.queryByText("blog.agentMcp.emptyTitle"),
        ).not.toBeInTheDocument();
    });

    it("测试连接成功后重新拉取列表并提示工具数", async () => {
        const service = buildService({
            probe: vi.fn().mockResolvedValue({ lastStatus: "OK", tools: [{}] }),
        });

        render(<McpServersPanel service={service} variant="user" />);

        await screen.findByText("GitHub");
        expect(service.list).toHaveBeenCalledTimes(1);

        fireEvent.click(
            screen.getByLabelText("blog.agentMcp.probeFor"),
        );

        await waitFor(() => expect(service.probe).toHaveBeenCalledWith(1));
        await waitFor(() => expect(service.list).toHaveBeenCalledTimes(2));
        expect(toastSuccess).toHaveBeenCalledWith("blog.agentMcp.probeOk");
        expect(toastError).not.toHaveBeenCalled();
    });

    /**
     * 探测失败在后端不是 HTTP 错误，而是 lastStatus=FAILED + lastError。
     * 所以这里必须按返回体判断，不能只看有没有抛异常——否则连不上会被报成成功。
     */
    it("测试连接失败时按返回体报错，不谎报成功", async () => {
        const service = buildService({
            probe: vi.fn().mockResolvedValue({
                lastStatus: "FAILED",
                lastError: "连接远端 MCP 服务器失败：connection refused",
            }),
        });

        render(<McpServersPanel service={service} variant="user" />);

        await screen.findByText("GitHub");
        fireEvent.click(screen.getByLabelText("blog.agentMcp.probeFor"));

        await waitFor(() =>
            expect(toastError).toHaveBeenCalledWith(
                "连接远端 MCP 服务器失败：connection refused",
            ),
        );
        expect(toastSuccess).not.toHaveBeenCalled();
    });

    it("删除走二次确认，确认后调用删除并重新拉取列表", async () => {
        const service = buildService({
            remove: vi.fn().mockResolvedValue(undefined),
        });

        render(<McpServersPanel service={service} variant="user" />);

        await screen.findByText("GitHub");
        fireEvent.click(screen.getByLabelText("blog.agentMcp.actionsFor"));
        fireEvent.click(
            screen.getByRole("menuitem", { name: "blog.agentMcp.delete" }),
        );
        expect(
            await screen.findByText("blog.agentMcp.deleteTitle"),
        ).toBeInTheDocument();

        fireEvent.click(
            screen.getByRole("button", { name: "blog.agentMcp.delete" }),
        );

        await waitFor(() => expect(service.remove).toHaveBeenCalledWith(1));
        await waitFor(() => expect(service.list).toHaveBeenCalledTimes(2));
        expect(toastSuccess).toHaveBeenCalled();
    });

    it("删除失败时提示错误，且不谎报成功", async () => {
        const service = buildService({
            remove: vi.fn().mockRejectedValue(new Error("forbidden")),
        });

        render(<McpServersPanel service={service} variant="user" />);

        await screen.findByText("GitHub");
        fireEvent.click(screen.getByLabelText("blog.agentMcp.actionsFor"));
        fireEvent.click(
            screen.getByRole("menuitem", { name: "blog.agentMcp.delete" }),
        );
        fireEvent.click(
            screen.getByRole("button", { name: "blog.agentMcp.delete" }),
        );

        await waitFor(() =>
            expect(toastError).toHaveBeenCalledWith("forbidden"),
        );
        expect(toastSuccess).not.toHaveBeenCalled();
        // 失败后不应重取列表，否则看起来像删掉了。
        expect(service.list).toHaveBeenCalledTimes(1);
    });

    it("尚未探测过的服务器显示未探测状态", async () => {
        const service = buildService({
            list: vi
                .fn()
                .mockResolvedValue([server({ lastStatus: null, tools: [] })]),
        });

        render(<McpServersPanel service={service} variant="user" />);

        expect(
            await screen.findByText("blog.agentMcp.statusNever"),
        ).toBeInTheDocument();
        expect(screen.getByText("blog.agentMcp.noTools")).toBeInTheDocument();
    });
});

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("@/hooks/useToast", () => ({
    useToast: () => ({ success: toastSuccess, error: toastError }),
}));

// initReactI18next 必须一并给出：组件链会经 @api 引到 locales/index.js，
// 那里要 .use(initReactI18next)，缺了它整个测试文件起不来。
vi.mock("react-i18next", () => {
    const t = (key) => key;
    return {
        useTranslation: () => ({ t }),
        initReactI18next: { type: "3rdParty", init: () => {} },
    };
});

import McpServerFormModal from "./McpServerFormModal";

const existing = (over = {}) => ({
    id: 1,
    serverKey: "github",
    displayName: "GitHub",
    endpointUrl: "https://mcp.example.com/mcp",
    enabled: true,
    platformOwned: false,
    headersConfigured: true,
    tools: [],
    lastStatus: "OK",
    lastError: null,
    ...over,
});

const buildService = (over = {}) => ({
    list: vi.fn(),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    remove: vi.fn(),
    probe: vi.fn(),
    ...over,
});

const fill = (label, value) => {
    const field = screen.getByLabelText(label);
    fireEvent.change(field, { target: { value } });
    return field;
};

describe("McpServerFormModal", () => {
    beforeEach(() => {
        toastSuccess.mockReset();
        toastError.mockReset();
    });

    it("新增时提交裁剪后的字段与解析出的请求头", async () => {
        const service = buildService();
        const onSaved = vi.fn();

        render(
            <McpServerFormModal
                isOpen
                service={service}
                prefill={null}
                onClose={vi.fn()}
                onSaved={onSaved}
            />,
        );

        fill("blog.agentMcp.fieldKey", "  github  ");
        fill("blog.agentMcp.fieldName", "  GitHub  ");
        fill("blog.agentMcp.fieldEndpoint", " https://mcp.example.com/mcp ");
        fill("blog.agentMcp.fieldHeaders", "Authorization: Bearer abc");
        // 这个 label 里除了标题还嵌了一段说明，所以可访问名是两者拼接，
        // 用精确文本取不到，得用正则匹配。
        fireEvent.click(
            screen.getByRole("checkbox", {
                name: /blog\.agentMcp\.formEnabled/,
            }),
        );

        fireEvent.click(screen.getByRole("button", { name: "common.save" }));

        await waitFor(() =>
            expect(service.create).toHaveBeenCalledWith({
                serverKey: "github",
                displayName: "GitHub",
                endpointUrl: "https://mcp.example.com/mcp",
                enabled: true,
                headers: { Authorization: "Bearer abc" },
            }),
        );
        await waitFor(() => expect(onSaved).toHaveBeenCalled());
    });

    /** 与后端 @Pattern 一致：明知会被拒就不该发这一趟请求。 */
    it("服务器标识不合法时本地拦下，不发请求", async () => {
        const service = buildService();

        render(
            <McpServerFormModal
                isOpen
                service={service}
                prefill={null}
                onClose={vi.fn()}
            />,
        );

        fill("blog.agentMcp.fieldKey", "GitHub");
        fill("blog.agentMcp.fieldName", "GitHub");
        fill("blog.agentMcp.fieldEndpoint", "https://mcp.example.com/mcp");
        fireEvent.click(screen.getByRole("button", { name: "common.save" }));

        expect(
            await screen.findByText("blog.agentMcp.formKeyInvalid"),
        ).toBeInTheDocument();
        expect(service.create).not.toHaveBeenCalled();
    });

    /** 明文 HTTP 会让远端凭据在链路上裸奔，后端也会拒。 */
    it("端点不是 HTTPS 时本地拦下", async () => {
        const service = buildService();

        render(
            <McpServerFormModal
                isOpen
                service={service}
                prefill={null}
                onClose={vi.fn()}
            />,
        );

        fill("blog.agentMcp.fieldKey", "github");
        fill("blog.agentMcp.fieldName", "GitHub");
        fill("blog.agentMcp.fieldEndpoint", "http://mcp.example.com/mcp");
        fireEvent.click(screen.getByRole("button", { name: "common.save" }));

        expect(
            await screen.findByText("blog.agentMcp.formEndpointNotHttps"),
        ).toBeInTheDocument();
        expect(service.create).not.toHaveBeenCalled();
    });

    it("请求头格式不对时指出行号并拦下", async () => {
        const service = buildService();

        render(
            <McpServerFormModal
                isOpen
                service={service}
                prefill={null}
                onClose={vi.fn()}
            />,
        );

        fill("blog.agentMcp.fieldKey", "github");
        fill("blog.agentMcp.fieldName", "GitHub");
        fill("blog.agentMcp.fieldEndpoint", "https://mcp.example.com/mcp");
        fill("blog.agentMcp.fieldHeaders", "ok: 1\nbad line");
        fireEvent.click(screen.getByRole("button", { name: "common.save" }));

        expect(
            await screen.findByText("blog.agentMcp.formHeadersInvalid"),
        ).toBeInTheDocument();
        expect(service.create).not.toHaveBeenCalled();
    });

    it("编辑时回填并把服务器标识锁住", async () => {
        const service = buildService();

        render(
            <McpServerFormModal
                isOpen
                service={service}
                prefill={existing()}
                onClose={vi.fn()}
            />,
        );

        expect(screen.getByLabelText("blog.agentMcp.fieldKey")).toBeDisabled();
        expect(screen.getByLabelText("blog.agentMcp.fieldKey")).toHaveValue(
            "github",
        );
        expect(screen.getByLabelText("blog.agentMcp.fieldName")).toHaveValue(
            "GitHub",
        );
    });

    /**
     * 编辑时请求头留空表示「保留原值」，不是「清空」。
     *
     * 后端不回传明文，误清空就再也填不回来了——所以这两种意图必须用不同的载荷区分开。
     */
    it("编辑时留空请求头表示保留原凭据（发 null）", async () => {
        const service = buildService();

        render(
            <McpServerFormModal
                isOpen
                service={service}
                prefill={existing()}
                onClose={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "common.save" }));

        await waitFor(() =>
            expect(service.update).toHaveBeenCalledWith(
                1,
                expect.objectContaining({ headers: null }),
            ),
        );
    });

    it("勾选清除后才发空对象，明确要求删掉凭据", async () => {
        const service = buildService();

        render(
            <McpServerFormModal
                isOpen
                service={service}
                prefill={existing()}
                onClose={vi.fn()}
            />,
        );

        fireEvent.click(
            screen.getByLabelText("blog.agentMcp.formClearHeaders"),
        );
        fireEvent.click(screen.getByRole("button", { name: "common.save" }));

        await waitFor(() =>
            expect(service.update).toHaveBeenCalledWith(
                1,
                expect.objectContaining({ headers: {} }),
            ),
        );
    });

    it("服务端拒绝时把原因显示在表单里", async () => {
        const service = buildService({
            create: vi
                .fn()
                .mockRejectedValue(new Error("已存在同名标识的服务器：github")),
        });

        render(
            <McpServerFormModal
                isOpen
                service={service}
                prefill={null}
                onClose={vi.fn()}
            />,
        );

        fill("blog.agentMcp.fieldKey", "github");
        fill("blog.agentMcp.fieldName", "GitHub");
        fill("blog.agentMcp.fieldEndpoint", "https://mcp.example.com/mcp");
        fireEvent.click(screen.getByRole("button", { name: "common.save" }));

        expect(
            await screen.findByText("已存在同名标识的服务器：github"),
        ).toBeInTheDocument();
        expect(toastSuccess).not.toHaveBeenCalled();
    });
});

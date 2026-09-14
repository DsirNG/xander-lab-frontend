import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getMock = vi.fn();

vi.mock("@api", () => ({
    get: (...args) => getMock(...args),
}));

vi.mock("react-router-dom", () => ({
    useParams: () => ({ shareToken: "share-token" }),
}));

// 交付卡里的 CodeBlock 会读 common.codeBlock.* 文案；测试把 @api 与路由都替换掉了，
// 没有任何入口再初始化 i18n，t() 会直接回键名，断言就没法写。
import "@locales";
import AgentSharedView from "./AgentSharedView";

const IMAGE_URL = "https://cdn.example.com/agent/cat.png";

const sharedPayload = (messages) => ({
    conversation: { title: "分享的对话" },
    messages,
});

const imageResultMessage = {
    id: 11,
    role: "assistant",
    kind: "tool_result",
    content: JSON.stringify({
        tool: "image_generate",
        url: IMAGE_URL,
        title: "可爱小猫",
    }),
};

describe("AgentSharedView 图片结果", () => {
    beforeEach(() => {
        getMock.mockReset();
    });

    it("渲染图片本身，而不是把图片地址当文本展示出来", async () => {
        getMock.mockResolvedValue(
            sharedPayload([
                imageResultMessage,
                {
                    id: 12,
                    role: "assistant",
                    kind: "answer",
                    content: `图片已经生成好了，地址：${IMAGE_URL}`,
                },
            ]),
        );

        render(<AgentSharedView />);

        const image = await screen.findByRole("img", { name: "可爱小猫" });
        expect(image).toHaveAttribute("src", IMAGE_URL);
        expect(screen.queryByText(IMAGE_URL)).not.toBeInTheDocument();
    });

    it("回答里的图片 Markdown 只保留图片，不保留模型附带的链接文案", async () => {
        getMock.mockResolvedValue(
            sharedPayload([
                {
                    id: 21,
                    role: "assistant",
                    kind: "answer",
                    content: `已生成图片。\n\n![可爱小猫](${IMAGE_URL})\n\n下载链接：${IMAGE_URL}`,
                },
            ]),
        );

        render(<AgentSharedView />);

        await waitFor(() => expect(getMock).toHaveBeenCalled());
        expect(await screen.findByRole("img", { name: "可爱小猫" })).toHaveAttribute(
            "src",
            IMAGE_URL,
        );
        expect(screen.queryByText(IMAGE_URL)).not.toBeInTheDocument();
    });
});

const artifactMessage = {
    id: 31,
    role: "assistant",
    kind: "artifact",
    content: JSON.stringify({
        type: "artifact",
        id: "artifact-1-1",
        name: "WebSocket 聊天示例",
        framework: "node",
        runHint: "npm install && node server.js",
        entry: "server.js",
        files: [
            {
                path: "server.js",
                language: "javascript",
                content: "const ws = require('ws');",
            },
            {
                path: "public/index.html",
                language: "html",
                content: '<div id="app"></div>',
            },
        ],
    }),
};

describe("AgentSharedView 交付卡", () => {
    beforeEach(() => {
        getMock.mockReset();
    });

    // 发卡之后模型被要求"reply 只写怎么跑起来，不要把源码再粘一遍"，
    // 所以分享页漏掉这张卡，读者看到的就是一段没有代码的运行说明。
    it("渲染交付卡的文件树与源码，而不是把负载整条丢掉", async () => {
        getMock.mockResolvedValue(sharedPayload([artifactMessage]));

        const { container } = render(<AgentSharedView />);

        // 卡片标题来自负载本身，不受语言影响。
        expect(
            await screen.findByText("WebSocket 聊天示例"),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("tab", { name: /server\.js/ }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("tab", { name: /public\/index\.html/ }),
        ).toBeInTheDocument();
        expect(container.textContent).toContain("require('ws')");
        expect(container.textContent).toContain(
            "npm install && node server.js",
        );
    });

    it("负载不可渲染时既不出卡片，也不把原始 JSON 当正文吐出来", async () => {
        getMock.mockResolvedValue(
            sharedPayload([
                {
                    id: 41,
                    role: "assistant",
                    kind: "artifact",
                    content: JSON.stringify({ type: "artifact", files: [] }),
                },
            ]),
        );

        const { container } = render(<AgentSharedView />);

        await waitFor(() => expect(getMock).toHaveBeenCalled());
        expect(screen.queryByRole("tab")).not.toBeInTheDocument();
        expect(container.textContent).not.toContain('"files"');
    });
});

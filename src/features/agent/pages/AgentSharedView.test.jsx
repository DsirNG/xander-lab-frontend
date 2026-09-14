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

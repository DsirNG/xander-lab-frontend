import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ArtifactCard from "./ArtifactCard";
import { parseArtifactPayload } from "./artifactPayload";

const { translate } = vi.hoisted(() => ({
    // 断言不跟着界面语言走：key 直出，插值拼在后面。
    translate: (key, options) =>
        options ? `${key}:${Object.values(options).join(",")}` : key,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: translate }),
}));

// 高亮组件很重，而这里要断言的只是"哪个文件的源码在展示"，换成可读的替身。
vi.mock("@components/common/CodeBlock", () => ({
    default: ({ code, language }) => (
        <div data-testid="code-block" data-language={language}>
            {code}
        </div>
    ),
}));

const payload = {
    type: "artifact",
    id: "artifact-7-3",
    name: "WebSocket 聊天示例",
    framework: "node",
    runHint: "npm install && node server.js",
    entry: "public/index.html",
    files: [
        {
            path: "server.js",
            language: "javascript",
            content: "const ws = 1;",
            truncated: true,
        },
        {
            path: "public/index.html",
            language: "html",
            content: "<!doctype html>",
            truncated: false,
        },
    ],
};

describe("parseArtifactPayload", () => {
    it("reads the payload back out of a persisted artifact message", () => {
        // 刷新后负载是 content 里的 JSON 字符串，认不出来代码就"刚才还在、刷新就没了"。
        expect(
            parseArtifactPayload({
                id: 91,
                kind: "artifact",
                content: JSON.stringify(payload),
            }),
        ).toEqual(payload);
    });

    it("also accepts the live event shape and the tool result wrapper", () => {
        expect(parseArtifactPayload({ type: "artifact", payload })).toEqual(
            payload,
        );
        expect(parseArtifactPayload(payload)).toEqual(payload);
        expect(
            parseArtifactPayload({
                content: JSON.stringify({ ok: true, artifact: payload }),
            }),
        ).toEqual(payload);
    });

    it("drops file entries that have nothing to render", () => {
        const parsed = parseArtifactPayload({
            kind: "artifact",
            content: JSON.stringify({
                type: "artifact",
                files: [
                    { path: "a.js", content: "x" },
                    { path: "   ", content: "y" },
                    { path: "b.js" },
                ],
            }),
        });

        expect(parsed.files).toEqual([{ path: "a.js", content: "x" }]);
    });

    it("returns null for anything that is not a deliverable", () => {
        // 页面拿它当判断条件：返回空壳会让消息既不是卡片也不是正文，直接从时间线上消失。
        expect(parseArtifactPayload(null)).toBe(null);
        expect(
            parseArtifactPayload({ kind: "answer", content: "已完成 WebSocket 示例" }),
        ).toBe(null);
        expect(parseArtifactPayload({ kind: "artifact", content: "{" })).toBe(
            null,
        );
        expect(
            parseArtifactPayload({
                kind: "artifact",
                content: JSON.stringify({ type: "artifact", files: [] }),
            }),
        ).toBe(null);
    });
});

describe("ArtifactCard", () => {
    let blobs;
    let clicks;
    let revoked;

    beforeEach(() => {
        blobs = [];
        clicks = [];
        revoked = [];
        // jsdom 没有 Blob URL，换成能断言的替身。
        URL.createObjectURL = vi.fn((blob) => {
            blobs.push(blob);
            return "blob:artifact";
        });
        URL.revokeObjectURL = vi.fn((url) => revoked.push(url));
        vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
            function record() {
                clicks.push({
                    href: this.getAttribute("href"),
                    download: this.download,
                });
            },
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
        delete URL.createObjectURL;
        delete URL.revokeObjectURL;
    });

    it("opens on the entry file and lists every file as a tab", () => {
        render(<ArtifactCard payload={payload} />);

        const tabs = screen.getAllByRole("tab");
        expect(tabs.map((tab) => tab.getAttribute("title"))).toEqual([
            "server.js",
            "public/index.html",
        ]);
        expect(tabs[1]).toHaveAttribute("aria-selected", "true");
        expect(tabs[1]).toHaveTextContent("blog.agentChat.artifactEntry");
        expect(tabs[0]).not.toHaveTextContent("blog.agentChat.artifactEntry");
        expect(screen.getByTestId("code-block")).toHaveTextContent(
            "<!doctype html>",
        );
        expect(screen.getByTestId("code-block")).toHaveAttribute(
            "data-language",
            "html",
        );
        expect(
            screen.getByRole("region", { name: "WebSocket 聊天示例" }),
        ).toBeInTheDocument();
        expect(screen.getByText("node")).toBeInTheDocument();
        expect(
            screen.getByText("npm install && node server.js"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("blog.agentChat.artifactFileCount:2"),
        ).toBeInTheDocument();
    });

    it("swaps the shown source when another file is picked", () => {
        render(<ArtifactCard payload={payload} />);

        // 预览提示只对当前展示的文件有意义：入口是 html 才提示能预览。
        expect(
            screen.getByText("blog.agentChat.artifactPreviewHint"),
        ).toBeInTheDocument();
        expect(
            screen.queryByText("blog.agentChat.artifactTruncated"),
        ).not.toBeInTheDocument();

        fireEvent.click(screen.getAllByRole("tab")[0]);

        expect(screen.getByTestId("code-block")).toHaveTextContent(
            "const ws = 1;",
        );
        expect(screen.getAllByRole("tab")[0]).toHaveAttribute(
            "aria-selected",
            "true",
        );
        expect(
            screen.queryByText("blog.agentChat.artifactPreviewHint"),
        ).not.toBeInTheDocument();
        // 截断是按文件标的：只有被截断的那个文件展示时才该提示。
        expect(
            screen.getByText("blog.agentChat.artifactTruncated"),
        ).toBeInTheDocument();
    });

    it("hands the shown file to the browser as a download", async () => {
        render(<ArtifactCard payload={payload} />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "blog.agentChat.artifactDownloadFile:index.html",
            }),
        );

        expect(blobs).toHaveLength(1);
        expect(await blobs[0].text()).toBe("<!doctype html>");
        // 文件名取路径最后一段，用户存下来的是 index.html 而不是 public/index.html。
        expect(clicks).toEqual([
            { href: "blob:artifact", download: "index.html" },
        ]);
        expect(revoked).toEqual(["blob:artifact"]);
    });

    it("renders nothing when there is no file to show", () => {
        // 空卡片比没有卡片更糟：用户以为交付了，点开什么也没有。
        expect(
            render(<ArtifactCard payload={{ type: "artifact", files: [] }} />)
                .container,
        ).toBeEmptyDOMElement();
        expect(render(<ArtifactCard payload={null} />).container).toBeEmptyDOMElement();
    });

    it("falls back to a generic title and to the extension as the language", () => {
        render(
            <ArtifactCard
                payload={{
                    type: "artifact",
                    files: [{ path: "scripts/run.py", content: "print(1)" }],
                }}
            />,
        );

        expect(
            screen.getByRole("region", { name: "blog.agentChat.artifactTitle" }),
        ).toBeInTheDocument();
        expect(screen.getByTestId("code-block")).toHaveAttribute(
            "data-language",
            "py",
        );
        // 只有一个文件时不必标"入口"。
        expect(
            screen.queryByText("blog.agentChat.artifactEntry"),
        ).not.toBeInTheDocument();
    });

    it("keeps showing a file after the payload is replaced mid-run", () => {
        // 模型改了一版会重发同一张卡：选中的文件可能已经不在新负载里，卡片不能因此空掉。
        const { rerender } = render(<ArtifactCard payload={payload} />);

        rerender(
            <ArtifactCard
                payload={{
                    ...payload,
                    entry: "server.js",
                    files: [payload.files[0]],
                }}
            />,
        );

        expect(screen.getAllByRole("tab")).toHaveLength(1);
        expect(screen.getByTestId("code-block")).toHaveTextContent(
            "const ws = 1;",
        );
    });
});

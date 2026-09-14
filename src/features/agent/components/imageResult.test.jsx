import { describe, expect, it } from "vitest";
import {
    cleanImageMarkdown,
    containsResultUrl,
    imageToolResult,
    imageUrlsFromMessages,
    imageUrlsFromSteps,
    isImageTool,
    liveImageStepResult,
} from "./imageResult";

const URL = "https://cdn.example.com/photos/blog/agent/cat.png";
const OTHER_URL = "https://other.example.com/photo.png";

const toolResultMessage = (tool, url = URL) => ({
    id: 1,
    role: "assistant",
    kind: "tool_result",
    content: JSON.stringify({ tool, url, title: "小猫" }),
});

const toolEndStep = (tool, url = URL) => ({
    type: "tool",
    tool,
    phase: "end",
    result: { tool, url, title: "小猫" },
});

describe("图片工具判定", () => {
    it("生成与复用都算图片工具", () => {
        expect(isImageTool("image_generate")).toBe(true);
        expect(isImageTool("image_resend")).toBe(true);
        expect(isImageTool("query_posts")).toBe(false);
        expect(isImageTool(null)).toBe(false);
    });

    it("持久化消息里两种图片工具都认", () => {
        expect(imageToolResult(toolResultMessage("image_generate"))?.url).toBe(URL);
        expect(imageToolResult(toolResultMessage("image_resend"))?.url).toBe(URL);
    });

    it("流式步骤里复用图片也要认，否则流式期间图片不渲染、地址也去不掉", () => {
        expect(liveImageStepResult(toolEndStep("image_generate"))?.url).toBe(URL);
        expect(liveImageStepResult(toolEndStep("image_resend"))?.url).toBe(URL);
    });

    it("没结束的工具步骤不产生图片结果", () => {
        expect(
            liveImageStepResult({ ...toolEndStep("image_generate"), phase: "start" }),
        ).toBe(null);
    });
});

describe("图片地址集合", () => {
    it("两种图片工具的结果都进集合，正文里的地址才拦得住", () => {
        expect([...imageUrlsFromMessages([toolResultMessage("image_resend")])]).toEqual([URL]);
        expect([...imageUrlsFromSteps([toolEndStep("image_resend")])]).toEqual([URL]);
    });

    it("非图片工具不进集合", () => {
        expect(imageUrlsFromMessages([toolResultMessage("query_posts")]).size).toBe(0);
    });

    it("判断正文是否在复述图片", () => {
        expect(containsResultUrl(`图片：${URL}`, new Set([URL]))).toBe(true);
        expect(containsResultUrl("没有地址", new Set([URL]))).toBe(false);
        expect(containsResultUrl(URL, new Set())).toBe(false);
    });
});

describe("流式半截地址", () => {
    it("地址还没写完就要认出来，否则真实地址会先闪一下再消失", () => {
        expect(
            containsResultUrl(`图片已生成：${URL.slice(0, 26)}`, new Set([URL])),
        ).toBe(true);
    });

    it("Markdown 图片写到一半也要认，此时它会以纯文本形式露出地址", () => {
        expect(
            containsResultUrl(`![AI 生成图片](${URL.slice(0, 22)}`, new Set([URL])),
        ).toBe(true);
    });

    it("刚开头的几个字符也算，不给地址留出闪现窗口", () => {
        expect(containsResultUrl("图片已生成：http", new Set([URL]))).toBe(true);
    });

    it("普通正文不会被误判", () => {
        expect(containsResultUrl("图片已生成，希望你喜欢。", new Set([URL]))).toBe(false);
        expect(containsResultUrl("已保存到素材库", new Set([URL]))).toBe(false);
    });

    it("没有已知地址时不猜测", () => {
        expect(containsResultUrl("图片已生成：http", new Set())).toBe(false);
    });
});

describe("cleanImageMarkdown", () => {
    it("有 Markdown 图片时只保留那张图，丢掉模型附带的说明", () => {
        const text = `已生成图片。\n\n![小猫](${URL})\n\n尺寸 1024x1024`;

        expect(cleanImageMarkdown(text, new Set([URL]))).toBe(`![小猫](${URL})`);
    });

    it("正文只贴裸地址时要把地址去掉，不能让用户看到真实存储地址", () => {
        const cleaned = cleanImageMarkdown(`图片已经生成好了，地址：${URL}`, new Set([URL]));

        expect(cleaned).not.toContain(URL);
        expect(cleaned).toContain("图片已经生成好了");
    });

    it("正文用普通链接指过去时也要把链接去掉", () => {
        const cleaned = cleanImageMarkdown(`[查看图片](${URL})`, new Set([URL]));

        expect(cleaned).not.toContain(URL);
        expect(cleaned).toBe("");
    });

    it("去掉地址时保留其他链接与段落结构", () => {
        const text = `参考[官网](https://example.com/docs)。\n\n图片：${URL}\n\n以上。`;
        const cleaned = cleanImageMarkdown(text, new Set([URL]));

        expect(cleaned).toContain("https://example.com/docs");
        expect(cleaned).not.toContain(URL);
        expect(cleaned.split("\n\n")).toHaveLength(3);
    });

    it("没有已知地址时不改动正文", () => {
        const text = "普通回复，没有任何图片。";

        expect(cleanImageMarkdown(text, new Set())).toBe(text);
        expect(cleanImageMarkdown(text, undefined)).toBe(text);
    });

    it("不误删与图片无关的其他地址", () => {
        const text = `图片：${URL}，参考 ${OTHER_URL}`;
        const cleaned = cleanImageMarkdown(text, new Set([URL]));

        expect(cleaned).not.toContain(URL);
        expect(cleaned).toContain(OTHER_URL);
    });
});

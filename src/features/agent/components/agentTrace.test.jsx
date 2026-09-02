import { describe, expect, it } from "vitest";
import {
    formatTracePayload,
    mergeLiveTraces,
    mergeToolTraces,
} from "./agentTrace.js";

const call = (id, tool, args) => ({
    id,
    kind: "tool_call",
    content: JSON.stringify({ tool, args }),
});

const result = (id, tool, payload) => ({
    id,
    kind: "tool_result",
    content: JSON.stringify({ tool, ...payload }),
});

describe("mergeToolTraces", () => {
    it("folds a call and its result into one trace so the inputs survive", () => {
        const merged = mergeToolTraces([
            { id: 1, kind: "message", content: "查一下" },
            call(2, "query_knowledge", { keyword: "websocket" }),
            result(3, "query_knowledge", { ok: true, data: ["条目 A"] }),
            { id: 4, kind: "answer", content: "查到了" },
        ]);

        expect(merged).toHaveLength(3);
        expect(merged[1]).toMatchObject({
            kind: "trace",
            tool: "query_knowledge",
            args: { keyword: "websocket" },
            status: "done",
        });
        expect(merged[1].result).toMatchObject({ ok: true });
        // 归并不能改变时间线上其他消息的顺序。
        expect(merged[0].kind).toBe("message");
        expect(merged[2].kind).toBe("answer");
    });

    it("marks a failed result as an error instead of a success", () => {
        const merged = mergeToolTraces([
            call(1, "publish_post", {}),
            result(2, "publish_post", { ok: false, error: "上游超时" }),
        ]);

        expect(merged).toHaveLength(1);
        expect(merged[0].status).toBe("error");
    });

    it("keeps a cancelled call distinguishable from a failure", () => {
        const merged = mergeToolTraces([
            call(1, "image_generate_v2", {}),
            result(2, "image_generate_v2", { cancelled: true }),
        ]);

        expect(merged[0].status).toBe("cancelled");
    });

    it("still renders an orphan result when the matching call is missing", () => {
        // 历史数据里有只落了结果的调用，不能因为找不到入参就把它丢掉。
        const merged = mergeToolTraces([result(1, "query_posts", { ok: true })]);

        expect(merged).toHaveLength(1);
        expect(merged[0]).toMatchObject({
            kind: "trace",
            tool: "query_posts",
            args: null,
            status: "done",
        });
    });

    it("leaves the image tool to the page's own image branch", () => {
        const messages = [
            call(1, "image_generate", { prompt: "猫" }),
            result(2, "image_generate", { ok: true, url: "https://x/1.png" }),
        ];

        const merged = mergeToolTraces(messages);

        expect(merged).toHaveLength(1);
        expect(merged[0]).toBe(messages[1]);
    });

    it("pairs each result with its own tool when two calls interleave", () => {
        const merged = mergeToolTraces([
            call(1, "query_knowledge", { keyword: "a" }),
            call(2, "query_posts", { keyword: "b" }),
            result(3, "query_posts", { ok: true }),
            result(4, "query_knowledge", { ok: false, error: "失败" }),
        ]);

        expect(merged).toHaveLength(2);
        expect(merged[0]).toMatchObject({
            tool: "query_knowledge",
            status: "error",
        });
        expect(merged[1]).toMatchObject({
            tool: "query_posts",
            status: "done",
        });
    });
});

describe("mergeLiveTraces", () => {
    it("collapses the four stream phases of one call into a single card", () => {
        const merged = mergeLiveTraces([
            { type: "thought", content: "先查一下" },
            {
                type: "tool",
                tool: "query_knowledge",
                phase: "start",
                args: { keyword: "websocket" },
            },
            {
                type: "tool",
                tool: "query_knowledge",
                phase: "progress",
                stage: "searching",
                message: "正在检索",
            },
            { type: "tool_delta", tool: "query_knowledge", content: "命中 3 条" },
            {
                type: "tool",
                tool: "query_knowledge",
                phase: "end",
                result: { ok: true },
            },
        ]);

        expect(merged).toHaveLength(2);
        expect(merged[1]).toMatchObject({
            type: "trace",
            tool: "query_knowledge",
            args: { keyword: "websocket" },
            stage: "searching",
            message: "正在检索",
            output: "命中 3 条",
            status: "done",
        });
    });

    it("holds the card at the position where the tool first appeared", () => {
        const merged = mergeLiveTraces([
            { type: "tool", tool: "query_posts", phase: "start" },
            { type: "thought", content: "顺便再想想" },
            { type: "tool", tool: "query_posts", phase: "end", result: {} },
        ]);

        expect(merged.map((step) => step.type)).toEqual(["trace", "thought"]);
    });

    it("reports a tool error and a user stop differently", () => {
        const failed = mergeLiveTraces([
            { type: "tool", tool: "publish_post", phase: "start" },
            {
                type: "tool",
                tool: "publish_post",
                phase: "error",
                error: "上游超时",
            },
        ]);
        const stopped = mergeLiveTraces([
            { type: "tool", tool: "publish_post", phase: "start" },
            {
                type: "tool",
                tool: "publish_post",
                phase: "error",
                cancelled: true,
            },
        ]);

        expect(failed[0]).toMatchObject({ status: "error", error: "上游超时" });
        expect(stopped[0].status).toBe("cancelled");
    });

    it("passes image steps through untouched", () => {
        const steps = [
            { type: "tool", tool: "image_generate", phase: "start" },
            { type: "tool", tool: "image_generate", phase: "end", result: {} },
        ];

        expect(mergeLiveTraces(steps)).toEqual(steps);
    });
});

describe("formatTracePayload", () => {
    it("pretty-prints objects and passes strings through", () => {
        expect(formatTracePayload({ a: 1 })).toBe('{\n  "a": 1\n}');
        expect(formatTracePayload("已完成")).toBe("已完成");
    });

    it("returns an empty string for nothing to show", () => {
        expect(formatTracePayload(null)).toBe("");
        expect(formatTracePayload("")).toBe("");
        expect(formatTracePayload(undefined)).toBe("");
    });

    it("truncates an oversized payload instead of freezing the card", () => {
        const formatted = formatTracePayload("x".repeat(50), 10);

        expect(formatted.startsWith("x".repeat(10))).toBe(true);
        expect(formatted).toContain("已截断");
    });
});

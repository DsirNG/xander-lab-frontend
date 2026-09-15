import { describe, expect, it } from "vitest";
import {
    formatTracePayload,
    mergeLiveTraces,
    mergeToolTraces,
} from "./agentTrace.js";

const call = (id, tool, args, invocationId) => ({
    id,
    kind: "tool_call",
    content: JSON.stringify({ tool, args }),
    ...(invocationId ? { invocationId } : {}),
});

const result = (id, tool, payload, invocationId) => ({
    id,
    kind: "tool_result",
    content: JSON.stringify({ tool, ...payload }),
    ...(invocationId ? { invocationId } : {}),
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

    it("leaves a successful code deliverable to its own card", () => {
        // 交付卡本身就是这次调用的展示物，再补一张轨迹卡等于把整份源码贴两遍。
        const merged = mergeToolTraces([
            call(1, "emit_artifact", {
                files: [{ path: "server.js", content: "const ws = 1;" }],
            }),
            result(2, "emit_artifact", { ok: true, fileCount: 1 }),
            { id: 3, kind: "answer", content: "怎么跑见卡片" },
        ]);

        expect(merged).toHaveLength(1);
        expect(merged[0].kind).toBe("answer");
    });

    it("still shows a trace when the deliverable was rejected", () => {
        // 否则交付失败就成了一次静默，用户又回到"它说做完了，我什么也没看见"。
        const merged = mergeToolTraces([
            call(1, "emit_artifact", {}),
            result(2, "emit_artifact", { ok: false, error: "文件路径不合法" }),
        ]);

        expect(merged).toHaveLength(1);
        expect(merged[0]).toMatchObject({
            kind: "trace",
            tool: "emit_artifact",
            status: "error",
        });
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

    /**
     * 并行批次落库的顺序是"先把所有 tool_call 写完，再按序写所有 tool_result"，
     * 所以两个调用会同时处于"已开单"状态。这条钉住没有 invocationId 时的回退路径
     * （历史消息就是这样）：按工具名配对，结果与调用名对上。
     */
    it("keeps two parallel calls apart when both calls precede both results", () => {
        const merged = mergeToolTraces([
            call(1, "query_knowledge", { keyword: "a" }),
            call(2, "query_posts", { keyword: "b" }),
            result(3, "query_knowledge", { ok: true, count: 3 }),
            result(4, "query_posts", { ok: true, count: 9 }),
        ]);

        expect(merged).toHaveLength(2);
        expect(merged[0]).toMatchObject({ tool: "query_knowledge", args: { keyword: "a" } });
        expect(merged[0].result).toMatchObject({ count: 3 });
        expect(merged[1]).toMatchObject({ tool: "query_posts", args: { keyword: "b" } });
        expect(merged[1].result).toMatchObject({ count: 9 });
    });

    /**
     * 同一步里两个**同名**工具：这是并行批次才可能出现的情况（一次查两个主题的知识点）。
     *
     * <p>按工具名配对在这里必然出错——第二次的 tool_call 会覆盖掉第一张卡的槽位，
     * 于是第一个结果挂到第二张卡上，第一张卡永远停在"执行中"。带上 invocationId 之后
     * 配对不再依赖名字，两张卡各自收口。</p>
     */
    it("keeps two same-named calls apart when they carry invocation ids", () => {
        const merged = mergeToolTraces([
            call(1, "query_knowledge", { keyword: "a" }, "inv-1"),
            call(2, "query_knowledge", { keyword: "b" }, "inv-2"),
            result(3, "query_knowledge", { ok: true, count: 1 }, "inv-1"),
            result(4, "query_knowledge", { ok: true, count: 2 }, "inv-2"),
        ]);

        expect(merged).toHaveLength(2);
        expect(merged[0]).toMatchObject({ args: { keyword: "a" }, status: "done" });
        expect(merged[0].result).toMatchObject({ count: 1 });
        expect(merged[1]).toMatchObject({ args: { keyword: "b" }, status: "done" });
        expect(merged[1].result).toMatchObject({ count: 2 });
    });

    /**
     * 并发批次里两个工具是同时跑的，先完成的那个先落库——结果的到达顺序与调用顺序无关。
     * 配对必须靠身份而不是位置，这条把"倒序到达"钉住。
     */
    it("pairs same-named calls whose results arrive out of order", () => {
        const merged = mergeToolTraces([
            call(1, "query_knowledge", { keyword: "a" }, "inv-1"),
            call(2, "query_knowledge", { keyword: "b" }, "inv-2"),
            result(3, "query_knowledge", { ok: true, count: 2 }, "inv-2"),
            result(4, "query_knowledge", { ok: true, count: 1 }, "inv-1"),
        ]);

        expect(merged).toHaveLength(2);
        expect(merged[0]).toMatchObject({ args: { keyword: "a" }, status: "done" });
        expect(merged[0].result).toMatchObject({ count: 1 });
        expect(merged[1]).toMatchObject({ args: { keyword: "b" }, status: "done" });
        expect(merged[1].result).toMatchObject({ count: 2 });
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

    it("keeps a successful deliverable out of the live timeline", () => {
        // 交付卡是以 artifact 步骤单独插进来的，轨迹卡再来一份就是并排两份源码。
        const steps = [
            { type: "tool", tool: "emit_artifact", phase: "start", args: {} },
            {
                type: "tool",
                tool: "emit_artifact",
                phase: "end",
                result: { ok: true },
            },
            { type: "artifact", payload: { id: "artifact-7-3" } },
        ];

        expect(mergeLiveTraces(steps)).toEqual([steps[2]]);
    });

    it("surfaces a failed deliverable even without a start step", () => {
        const merged = mergeLiveTraces([
            {
                type: "tool",
                tool: "emit_artifact",
                phase: "error",
                error: "文件路径不合法",
            },
        ]);

        expect(merged).toHaveLength(1);
        expect(merged[0]).toMatchObject({
            type: "trace",
            tool: "emit_artifact",
            status: "error",
            error: "文件路径不合法",
        });
    });

    it("opens a second card when the same tool runs twice in one round", () => {
        // 回归：槽位收口后不释放，第二次调用的入参和输出会被折进第一张卡，
        // 用户只看到"一次调用"，拿到的却是两次的结果（持久化那条路由 mergeToolTraces 的
        // "pairs each result with its own tool" 用例守着，这里是流式那条路）。
        const merged = mergeLiveTraces([
            {
                type: "tool",
                tool: "query_posts",
                phase: "start",
                args: { keyword: "a" },
            },
            {
                type: "tool",
                tool: "query_posts",
                phase: "end",
                result: { ok: true, count: 1 },
            },
            {
                type: "tool",
                tool: "query_posts",
                phase: "start",
                args: { keyword: "b" },
            },
            {
                type: "tool",
                tool: "query_posts",
                phase: "end",
                result: { ok: true, count: 2 },
            },
        ]);

        expect(merged).toHaveLength(2);
        expect(merged[0]).toMatchObject({
            args: { keyword: "a" },
            status: "done",
        });
        expect(merged[0].result).toMatchObject({ count: 1 });
        expect(merged[1]).toMatchObject({
            args: { keyword: "b" },
            status: "done",
        });
        expect(merged[1].result).toMatchObject({ count: 2 });
    });

    /**
     * 一步里的多个调用是并发跑的，事件顺序因此是"所有 start 先到、再按序到 end"，
     * 与"一次调用跑完再跑下一次"的旧顺序不同。这条守住那张卡不会互相折叠。
     */
    it("keeps two parallel calls apart when both starts precede both ends", () => {
        const merged = mergeLiveTraces([
            { type: "tool", tool: "query_knowledge", phase: "start", args: { keyword: "a" } },
            { type: "tool", tool: "query_posts", phase: "start", args: { keyword: "b" } },
            { type: "tool", tool: "query_knowledge", phase: "end", result: { ok: true, count: 3 } },
            { type: "tool", tool: "query_posts", phase: "end", result: { ok: true, count: 9 } },
        ]);

        expect(merged).toHaveLength(2);
        expect(merged[0]).toMatchObject({ tool: "query_knowledge", args: { keyword: "a" }, status: "done" });
        expect(merged[0].result).toMatchObject({ count: 3 });
        expect(merged[1]).toMatchObject({ tool: "query_posts", args: { keyword: "b" }, status: "done" });
        expect(merged[1].result).toMatchObject({ count: 9 });
    });

    /**
     * 同一步里两个**同名**工具的流式事件：只有带上 invocationId 才能分开。
     *
     * <p>按工具名归并时，第二次的 start 会覆盖掉第一张卡的槽位，于是第一个 end 落到第二张卡上、
     * 第一张卡永远停在"执行中"——用户看到一张转不完的卡和一张结果错位的卡。这条同时钉住
     * "两个调用各归各的"和"卡片位置按各自第一次出现算"。</p>
     */
    it("keeps two same-named calls apart when they carry invocation ids", () => {
        const merged = mergeLiveTraces([
            {
                type: "tool",
                tool: "query_knowledge",
                invocationId: "inv-1",
                phase: "start",
                args: { keyword: "a" },
            },
            {
                type: "tool",
                tool: "query_knowledge",
                invocationId: "inv-2",
                phase: "start",
                args: { keyword: "b" },
            },
            {
                type: "tool_delta",
                tool: "query_knowledge",
                invocationId: "inv-1",
                content: "命中 3 条",
            },
            {
                type: "tool",
                tool: "query_knowledge",
                invocationId: "inv-1",
                phase: "end",
                result: { ok: true, count: 3 },
            },
            {
                type: "tool",
                tool: "query_knowledge",
                invocationId: "inv-2",
                phase: "end",
                result: { ok: true, count: 9 },
            },
        ]);

        expect(merged).toHaveLength(2);
        expect(merged[0]).toMatchObject({
            invocationId: "inv-1",
            args: { keyword: "a" },
            output: "命中 3 条",
            status: "done",
        });
        expect(merged[0].result).toMatchObject({ count: 3 });
        expect(merged[1]).toMatchObject({
            invocationId: "inv-2",
            args: { keyword: "b" },
            status: "done",
        });
        expect(merged[1].result).toMatchObject({ count: 9 });
    });

    it("releases the slot after a failure so the retry is not folded into it", () => {
        // 失败后模型常常原样重试同一个工具：重试必须是新的一张卡，
        // 否则第一张卡会从"失败"变成"成功"，用户看不到中间那次失败。
        const merged = mergeLiveTraces([
            { type: "tool", tool: "publish_post", phase: "start", args: { id: 1 } },
            {
                type: "tool",
                tool: "publish_post",
                phase: "error",
                error: "上游超时",
            },
            { type: "tool", tool: "publish_post", phase: "start", args: { id: 1 } },
            { type: "tool", tool: "publish_post", phase: "end", result: { ok: true } },
        ]);

        expect(merged).toHaveLength(2);
        expect(merged[0]).toMatchObject({
            status: "error",
            error: "上游超时",
        });
        expect(merged[1].status).toBe("done");
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

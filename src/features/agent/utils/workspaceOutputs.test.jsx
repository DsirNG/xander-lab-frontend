import { describe, expect, it } from "vitest";
import { workspaceOutputs } from "./workspaceOutputs";

const result = (tool, payload) => ({
    kind: "tool_result",
    toolName: tool,
    content: JSON.stringify(payload),
});
const event = (tool, payload) => ({
    dataContent: JSON.stringify({ tool, result: payload }),
});

describe("workspaceOutputs service contracts", () => {
    it("restores a generated article from the private durable Workers event projection", () => {
        expect(
            workspaceOutputs(
                [],
                [event("blog_generate", { ok: true, taskId: 71 })],
            ).article.taskId,
        ).toBe("71");
    });
    it("opens the newest successful task from live outcomes, without inferring from answer text", () => {
        const outputs = workspaceOutputs(
            [
                result("blog_generate", { ok: true, taskId: 1 }),
                { kind: "answer", content: "Generated task 99" },
            ],
            [],
            [
                {
                    type: "tool",
                    phase: "end",
                    tool: "blog_generate",
                    result: { ok: true, taskId: 2 },
                },
            ],
        );
        expect(outputs.article.taskId).toBe("2");
        expect(
            workspaceOutputs([
                result("blog_generate", { ok: false, taskId: 3 }),
            ]).article,
        ).toBeNull();
    });
    it("rejects malformed tool results and only exposes recalled memory records", () => {
        expect(
            workspaceOutputs([
                result("recall_memory", {
                    ok: true,
                    items: [
                        {
                            memoryKey: "style",
                            content: "Concise",
                            updatedAt: "today",
                        },
                        { content: "no key" },
                    ],
                }),
            ]).memories,
        ).toHaveLength(1);
        expect(
            workspaceOutputs([{ kind: "tool_result", content: "bad json" }])
                .memories,
        ).toEqual([]);
    });
    it("removes stale recalled snapshots after correction or deletion", () => {
        const recalled = event("recall_memory", {
            ok: true,
            items: [{ memoryKey: "style", content: "Old" }],
        });
        expect(
            workspaceOutputs(
                [],
                [
                    recalled,
                    event("remember", {
                        ok: true,
                        action: "upsert",
                        memoryKey: "style",
                    }),
                ],
            ).memories,
        ).toEqual([]);
        expect(
            workspaceOutputs(
                [],
                [
                    recalled,
                    event("remember", {
                        ok: true,
                        action: "delete",
                        removed: true,
                    }),
                ],
            ).memories,
        ).toEqual([]);
    });
    it("reads the approval service's successful publication result without requiring a fictional ok field", () => {
        const published = {
            platform: "csdn",
            externalId: "abc",
            url: "https://blog.csdn.net/article/abc",
        };
        expect(
            workspaceOutputs(
                [result("publish_post", published)],
                [event("publish_post", published)],
            ).publications,
        ).toEqual([{ ...published, ok: true }]);
        expect(
            workspaceOutputs([
                result("publish_post", {
                    ok: false,
                    error: "Authorization expired",
                }),
            ]).publications,
        ).toEqual([
            expect.objectContaining({
                ok: false,
                error: "Authorization expired",
            }),
        ]);
    });
});

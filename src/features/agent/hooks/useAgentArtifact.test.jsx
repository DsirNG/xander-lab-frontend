import { act, renderHook, waitFor } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useAgentArtifact from "./useAgentArtifact";
import {
    getBlogAgentTask,
    getArticleDraft,
    saveArticleDraft,
    publishBlogAgentTask,
} from "@features/blog";

vi.mock("@features/blog", () => ({
    getBlogAgentTask: vi.fn(),
    getArticleDraft: vi.fn(),
    saveArticleDraft: vi.fn(),
    publishBlogAgentTask: vi.fn(),
}));
const t = (key) => key;
const toast = { success: vi.fn(), error: vi.fn(), warning: vi.fn() };
const navigate = vi.fn();
const taskData = {
    task: {
        id: 7,
        title: "Original",
        content: "Original body",
        categoryId: "tech",
        status: "ready",
    },
    versions: [{ id: 2, title: "Version", content: "Version body" }],
    tags: ["React"],
};
const edited = {
    title: "Edited",
    content: "Edited body",
    summary: "Summary",
    categoryId: "tech",
    tags: ["React"],
};

const harness = (initialSearch = "blogTaskId=7") =>
    renderHook(
        ({ taskId }) => {
            const [searchParams, setSearchParams] = useState(
                () => new URLSearchParams(initialSearch),
            );
            const artifact = useAgentArtifact({
                blogTaskId: taskId,
                stayInWorkspace: true,
                navigate,
                searchParams,
                setSearchParams,
                t,
                toast,
            });
            return { ...artifact, searchParams };
        },
        { initialProps: { taskId: "7" } },
    );

beforeEach(() => {
    vi.clearAllMocks();
    getBlogAgentTask.mockResolvedValue(taskData);
    getArticleDraft.mockResolvedValue({ id: 91, ...edited, status: 0 });
    saveArticleDraft.mockResolvedValue({ id: 91 });
});

describe("workspace server draft", () => {
    it("saves reviewed content remotely, keeps its route identity, and restores that content", async () => {
        const { result } = harness();
        await waitFor(() =>
            expect(result.current.artifactData).toEqual(taskData),
        );
        await act(async () => {
            await result.current.handleCreateArtifactDraft(edited);
        });
        expect(saveArticleDraft).toHaveBeenCalledWith(
            null,
            edited,
            expect.objectContaining({
                headers: { "Idempotency-Key": expect.any(String) },
            }),
        );
        await waitFor(() =>
            expect(result.current.artifactData.task.content).toBe(
                "Edited body",
            ),
        );
        expect(result.current.searchParams.get("draftPostId")).toBe("91");
        expect(getArticleDraft).toHaveBeenCalledWith("91", expect.any(Object));
        expect(publishBlogAgentTask).not.toHaveBeenCalled();
        expect(navigate).not.toHaveBeenCalled();
    });

    it("updates an existing saved draft rather than creating a second one", async () => {
        const { result } = harness("blogTaskId=7&draftPostId=91");
        await waitFor(() => expect(result.current.artifactLoading).toBe(false));
        await act(async () => {
            await result.current.handleCreateArtifactDraft(edited);
        });
        expect(saveArticleDraft).toHaveBeenCalledWith(
            "91",
            edited,
            expect.any(Object),
        );
    });

    it("preserves the idempotency key after an uncertain save and does not claim success", async () => {
        saveArticleDraft.mockRejectedValueOnce(
            new Error("network disconnected"),
        );
        const { result } = harness();
        await waitFor(() =>
            expect(result.current.artifactData).toEqual(taskData),
        );
        await act(async () => {
            expect(await result.current.handleCreateArtifactDraft(edited)).toBe(
                false,
            );
        });
        expect(toast.success).not.toHaveBeenCalled();
        await act(async () => {
            await result.current.handleCreateArtifactDraft(edited);
        });
        expect(saveArticleDraft.mock.calls[0][2].headers).toEqual(
            saveArticleDraft.mock.calls[1][2].headers,
        );
    });

    it("does not attach a late draft save to another article", async () => {
        let finish;
        saveArticleDraft.mockImplementationOnce(
            () =>
                new Promise((resolve) => {
                    finish = resolve;
                }),
        );
        const { result, rerender } = harness();
        await waitFor(() =>
            expect(result.current.artifactData).toEqual(taskData),
        );
        let saving;
        act(() => {
            saving = result.current.handleCreateArtifactDraft(edited);
        });
        rerender({ taskId: "8" });
        await act(async () => {
            finish({ id: 91 });
            await saving;
        });
        expect(result.current.searchParams.get("draftPostId")).toBeNull();
        expect(toast.success).not.toHaveBeenCalled();
    });
});

import { describe, expect, it, vi } from "vitest";
import { createUpload } from "./upload";

describe("upload request deadline", () => {
    it("preserves an explicit deadline through the shared upload transport", async () => {
        const post = vi.fn().mockResolvedValue({ id: 1 });
        const file = new File(["image"], "test.png", { type: "image/png" });
        await createUpload({ post })("/attachments", file, {
            config: { timeout: 90000, _silent: true },
        });
        expect(post.mock.calls[0][2]).toMatchObject({
            timeout: 90000,
            _silent: true,
            dedupe: false,
        });
        expect(post.mock.calls[0][1].get("file")).toBe(file);
    });

    it("preserves the existing unlimited default for callers without a deadline", async () => {
        const post = vi.fn().mockResolvedValue({ id: 1 });
        await createUpload({ post })("/upload", new File(["a"], "a.txt"));
        expect(post.mock.calls[0][2].timeout).toBe(0);
    });
});

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BlogManagePanel from "./BlogManagePanel";
import { blogService } from "../services/blogService";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key) => key }),
}));
vi.mock("@shared/hooks/useToast", () => ({
    useToast: () => ({ success: vi.fn() }),
}));
vi.mock("../services/blogService", () => ({
    BLOG_STATUS: { DRAFT: 0, PUBLISHED: 1 },
    blogService: { getMyBlogs: vi.fn() },
}));
vi.mock("./manage/ArticleSyncModal", () => ({ default: ({ post }) => <div>Sync:{post.id}</div> }));
vi.mock("./manage/BlogPreviewModal", () => ({ default: () => null }));
vi.mock("./BlogManageTable", () => ({
    default: ({ posts, onEdit, onSync, onPageChange }) => (
        <div>
            {posts.map((post) => (
                <div key={post.id}>
                    {post.title}
                    <button onClick={() => onEdit(post)}>edit</button>
                    <button onClick={() => onSync(post)}>sync</button>
                </div>
            ))}
            <button onClick={() => onPageChange(2)}>page2</button>
        </div>
    ),
}));
const Location = () => <output>{useLocation().search}</output>;
const mount = () =>
    render(
        <MemoryRouter>
            <BlogManagePanel />
            <Location />
        </MemoryRouter>,
    );
beforeEach(() => {
    vi.clearAllMocks();
    blogService.getMyBlogs.mockResolvedValue({
        records: [{ id: 17, title: "Saved article" }],
        total: 21,
    });
});

describe("article library", () => {
    it("loads persisted articles and resets pagination when filtering drafts", async () => {
        mount();
        await screen.findByText("Saved article");
        fireEvent.click(screen.getByText("page2"));
        await waitFor(() =>
            expect(blogService.getMyBlogs).toHaveBeenLastCalledWith(
                expect.objectContaining({ page: 2 }),
                expect.anything(),
            ),
        );
        fireEvent.click(
            screen.getByRole("button", {
                name: "profile.blogManage.status.draft",
            }),
        );
        await waitFor(() =>
            expect(blogService.getMyBlogs).toHaveBeenLastCalledWith(
                expect.objectContaining({ status: 0, page: 1 }),
                expect.anything(),
            ),
        );
    });
    it("opens the platform selection dialog for the saved article and preserves its edit ID", async () => {
        mount();
        await screen.findByText("Saved article");
        fireEvent.click(screen.getByText("sync"));
        expect(screen.getByText("Sync:17")).toBeInTheDocument();
        fireEvent.click(screen.getByText("edit"));
        expect(screen.getByText("?view=publish&id=17")).toBeInTheDocument();
    });
});

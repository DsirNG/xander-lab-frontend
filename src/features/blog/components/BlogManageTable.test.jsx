import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import BlogManageTable from "./BlogManageTable";
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key) => key }) }));
vi.mock("../services/blogService", () => ({ BLOG_STATUS: { DRAFT: 0, PUBLISHED: 1 } }));
const post = { id: 17, title: "Article", status: 0 };
it("executes menu callbacks without an event and does not trigger row preview", () => {
    const onSync = vi.fn(); const onEdit = vi.fn(); const onPreview = vi.fn();
    render(<BlogManageTable t={(key) => key} posts={[post]} loading={false} loadError={false} loadPosts={vi.fn()} page={1} pageSize={10} total={1} onPageChange={vi.fn()} onPageSizeChange={vi.fn()} onPreview={onPreview} onEdit={onEdit} onStatusChange={vi.fn()} onSync={onSync} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "profile.blogManage.actionsColumn" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "articleSync.title" }));
    expect(onSync).toHaveBeenCalledWith(post);
    expect(onPreview).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "profile.blogManage.actionsColumn" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "profile.blogManage.actions.edit" }));
    expect(onEdit).toHaveBeenCalledWith(post);
    expect(onPreview).not.toHaveBeenCalled();
});

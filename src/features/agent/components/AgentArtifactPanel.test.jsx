import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AgentArtifactPanel from "./AgentArtifactPanel";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

vi.mock("@features/blog", () => ({
    listArticleCategories: vi
        .fn()
        .mockResolvedValue([{ id: "tech", name: "Tech" }]),
    AgentPreviewPanel: () => <div>preview</div>,
}));

const taskData = {
    task: { title: "Original", content: "Original body", status: "ready" },
    versions: [{ id: 2, title: "Selected version", content: "Selected body" }],
};

describe("AgentArtifactPanel editing", () => {
    it("hands edited content from the selected version to the draft editor", () => {
        const onCreateDraft = vi.fn().mockResolvedValue(true);
        render(
            <MemoryRouter>
                <AgentArtifactPanel
                    editable
                    taskData={taskData}
                    selectedVersionId={2}
                    onCreateDraft={onCreateDraft}
                />
            </MemoryRouter>,
        );
        fireEvent.click(screen.getByRole("button", { name: "blog.edit" }));
        const title = screen.getByDisplayValue("Selected version");
        const content = screen.getByDisplayValue("Selected body");
        fireEvent.change(title, { target: { value: "Edited title" } });
        fireEvent.change(content, { target: { value: "Edited body" } });
        fireEvent.click(
            screen.getByRole("button", {
                name: "contentLibrary.saveToLibrary",
            }),
        );
        expect(onCreateDraft).toHaveBeenCalledWith(
            expect.objectContaining({
                title: "Edited title",
                content: "Edited body",
            }),
        );
    });

    it("cancel returns to the saved preview without publishing changes", () => {
        const onPublish = vi.fn();
        render(
            <MemoryRouter>
                <AgentArtifactPanel
                    editable
                    taskData={taskData}
                    onPublish={onPublish}
                />
            </MemoryRouter>,
        );
        fireEvent.click(screen.getByRole("button", { name: "blog.edit" }));
        fireEvent.click(screen.getByRole("button", { name: "common.cancel" }));
        expect(screen.getByText("preview")).toBeInTheDocument();
        expect(onPublish).not.toHaveBeenCalled();
    });
});

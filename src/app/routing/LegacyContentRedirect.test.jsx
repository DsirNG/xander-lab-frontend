import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import LegacyContentRedirect from "./LegacyContentRedirect";
const Location = () => (
    <output>
        {useLocation().pathname}
        {useLocation().search}
    </output>
);
describe("legacy content links", () => {
    it("keeps the article ID on old editor bookmarks", () => {
        render(
            <MemoryRouter initialEntries={["/workspace/publish?id=9"]}>
                <Routes>
                    <Route
                        path="/workspace/publish"
                        element={<LegacyContentRedirect view="publish" />}
                    />
                    <Route path="/app" element={<Location />} />
                </Routes>
            </MemoryRouter>,
        );
        expect(screen.getByText("/app?id=9&view=publish")).toBeInTheDocument();
    });
    it("restores the exact plan detail from an old plan link", () => {
        render(
            <MemoryRouter initialEntries={["/workspace/plans/22"]}>
                <Routes>
                    <Route
                        path="/workspace/plans/:id"
                        element={<LegacyContentRedirect view="plans" />}
                    />
                    <Route path="/app" element={<Location />} />
                </Routes>
            </MemoryRouter>,
        );
        expect(
            screen.getByText("/app?view=plans&planId=22"),
        ).toBeInTheDocument();
    });
});

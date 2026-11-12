import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { expect, it } from "vitest";
import ModelPlaygroundLink from "./ModelPlaygroundLink";

function Location() { const location = useLocation(); return <output data-testid="location">{location.pathname}{location.search}</output>; }
it("opens a test chat with the unsaved slot settings instead of making a generation request", () => {
    render(<MemoryRouter><ModelPlaygroundLink featureKey="blog_agent_image" payload={{ providerId: 7, model: "draft-model", apiStyle: "IMAGES_GENERATIONS", apiKey: "must-not-be-in-url" }} label="Test fallback" /><Location /></MemoryRouter>);
    fireEvent.click(screen.getByRole("button", { name: "Test fallback" }));
    const location = screen.getByTestId("location").textContent;
    expect(location).toContain("/admin/model-playground?");
    expect(location).toContain("providerId=7");
    expect(location).toContain("model=draft-model");
    expect(location).toContain("featureKey=blog_agent_image");
    expect(location).not.toContain("must-not-be-in-url");
});

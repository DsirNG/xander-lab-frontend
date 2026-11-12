import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import ModelProbeButton from "./ModelProbeButton";
import { adminService } from "../services/adminService";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key) => key }) }));
vi.mock("@api", () => ({ isRequestCancelled: () => false }));
vi.mock("../services/adminService", () => ({ adminService: { testProvider: vi.fn(), testFeatureModel: vi.fn() } }));
beforeEach(() => vi.clearAllMocks());

it("blocks duplicate clicks and displays a successful connection result", async () => {
    let resolve;
    adminService.testProvider.mockReturnValue(new Promise((done) => { resolve = done; }));
    render(<ModelProbeButton payload={{ baseUrl: "https://models.example", apiKey: "key" }} label="Test" />);
    fireEvent.click(screen.getByRole("button", { name: "Test" }));
    fireEvent.click(screen.getByRole("button", { name: "Test" }));
    expect(adminService.testProvider).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button")).toBeDisabled();
    await act(async () => resolve({ ok: true, reason: "success", latencyMs: 12 }));
    expect(screen.getByRole("status")).toHaveTextContent("admin.probe.success");
    expect(screen.getByRole("button")).not.toBeDisabled();
});

it("displays provider error details and clears them when the draft changes", async () => {
    adminService.testProvider.mockResolvedValue({ ok: false, reason: "upstream_error", latencyMs: 2, upstreamStatus: 400, error: { message: "Model not supported", code: "bad_model", param: "model" } });
    const { rerender } = render(<ModelProbeButton payload={{ providerId: 1, model: "old", apiStyle: "RESPONSES" }} label="Test" />);
    fireEvent.click(screen.getByRole("button", { name: "Test" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Model not supported"));
    expect(adminService.testProvider).toHaveBeenCalledWith( { providerId: 1, model: "old", apiStyle: "RESPONSES" }, expect.objectContaining({ _silent: true }));
    rerender(<ModelProbeButton payload={{ providerId: 2, model: "new", apiStyle: "RESPONSES" }} label="Test" />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("ignores stale responses and releases the button after errors", async () => {
    let resolve;
    adminService.testProvider.mockReturnValueOnce(new Promise((done) => { resolve = done; })).mockRejectedValueOnce(new Error("failure"));
    const { rerender } = render(<ModelProbeButton payload={{ baseUrl: "https://old.example" }} label="Test" />);
    fireEvent.click(screen.getByRole("button", { name: "Test" }));
    const signal = adminService.testProvider.mock.calls[0][1].signal;
    rerender(<ModelProbeButton payload={{ baseUrl: "https://new.example" }} label="Test" />);
    expect(signal.aborted).toBe(true);
    await act(async () => resolve({ ok: true, reason: "success", latencyMs: 1 }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Test" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("admin.probe.connection"));
    expect(screen.getByRole("button")).not.toBeDisabled();
});

import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminModelPlaygroundPage from "./AdminModelPlaygroundPage";
import { adminService } from "../services/adminService";

vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key) => key }) }));
vi.mock("@api", () => ({ isRequestCancelled: (error) => error?.name === "CanceledError" }));
vi.mock("@shared/ui/forms/CustomSelect", () => ({ default: ({ options, value, onChange, placeholder }) =>
    <select aria-label={placeholder} value={String(value ?? "")} onChange={(event) => onChange(options.find((option) => String(option.value) === event.target.value)?.value)}>
        {options.map((option) => <option key={option.value} value={String(option.value)}>{option.label}</option>)}
    </select> }));
vi.mock("../services/adminService", () => ({
    FEATURE_KEYS: ["agent", "blog_agent", "blog_agent_image", "img2three_vision", "recitation_asr"],
    adminService: { listProviders: vi.fn(), listFeatureConfigs: vi.fn(), testProvider: vi.fn(), testFeatureModel: vi.fn() },
}));
const providers = [
    { id: 1, name: "Provider A", enabled: true, apiKeyConfigured: true, baseUrl: "https://a.example/v1" },
    { id: 2, name: "Provider B", enabled: true, apiKeyConfigured: true, baseUrl: "https://b.example/v1" },
];
const configs = [{ featureKey: "agent", primaryProviderId: 1, primaryModel: "alpha", primaryApiStyle: "CHAT_COMPLETIONS", fallbackProviderId: 2, fallbackModel: "beta", fallbackApiStyle: "RESPONSES" }];
const renderPage = (query = "") => render(<MemoryRouter initialEntries={[`/admin/model-playground${query}`]}><AdminModelPlaygroundPage /></MemoryRouter>);
const promptInput = () => screen.findByRole("textbox", { name: "admin.playground.prompt" });
const enterAndSend = async (value) => {
    fireEvent.change(await promptInput(), { target: { value } });
    fireEvent.click(screen.getByRole("button", { name: "admin.playground.send" }));
};
const success = (text = "Actual model answer") => ({ ok: true, reason: "success", latencyMs: 10, upstreamStatus: 200, output: { text } });

beforeEach(() => {
    vi.resetAllMocks();
    adminService.listProviders.mockResolvedValue(providers);
    adminService.listFeatureConfigs.mockResolvedValue(configs);
    adminService.testFeatureModel.mockResolvedValue(success());
});

describe("administrator test chat", () => {
    it("loads presets without generating anything and requires an explicit prompt", async () => {
        renderPage();
        expect(await promptInput()).toHaveValue("");
        expect(screen.getByRole("textbox", { name: "admin.playground.modelId" })).toHaveValue("alpha");
        expect(screen.getByRole("button", { name: "admin.playground.send" })).toBeDisabled();
        expect(adminService.testFeatureModel).not.toHaveBeenCalled();
        expect(adminService.testProvider).not.toHaveBeenCalled();
    });

    it("sends the chosen prompt once and carries a successful reply into a follow-up", async () => {
        let resolve;
        adminService.testFeatureModel.mockReturnValueOnce(new Promise((done) => { resolve = done; })).mockResolvedValueOnce(success("Follow-up answer"));
        renderPage();
        const prompt = await promptInput();
        fireEvent.change(prompt, { target: { value: "My administrator prompt" } });
        const button = screen.getByRole("button", { name: "admin.playground.send" });
        fireEvent.click(button);
        fireEvent.click(button);
        expect(adminService.testFeatureModel).toHaveBeenCalledTimes(1);
        expect(adminService.testFeatureModel).toHaveBeenCalledWith("agent", { providerId: 1, model: "alpha", apiStyle: "CHAT_COMPLETIONS", prompt: "My administrator prompt", messages: [] }, expect.objectContaining({ _silent: true }));
        await act(async () => resolve(success()));
        expect(screen.getByText("Actual model answer")).toBeInTheDocument();
        expect(prompt).toHaveValue("");
        await enterAndSend("And what about this?");
        await screen.findByText("Follow-up answer");
        expect(adminService.testFeatureModel.mock.calls[1][1].messages).toEqual([{ role: "user", content: "My administrator prompt" }, { role: "assistant", content: "Actual model answer" }]);
    });

    it("shows the actual provider 400 message, code, parameter and request ID and keeps the prompt for retry", async () => {
        adminService.testFeatureModel.mockResolvedValue({ ok: false, reason: "upstream_error", latencyMs: 806, upstreamStatus: 400, endpoint: "/images/generations", error: { message: "Parameter response_format is unsupported by this model", code: "unsupported_parameter", param: "response_format", requestId: "req-visible-to-admin" } });
        renderPage("?providerId=2&model=chosen-image&apiStyle=IMAGES_GENERATIONS&featureKey=blog_agent_image");
        await enterAndSend("Draw a forest at sunrise");
        expect(await screen.findByText("Parameter response_format is unsupported by this model")).toBeInTheDocument();
        expect(screen.getByText(/unsupported_parameter/)).toBeInTheDocument();
        expect(screen.getByText(/req-visible-to-admin/)).toBeInTheDocument();
        expect(await promptInput()).toHaveValue("Draw a forest at sunrise");
        expect(adminService.testFeatureModel.mock.calls[0][1]).toEqual({ providerId: 2, model: "chosen-image", apiStyle: "IMAGES_GENERATIONS", prompt: "Draw a forest at sunrise", messages: [] });
    });

    it("renders generated images from the administrator's prompt", async () => {
        adminService.testFeatureModel.mockResolvedValue({ ok: true, reason: "success", output: { images: ["https://images.example/result.png"] } });
        renderPage("?providerId=2&model=image-model&apiStyle=IMAGES_GENERATIONS&featureKey=blog_agent_image");
        await promptInput();
        expect(adminService.testFeatureModel).not.toHaveBeenCalled();
        await enterAndSend("My own image description");
        expect(await screen.findByRole("img", { name: "admin.playground.outputImage" })).toHaveAttribute("src", "https://images.example/result.png");
    });

    it("loads a provider model list only on request and supports selecting an unconfigured model", async () => {
        adminService.testProvider.mockResolvedValue({ ok: true, reason: "success", models: ["new-model"] });
        renderPage();
        await promptInput();
        fireEvent.click(screen.getByRole("button", { name: "admin.playground.loadModels" }));
        await screen.findByRole("option", { name: "new-model" });
        fireEvent.change(screen.getByRole("combobox", { name: "admin.playground.model" }), { target: { value: "new-model" } });
        await enterAndSend("Test this model");
        await screen.findByText("Actual model answer");
        expect(adminService.testProvider).toHaveBeenCalledWith({ providerId: 1 }, expect.any(Object));
        expect(adminService.testFeatureModel.mock.calls[0][1].model).toBe("new-model");
    });

    it("ignores a late reply after stopping waiting and selecting a different provider", async () => {
        let resolve;
        adminService.testFeatureModel.mockReturnValueOnce(new Promise((done) => { resolve = done; }));
        renderPage();
        await enterAndSend("First provider request");
        const signal = adminService.testFeatureModel.mock.calls[0][2].signal;
        fireEvent.click(screen.getByRole("button", { name: "admin.playground.stopWaiting" }));
        expect(signal.aborted).toBe(true);
        fireEvent.change(screen.getByRole("combobox", { name: "admin.playground.provider" }), { target: { value: "2" } });
        await act(async () => resolve(success("Stale answer must not appear")));
        expect(screen.queryByText("Stale answer must not appear")).not.toBeInTheDocument();
        expect(screen.getByRole("textbox", { name: "admin.playground.modelId" })).toHaveValue("");
    });

    it("ends initial loading after failure and allows a retry", async () => {
        adminService.listProviders.mockRejectedValueOnce(new Error("offline"));
        renderPage();
        expect(await screen.findByRole("alert")).toHaveTextContent("admin.playground.loadFailed");
        fireEvent.click(screen.getByRole("button", { name: "admin.playground.retry" }));
        expect(await promptInput()).toBeInTheDocument();
        expect(adminService.listProviders).toHaveBeenCalledTimes(2);
    });

    it("does not send with an invalid token limit and can retry after transport errors", async () => {
        adminService.testFeatureModel.mockRejectedValueOnce({ response: { data: { message: "Test history is too long" } } });
        renderPage();
        fireEvent.change(await promptInput(), { target: { value: "Test" } });
        fireEvent.change(screen.getByLabelText("admin.playground.maxTokens"), { target: { value: "0" } });
        expect(screen.getByRole("button", { name: "admin.playground.send" })).toBeDisabled();
        fireEvent.change(screen.getByLabelText("admin.playground.maxTokens"), { target: { value: "" } });
        fireEvent.click(screen.getByRole("button", { name: "admin.playground.send" }));
        expect(await screen.findByText("Test history is too long")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "admin.playground.send" })).not.toBeDisabled();
        await enterAndSend("Try again");
        await waitFor(() => expect(screen.getByText("Actual model answer")).toBeInTheDocument());
    });
});

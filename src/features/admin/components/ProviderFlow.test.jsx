import React from "react";
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ProviderFormModal from "./ProviderFormModal";
import ProviderModelInput from "./ProviderModelInput";
vi.mock("@api", () => ({ isRequestCancelled: () => false }));
const api = vi.hoisted(() => ({
    createProvider: vi.fn(),
    updateProvider: vi.fn(),
    testProvider: vi.fn(),
}));
vi.mock("../services/adminService", () => ({ adminService: api }));
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key) => key }),
}));
vi.mock("@shared/hooks/useToast", () => ({
    useToast: () => ({ success: vi.fn() }),
}));
afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

it("creates from a preset, discovers selected models and persists them with the API config", async () => {
    api.testProvider.mockResolvedValue({
        ok: true,
        reason: "success",
        models: ["alpha", "beta"],
    });
    api.createProvider.mockResolvedValue({});
    render(
        <ProviderFormModal
            isOpen
            providers={[]}
            onClose={vi.fn()}
            onSaved={vi.fn()}
        />,
    );
    fireEvent.click(screen.getByText("DeepSeek"));
    expect(screen.getByLabelText("admin.providers.baseUrl")).toHaveValue(
        "https://api.deepseek.com",
    );
    fireEvent.change(screen.getByLabelText("admin.providers.apiKey"), {
        target: { value: "test-key" },
    });
    fireEvent.click(
        screen.getByRole("button", { name: "admin.providers.fetchModels" }),
    );
    fireEvent.click(await screen.findByRole("checkbox", { name: "alpha" }));
    fireEvent.change(screen.getByLabelText("admin.providers.manualModel"), {
        target: { value: "manual-model" },
    });
    fireEvent.click(
        screen.getByRole("button", { name: "admin.providers.addModel" }),
    );
    fireEvent.click(
        screen.getByRole("button", { name: "admin.providers.create" }),
    );
    await waitFor(() =>
        expect(api.createProvider).toHaveBeenCalledWith(
            expect.objectContaining({
                name: "DeepSeek",
                models: ["alpha", "manual-model"],
                apiKey: "test-key",
            }),
        ),
    );
});

it("edits models while leaving the stored secret unchanged", async () => {
    api.updateProvider.mockResolvedValue({});
    render(
        <ProviderFormModal
            isOpen
            provider={{
                id: 3,
                name: "Existing",
                baseUrl: "https://example.com/v1",
                apiKeyConfigured: true,
                models: ["alpha"],
            }}
            providers={[]}
            onClose={vi.fn()}
        />,
    );
    expect(screen.getByLabelText("admin.providers.apiKey")).toHaveValue("");
    expect(screen.getByText("alpha")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "common.save" }));
    await waitFor(() =>
        expect(api.updateProvider).toHaveBeenCalledWith(
            3,
            expect.objectContaining({ apiKey: null, models: ["alpha"] }),
        ),
    );
});

it("lets feature configuration select saved models or keep a legacy manual model", () => {
    const change = vi.fn();
    const { rerender } = render(
        <ProviderModelInput
            provider={{ models: ["alpha", "beta"] }}
            value="alpha"
            onChange={change}
        />,
    );
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "beta" }));
    expect(change).toHaveBeenCalledWith("beta");
    rerender(
        <ProviderModelInput
            provider={{ models: ["alpha"] }}
            value="legacy"
            onChange={change}
        />,
    );
    expect(screen.getByRole("textbox")).toHaveValue("legacy");
});

import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import PlatformConnectionAction from "./PlatformConnectionAction";

const api = vi.hoisted(() => ({ testConnection: vi.fn(), getAuthorizationStatus: vi.fn() }));
const juejin = vi.hoisted(() => ({ testConnection: vi.fn(), getAuthorizationStatus: vi.fn() }));
vi.mock("../services/publishingService", () => ({ csdnService: api, juejinService: juejin }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({
    t: (key, values) => values?.username ? `${values.nickname} (${values.username})` : key,
    i18n: { resolvedLanguage: "en" },
}) }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

it("checks Juejin through its own saved-session endpoint", async () => {
    juejin.testConnection.mockResolvedValueOnce({ username: "123", nickname: "Juejin user", verifiedAt: "2026-10-12T09:00:00Z" });
    juejin.getAuthorizationStatus.mockResolvedValueOnce({ profile: null });
    render(<PlatformConnectionAction platform="juejin" />);
    await screen.findByText("Juejin user");
    expect(juejin.testConnection).toHaveBeenCalledTimes(1);
    expect(api.testConnection).not.toHaveBeenCalled();
});

it("restores saved account details and authorization time without repeating the provider request", async () => {
    api.getAuthorizationStatus.mockResolvedValueOnce({
        authorizedAt: "2026-10-12T08:00:00Z",
        profile: { username: "alice-id", nickname: "Saved Alice", avatarUrl: "https://avatar.example/alice.png", verifiedAt: "2026-10-12T09:00:00Z" },
    });
    render(<PlatformConnectionAction />);
    await screen.findByText("Saved Alice");
    expect(screen.getByText("profile.platformConnection.accountId")).toBeTruthy();
    expect(screen.getByText("profile.platformConnection.authorizedAt")).toBeTruthy();
    expect(screen.getByRole("presentation").getAttribute("src")).toBe("https://avatar.example/alice.png");
    expect(api.testConnection).not.toHaveBeenCalled();
});

it("disables the button while checking and shows the verified account", async () => {
    let complete;
    api.testConnection.mockReturnValue(new Promise((resolve) => { complete = resolve; }));
    api.getAuthorizationStatus.mockResolvedValueOnce({ profile: null });
    render(<PlatformConnectionAction />);
    await waitFor(() => expect(api.testConnection).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("button").disabled).toBe(true);
    complete({ username: "alice", nickname: "Alice", avatarUrl: null, verifiedAt: "2026-10-12T09:00:00Z" });
    await screen.findByText("Alice");
    expect(screen.getByText("profile.platformConnection.success")).toBeTruthy();
    expect(screen.getByRole("button").disabled).toBe(false);
});

it("clears previous success and distinguishes platform expiry from provider failure", async () => {
    api.testConnection.mockResolvedValueOnce({ username: "alice", verifiedAt: "2026-10-12T09:00:00Z" });
    api.getAuthorizationStatus.mockResolvedValueOnce({ profile: null });
    render(<PlatformConnectionAction />);
    await screen.findByText("alice");
    for (const [status, key] of [[409, "expired"], [502, "failed"], [429, "rateLimited"]]) {
        api.testConnection.mockRejectedValueOnce({ response: { status }, message: "raw provider details" });
        fireEvent.click(screen.getByRole("button"));
        await screen.findByText(`profile.platformConnection.${key}`);
        expect(screen.queryByText("profile.platformConnection.success")).toBeNull();
        expect(screen.queryByText("raw provider details")).toBeNull();
        await waitFor(() => expect(screen.getByRole("button").disabled).toBe(false));
    }
});

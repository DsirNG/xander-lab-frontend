import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import i18n, { i18nReady, loadLocale } from "@/locales";
import { getReplyLanguage } from "@shared/preferences/agentLanguage";
import LanguagePreferencesPanel from "./LanguagePreferencesPanel";

vi.mock("@shared/hooks/useToast", () => ({
    useToast: () => ({ error: vi.fn() }),
}));

beforeEach(async () => {
    window.localStorage.clear();
    await i18nReady;
    await i18n.changeLanguage("zh");
});

it("switches the app language without touching saved conversation data", async () => {
    window.localStorage.setItem("chat_active_id", "17");
    window.localStorage.setItem(
        "test-history",
        JSON.stringify([{ content: "历史消息" }]),
    );
    render(<LanguagePreferencesPanel />);
    const appGroup = screen.getByRole("group", { name: "界面语言" });
    fireEvent.click(within(appGroup).getByRole("button", { name: "English" }));
    await screen.findByRole("group", { name: "App language" });
    expect(i18n.language).toBe("en");
    expect(window.localStorage.getItem("chat_active_id")).toBe("17");
    expect(JSON.parse(window.localStorage.getItem("test-history"))).toEqual([
        { content: "历史消息" },
    ]);
    expect(
        screen.queryByRole("button", { name: "Français" }),
    ).not.toBeInTheDocument();
});

it("keeps the reply preference independent of the app language", async () => {
    render(<LanguagePreferencesPanel />);
    const replies = screen.getByRole("group", { name: "Agent 回复语言" });
    fireEvent.click(within(replies).getByRole("button", { name: "English" }));
    expect(getReplyLanguage()).toBe("en");
    expect(i18n.language).toBe("zh");
    expect(
        within(replies).getByRole("button", { name: "English" }),
    ).toHaveAttribute("aria-pressed", "true");
    await act(async () => {
        await loadLocale("en");
        await i18n.changeLanguage("en");
    });
    await waitFor(() => expect(getReplyLanguage()).toBe("en"));
    expect(
        screen.getByRole("group", { name: "Agent reply language" }),
    ).toBeInTheDocument();
});

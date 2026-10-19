import React from "react";
import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import WorkspaceAccountMenu from "./WorkspaceAccountMenu";

const { logoutMock, navigateMock, pointsMock, toastMock } = vi.hoisted(() => ({
    logoutMock: vi.fn(),
    navigateMock: vi.fn(),
    pointsMock: vi.fn().mockResolvedValue({ balance: 1250 }),
    toastMock: { error: vi.fn() },
}));

vi.mock("@features/auth", () => ({ logout: logoutMock }));
vi.mock("@features/account", () => ({
    formatPoints: (value) => String(value),
    getPointsOverview: pointsMock,
}));
vi.mock("@shared/hooks/useToast", () => ({ useToast: () => toastMock }));
vi.mock("react-router-dom", () => ({ useNavigate: () => navigateMock }));
vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key) =>
            ({
                "blog.agentChat.user": "用户",
                "blog.agentChat.tierFree": "免费版",
                "workspace.userMenu": "用户菜单",
                "workspace.settings": "设置中心",
                "workspace.accountMenu.subscriptionTier": "订阅等级",
                "workspace.logoutFailed": "退出登录失败",
                "nav.logout": "退出登录",
            })[key] || key,
    }),
}));

beforeEach(() => vi.clearAllMocks());

describe("WorkspaceAccountMenu", () => {
    it("shows account details and opens the settings center from its anchored menu", () => {
        const onOpenSettings = vi.fn();
        render(
            <WorkspaceAccountMenu
                userInfo={{
                    nickname: "Alice",
                    email: "alice@example.com",
                    tier: "Pro",
                }}
                onOpenSettings={onOpenSettings}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "用户菜单" }));
        const menu = within(screen.getByRole("menu"));
        expect(menu.getByText("Alice")).toBeInTheDocument();
        expect(menu.getByText("alice@example.com")).toBeInTheDocument();
        expect(menu.getByText("订阅等级")).toBeInTheDocument();
        expect(menu.getByText("Pro")).toBeInTheDocument();
        expect(menu.getByText("workspace.points")).toBeInTheDocument();

        fireEvent.click(screen.getByRole("menuitem", { name: "设置中心" }));
        expect(onOpenSettings).toHaveBeenCalledOnce();
    });

    it("logs out and returns to the public home page", async () => {
        logoutMock.mockResolvedValue(undefined);
        render(
            <WorkspaceAccountMenu
                userInfo={{ username: "alice" }}
                onOpenSettings={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "用户菜单" }));
        fireEvent.click(screen.getByRole("menuitem", { name: "退出登录" }));

        await waitFor(() => expect(logoutMock).toHaveBeenCalledOnce());
        expect(navigateMock).toHaveBeenCalledWith("/", { replace: true });
    });
});

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PlanPlatformPicker from "./PlanPlatformPicker";

const translations = {
    "blogPlans.publishPlatforms": "发布平台",
    "blogPlans.localPlatform": "本站（默认）",
    "profile.platformConnections.platforms.csdn": "CSDN",
    "profile.platformConnections.platforms.juejin": "掘金",
    "profile.platformConnections.platforms.wechat_mp": "微信公众号",
};

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key) => translations[key] || key }),
}));

describe("PlanPlatformPicker", () => {
    it("shows platform names and logos while keeping planned platforms disabled", () => {
        const onChange = vi.fn();
        const { container } = render(
            <PlanPlatformPicker value={["local"]} onChange={onChange} />,
        );

        expect(screen.getByText("CSDN")).toBeInTheDocument();
        expect(screen.getByText("掘金")).toBeInTheDocument();
        expect(
            container.querySelector('img[src="/assets/platform-logos/csdn.svg"]'),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("checkbox", { name: "微信公众号" }),
        ).toBeDisabled();

        fireEvent.click(screen.getByRole("checkbox", { name: "CSDN" }));
        expect(onChange).toHaveBeenCalledWith(["local", "csdn"]);
    });
});

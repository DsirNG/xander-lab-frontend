import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FeatureConfigModal from "./FeatureConfigModal";

vi.mock("@/hooks/useToast", () => ({
    useToast: () => ({ success: vi.fn(), error: vi.fn() }),
}));
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key) => key, i18n: { resolvedLanguage: "zh" } }),
}));
vi.mock("../services/adminService", () => ({
    adminService: { updateFeatureConfig: vi.fn() },
}));

const providers = [
    { id: 6, name: "okint-grok", baseUrl: "https://api.okinto.com/v1" },
];

const renderModal = (config) =>
    render(
        <FeatureConfigModal
            isOpen
            config={config}
            providers={providers}
            onClose={vi.fn()}
            onSaved={vi.fn()}
        />,
    );

/**
 * 弹窗里有四个下拉（主/兜底 x 供应商/接口风格）共用同一个 aria-label。
 * 按出现顺序：0=主供应商 1=主接口风格 2=兜底供应商 3=兜底接口风格。
 * 打开某一个后，读它 listbox 里的全部选项文案。
 */
const optionLabelsOf = (index) => {
    const triggers = screen.getAllByLabelText("admin.configs.selectProvider");
    fireEvent.click(triggers[index]);
    const listbox = screen.getByRole("listbox");
    return Array.from(listbox.querySelectorAll("button")).map(
        (el) => el.textContent || "",
    );
};

beforeEach(() => vi.clearAllMocks());

/**
 * agent / blog_agent / img2three_vision 的客户端现在按 apiStyle 分流：
 * 配 CHAT_COMPLETIONS 就发 /chat/completions，配 RESPONSES 就发 /responses。
 * 所以文本功能必须如实给出这两个选项——只给一个会让运维无法切换协议。
 */
describe("FeatureConfigModal 接口风格可选项", () => {
    it.each(["agent", "blog_agent", "img2three_vision"])(
        "%s 同时提供 Responses 与聊天接口两项",
        (featureKey) => {
            renderModal({
                featureKey,
                enabled: true,
                primaryProviderId: 6,
                primaryModel: "grok-4.5",
                primaryApiStyle: "RESPONSES",
            });

            const options = optionLabelsOf(1);
            expect(options).toContain("admin.configs.apiStyleResponses");
            expect(options).toContain("admin.configs.apiStyleChat");
        },
    );

    it("图片功能仍同时提供对话接口与图片接口", () => {
        renderModal({
            featureKey: "blog_agent_image",
            enabled: true,
            primaryProviderId: 6,
            primaryModel: "gpt-image-2",
            primaryApiStyle: "IMAGES_GENERATIONS",
        });

        const options = optionLabelsOf(1);
        expect(options).toContain("admin.configs.apiStyleChat");
        expect(options).toContain("admin.configs.apiStyleImages");
    });

    /**
     * 存量配置里的 CHAT_COMPLETIONS 现在是被客户端采纳的合法值，
     * 必须原样显示为已选中，绝不能悄悄把它改写成 RESPONSES——
     * 那会在用户没动过配置的情况下改变实际发出的协议。
     */
    it("存量 CHAT_COMPLETIONS 原样保留并显示为已选中", () => {
        renderModal({
            featureKey: "agent",
            enabled: true,
            primaryProviderId: 6,
            primaryModel: "grok-4.5",
            primaryApiStyle: "CHAT_COMPLETIONS",
        });

        const triggers = screen.getAllByLabelText("admin.configs.selectProvider");
        expect(triggers[1].textContent).toContain("admin.configs.apiStyleChat");
    });
});

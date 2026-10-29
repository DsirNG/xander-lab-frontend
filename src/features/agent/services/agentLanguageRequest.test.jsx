import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    postStream: vi.fn(),
    i18n: { language: "en", resolvedLanguage: "en" },
}));
vi.mock("@api", () => ({
    delete: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    postStream: mocks.postStream,
    getStream: vi.fn(),
    upload: vi.fn(),
}));
vi.mock("@/locales", () => ({ default: mocks.i18n }));

import { setReplyLanguage } from "@shared/preferences/agentLanguage";
import { agentConversationService } from "./agentConversationService";

beforeEach(() => {
    window.localStorage.clear();
    mocks.postStream.mockReset();
});

it("captures language preferences for a new request without rewriting its content", () => {
    setReplyLanguage("auto");
    const content = "Explain this 中文 identifier";
    const messages = [{ role: "user", content: "历史消息" }];
    agentConversationService.sendMessageStream(7, content, [], () => {}, {});
    const payload = mocks.postStream.mock.calls[0][1];
    expect(payload).toEqual({
        content,
        attachments: [],
        deepThinking: false,
        locale: "en",
        replyLanguage: "auto",
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    setReplyLanguage("zh");
    expect(payload.replyLanguage).toBe("auto");
    expect(messages).toEqual([{ role: "user", content: "历史消息" }]);
    agentConversationService.sendMessageStream(7, "next", [], () => {}, {});
    expect(mocks.postStream.mock.calls[1][1].replyLanguage).toBe("zh");
});

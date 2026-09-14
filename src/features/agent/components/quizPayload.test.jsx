import { describe, expect, it } from "vitest";
import { parseQuizPayload } from "./quizPayload";

const QUIZ = {
    type: "quiz",
    id: "quiz-1",
    title: "JavaScript",
    questions: [
        { id: "q1", prompt: "Which value is truthy?", options: ["false", "true"] },
    ],
};

describe("parseQuizPayload", () => {
    it("reads the payload out of a persisted kind=quiz message", () => {
        // 回归（P1）：后端 AgentConversationService 把答题卡存成 kind=quiz +
        // content=<JSON 字符串>，消息本身没有 questions。老实现见到 kind==="quiz"
        // 直接返回消息对象，卡片拿到空 questions 就 return null ——
        // 答题卡在 PC 端从来没能显示出来过（刷新后看不到，流式也一样）。
        expect(
            parseQuizPayload({
                id: 11,
                role: "assistant",
                kind: "quiz",
                content: JSON.stringify(QUIZ),
            }),
        ).toEqual(QUIZ);
    });

    it("reads a live quiz step whose payload hangs off the step", () => {
        // 流式 quiz 事件进 liveSteps 后长这样（与 artifact 步同构）。
        expect(
            parseQuizPayload({ type: "quiz", payload: QUIZ }),
        ).toEqual(QUIZ);
    });

    it("reads the event payload itself", () => {
        expect(parseQuizPayload(QUIZ)).toEqual(QUIZ);
    });

    it("reads a quiz nested under a quiz field", () => {
        expect(parseQuizPayload({ content: JSON.stringify({ quiz: QUIZ }) })).toEqual(
            QUIZ,
        );
    });

    it("returns nothing renderable for a payload without questions", () => {
        // 调用方拿它当判断条件：返回空壳会让消息既不成卡片也不成正文，直接从时间线上消失。
        expect(parseQuizPayload(null)).toBeNull();
        expect(parseQuizPayload({ kind: "quiz" })).toBeNull();
        expect(parseQuizPayload({ kind: "quiz", content: "不是 JSON" })).toBeNull();
        expect(
            parseQuizPayload({ kind: "quiz", content: JSON.stringify({ questions: [] }) }),
        ).toBeNull();
        expect(
            parseQuizPayload({ kind: "quiz", content: JSON.stringify({ hello: "world" }) }),
        ).toBeNull();
    });

    it("does not mistake an ordinary answer for a quiz card", () => {
        expect(
            parseQuizPayload({ kind: "answer", content: "这是普通回答，不是答题卡" }),
        ).toBeNull();
    });
});

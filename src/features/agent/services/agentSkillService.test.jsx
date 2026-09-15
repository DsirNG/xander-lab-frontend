import { describe, expect, it, vi } from "vitest";

vi.mock("@api", () => ({
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
}));

import { parseSkillToolNames } from "./agentSkillService.js";

describe("parseSkillToolNames", () => {
    it("解析出技能声明的工具名", () => {
        expect(parseSkillToolNames('["query_posts","publish_post"]')).toEqual([
            "query_posts",
            "publish_post",
        ]);
    });

    it("脏数据按未选处理，不抛错", () => {
        // 一条坏数据不该让整个技能列表打不开。
        expect(parseSkillToolNames("{not json")).toEqual([]);
        expect(parseSkillToolNames(null)).toEqual([]);
        expect(parseSkillToolNames(undefined)).toEqual([]);
        expect(parseSkillToolNames("")).toEqual([]);
    });

    it("JSON 合法但不是数组时同样按未选处理", () => {
        expect(parseSkillToolNames('{"a":1}')).toEqual([]);
        expect(parseSkillToolNames('"query_posts"')).toEqual([]);
    });

    it("过滤掉数组里的空值", () => {
        expect(parseSkillToolNames('["a",null,"","b"]')).toEqual(["a", "b"]);
    });
});

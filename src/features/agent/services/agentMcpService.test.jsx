import { describe, expect, it } from "vitest";
import { formatHeaderLines, parseHeaderLines } from "./agentMcpService";

/**
 * 请求头输入框是「每行一个 Name: value」的自由文本。
 *
 * 这里守住两件事：合法写法要正确解析（值里的冒号不能被当成分隔符），
 * 非法写法要能一次全指出来——只报第一行的话，用户得来回改好几轮。
 */
describe("parseHeaderLines", () => {
    it("解析 Name: value 行", () => {
        expect(parseHeaderLines("Authorization: Bearer abc").headers).toEqual({
            Authorization: "Bearer abc",
        });
    });

    it("忽略空行与注释行", () => {
        const { headers, invalid } = parseHeaderLines(
            "\n# 说明\nX-Api-Key: 1\n\n",
        );

        expect(headers).toEqual({ "X-Api-Key": "1" });
        expect(invalid).toEqual([]);
    });

    /** 值本身含冒号很常见（URL、时间戳），只有第一个冒号是分隔符。 */
    it("值里的冒号原样保留", () => {
        expect(parseHeaderLines("X-Url: https://a.example/b").headers).toEqual({
            "X-Url": "https://a.example/b",
        });
    });

    it("缺少冒号的行按行号报出", () => {
        expect(parseHeaderLines("Authorization Bearer abc").invalid).toEqual([
            1,
        ]);
    });

    it("请求头名含空格等非法字符时按行号报出", () => {
        expect(parseHeaderLines("Bad Name: v").invalid).toEqual([1]);
    });

    it("一次报出所有出错的行", () => {
        expect(parseHeaderLines("ok: 1\nbad line\nBad Name: v").invalid).toEqual([
            2, 3,
        ]);
    });

    it("空输入给空结果而不是抛错", () => {
        expect(parseHeaderLines(null)).toEqual({ headers: {}, invalid: [] });
        expect(parseHeaderLines("   ")).toEqual({ headers: {}, invalid: [] });
    });

    it("与 formatHeaderLines 互逆", () => {
        const source = { Authorization: "Bearer abc", "X-Api-Key": "1" };

        expect(parseHeaderLines(formatHeaderLines(source)).headers).toEqual(
            source,
        );
    });
});

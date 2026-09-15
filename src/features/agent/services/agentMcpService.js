/**
 * 远端 MCP 服务器配置 API 封装
 * Remote MCP server configuration API wrapper
 *
 * 与「技能」不同，这里配的是**可执行能力**：启用的服务器上探测到的工具会真的进入
 * 智能体工具面，调用会带着用户授权离开本平台。所以每台服务器都要显式探测过、
 * 显式启用，工具才可能被模型看到；每一次调用都要用户审批。
 */
import { delete as del, get, post, put } from "@api";

const userBase = "/api/agent/mcp-servers";
const adminBase = "/api/admin/mcp-servers";

const build = (base) => ({
    list: (config) => get(base, undefined, config),
    create: (payload, config) => post(base, payload, config),
    update: (id, payload, config) => put(`${base}/${id}`, payload, config),
    remove: (id, config) => del(`${base}/${id}`, undefined, config),
    /** 探测连通性并刷新工具目录；连不上不报错，结果落在 lastStatus / lastError 里。 */
    probe: (id, config) => post(`${base}/${id}/probe`, undefined, config),
});

/** 当前用户自己配的服务器。 */
export const agentMcpService = build(userBase);

/** 平台级服务器（管理员维护，全部用户可用）。 */
export const adminMcpService = build(adminBase);

/** 请求头名称允许的字符集，与后端 HEADER_NAME_PATTERN 保持一致。 */
const HEADER_NAME_PATTERN = /^[A-Za-z0-9!#$%&'*+.^_`|~-]+$/;

/**
 * 把「每行一个 Name: value」的文本解析成请求头对象。
 *
 * 返回 invalid 列表而不是抛错：表单要一次把所有写错的行都指出来，
 * 否则用户修好第一行才看见第二行也错，来回好几轮。
 */
export const parseHeaderLines = (raw) => {
    const headers = {};
    const invalid = [];
    String(raw || "")
        .split(/\r?\n/)
        .forEach((line, index) => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) return;
            const at = trimmed.indexOf(":");
            if (at <= 0) {
                invalid.push(index + 1);
                return;
            }
            const name = trimmed.slice(0, at).trim();
            if (!HEADER_NAME_PATTERN.test(name)) {
                invalid.push(index + 1);
                return;
            }
            headers[name] = trimmed.slice(at + 1).trim();
        });
    return { headers, invalid };
};

/** 把请求头对象渲染回文本。后端不回传明文，所以只在能拿到明文时用。 */
export const formatHeaderLines = (headers) =>
    Object.entries(headers || {})
        .map(([name, value]) => `${name}: ${value}`)
        .join("\n");

export default agentMcpService;

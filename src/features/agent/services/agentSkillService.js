/**
 * 用户私有技能 API 封装
 * User-private agent Skill API wrapper
 *
 * 技能是「非可执行」的做法说明：它只告诉模型这类活该怎么做，
 * 不引入新工具、新数据源，也不会绕过服务端的工具表与审批策略。
 */
import { delete as del, get, post } from "@api";

const BASE = "/api/agent/skills";

export const agentSkillService = {
    /** 当前用户的全部 ACTIVE 版本，含同名技能的历史版本（模型只看到每个 key 最新的一条）。 */
    list: (config) => get(BASE, undefined, config),
    /** 可写进技能的已注册工具，供选择器使用；不含参数 schema。 */
    listTools: (config) => get(`${BASE}/tools`, undefined, config),
    /** 新建一条版本。同一 skillKey 再次提交是「出新版本」，不会覆盖旧版本。 */
    create: (payload, config) => post(BASE, payload, config),
    /** 归档一条版本；已归档或不属于当前用户的 id 会被服务端拒绝。 */
    archive: (id, config) => del(`${BASE}/${id}`, undefined, config),
};

export default agentSkillService;

/**
 * 技能声明的工具名在库里是 JSON 字符串（`agent_skill.tool_names_json`）。
 * 解析失败按「未选任何工具」处理而不是抛错：这是展示用信息，
 * 一条脏数据不该让整个技能列表打不开。
 */
export const parseSkillToolNames = (raw) => {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
        return [];
    }
};

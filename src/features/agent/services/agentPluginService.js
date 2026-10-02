import { delete as deleteRequest, get, post, put } from "@api";

const SKILLS = "/api/agent/skills";
const MCP_SERVERS = "/api/agent/mcp-servers";

export const agentPluginService = {
    listSkills: () => get(`${SKILLS}/catalog`, undefined, { _silent: true }),
    listSkillTools: () => get(`${SKILLS}/tools`, undefined, { _silent: true }),
    createSkill: (payload) => post(SKILLS, payload),
    archiveSkill: (id) => deleteRequest(`${SKILLS}/${id}`),
    listMcpServers: () => get(MCP_SERVERS, undefined, { _silent: true }),
    createMcpServer: (payload) => post(MCP_SERVERS, payload),
    updateMcpServer: (id, payload) => put(`${MCP_SERVERS}/${id}`, payload),
    deleteMcpServer: (id) => deleteRequest(`${MCP_SERVERS}/${id}`),
    probeMcpServer: (id) => post(`${MCP_SERVERS}/${id}/probe`),
    startMcpOAuth: (id) => post(`${MCP_SERVERS}/${id}/oauth/start`),
    completeMcpOAuth: (payload) =>
        post(`${MCP_SERVERS}/oauth/complete`, payload),
};

import React from "react";
import McpServersPanel from "../components/McpServersPanel";
import { agentMcpService } from "../services/agentMcpService";

/**
 * 用户自己的远端 MCP 服务器。
 *
 * 连上一台第三方 MCP 服务器，它的工具就进入你的智能体工具面——
 * 这是唯一不需要改代码就能给智能体加能力的入口。
 */
const AgentMcpServersPage = () => (
    <McpServersPanel service={agentMcpService} variant="user" />
);

export default AgentMcpServersPage;

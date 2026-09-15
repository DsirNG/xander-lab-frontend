import React from "react";
import McpServersPanel from "@features/agent/components/McpServersPanel";
import { adminMcpService } from "@features/agent/services/agentMcpService";

/**
 * 管理台-平台级 MCP 服务器：配一次，全部用户可用。
 *
 * 与用户版共用同一个面板，差别只有接口前缀与文案；归属过滤在后端。
 */
const AdminMcpServersPage = () => (
    <McpServersPanel service={adminMcpService} variant="admin" />
);

export default AdminMcpServersPage;

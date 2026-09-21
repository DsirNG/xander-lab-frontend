import React from "react";
import { AdminMcpServersPanel } from "@features/agent";

/**
 * 管理台-平台级 MCP 服务器：配一次，全部用户可用。
 *
 * 与用户版共用同一个面板，差别只有接口前缀与文案；归属过滤在后端。
 */
const AdminMcpServersPage = () => <AdminMcpServersPanel />;

export default AdminMcpServersPage;

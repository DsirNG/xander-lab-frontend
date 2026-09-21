import McpServersPanel from "./McpServersPanel";
import { adminMcpService } from "../services/agentMcpService";

/** Admin-facing composition of the agent MCP server management capability. */
const AdminMcpServersPanel = (props) => (
    <McpServersPanel
        {...props}
        service={adminMcpService}
        variant="admin"
    />
);

export default AdminMcpServersPanel;

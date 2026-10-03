/**
 * Public capabilities exposed by the agent feature.
 *
 * Message renderers, parsing helpers, internal hooks and the composer are
 * feature-internal. Cross-feature consumers should depend only on these
 * explicitly supported capabilities.
 */
export { default as AdminMcpServersPanel } from "./components/AdminMcpServersPanel";
export { listAgentConversations } from "./capabilities";
export { default as AgentShowcase } from "./components/AgentShowcase";
export { useAgentConversation } from "./hooks/useAgentConversation";
export { agentPluginService } from "./services/agentPluginService";

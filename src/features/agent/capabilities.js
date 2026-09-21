import {
    agentConversationService,
    parseToolPayload,
} from "./services/agentConversationService";
export { parseToolPayload };

/** Workspace dashboard capability: read the user's recent conversations. */
export const listAgentConversations = (config) =>
    agentConversationService.list(config);
export const uploadAgentAttachment = (file, onProgress, config) =>
    agentConversationService.uploadAttachment(file, onProgress, config);

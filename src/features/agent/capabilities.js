import {
    agentConversationService,
    normalizeAgentConversationPage,
    parseToolPayload,
} from "./services/agentConversationService";
export { parseToolPayload };

/** Workspace dashboard capability: read the user's recent conversations. */
export const listAgentConversations = async (config) => {
    const response = await agentConversationService.list(config);
    return normalizeAgentConversationPage(response).items;
};
export const uploadAgentAttachment = (file, onProgress, config) =>
    agentConversationService.uploadAttachment(file, onProgress, config);

import { knowledgeService } from "./services/knowledgeService";

/** Workspace dashboard capability: read a small list of knowledge materials. */
export const listKnowledgeMaterials = (params, config) =>
    knowledgeService.list(params, config);

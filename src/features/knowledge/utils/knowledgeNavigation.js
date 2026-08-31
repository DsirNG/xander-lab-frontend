/** 把知识主键写进开场请求；标题只用于人类阅读，同名知识仍能精确命中。 */
export const buildKnowledgeQuizPath = (t, material) =>
    `/workspace/agent?q=${encodeURIComponent(
        t("knowledge.quizPrompt", {
            title: material.title,
            materialId: material.id,
        }),
    )}`;

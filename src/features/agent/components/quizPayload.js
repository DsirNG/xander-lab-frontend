export const parseQuizPayload = (message) => {
    if (message?.type === "quiz" || message?.kind === "quiz") return message;
    if (message?.quiz) return message.quiz;
    if (typeof message?.content !== "string") return null;
    try {
        const payload = JSON.parse(message.content);
        return payload?.type === "quiz" || payload?.quiz
            ? payload.quiz || payload
            : null;
    } catch {
        return null;
    }
};

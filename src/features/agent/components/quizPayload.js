/**
 * 答题卡负载。
 *
 * <p>和代码交付卡一样，同一份负载会从三个地方进来：流式 quiz 事件（data 就是负载对象）、
 * 实时时间线里的 liveStep（负载挂在 payload 上）、以及刷新后从服务端取回的 kind=quiz
 * 消息（负载是 content 里的 JSON 字符串）。三条路径都要能认出来，否则答题卡
 * "刚才还在、刷新就没了"——而它恰恰是用户要动手点的界面。</p>
 *
 * <p>没有 questions 的负载一律当作不是答题卡：调用方拿它当判断条件，返回空壳会让这条消息
 * 既不显示成卡片、也不显示成正文，直接从时间线上消失。</p>
 */
const asQuiz = (value) => {
    if (!value || !Array.isArray(value.questions) || value.questions.length === 0) {
        return null;
    }
    return value;
};

export const parseQuizPayload = (message) => {
    if (!message) return null;
    const direct =
        asQuiz(message.quiz) ||
        asQuiz(message.payload) ||
        asQuiz(message);
    if (direct) return direct;
    if (typeof message.content !== "string" || !message.content.trim())
        return null;
    try {
        const parsed = JSON.parse(message.content);
        return asQuiz(parsed?.quiz) || asQuiz(parsed);
    } catch {
        return null;
    }
};

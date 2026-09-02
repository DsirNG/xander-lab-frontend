/**
 * 代码交付卡负载。
 *
 * <p>同一份负载会从三个地方进来：流式 artifact 事件（data 就是负载对象）、
 * 实时时间线里的 liveStep（负载挂在 payload 上）、以及刷新后从服务端取回的
 * kind=artifact 消息（负载是 content 里的 JSON 字符串）。三条路径都要能认出来，
 * 否则代码"刚才还在、刷新就没了"。</p>
 *
 * <p>没有可渲染文件的负载一律当作不是交付卡：调用方用它当判断条件，
 * 返回空壳会让消息既不显示成卡片、也不显示成正文，直接从时间线上消失。</p>
 */
const asArtifact = (value) => {
    const files = Array.isArray(value?.files)
        ? value.files.filter(
              (file) =>
                  typeof file?.path === "string" &&
                  file.path.trim() &&
                  typeof file?.content === "string",
          )
        : [];
    if (!files.length) return null;
    return { ...value, files };
};

export const parseArtifactPayload = (message) => {
    if (!message) return null;
    const direct =
        asArtifact(message.artifact) ||
        asArtifact(message.payload) ||
        asArtifact(message);
    if (direct) return direct;
    if (typeof message.content !== "string" || !message.content.trim())
        return null;
    try {
        const parsed = JSON.parse(message.content);
        return asArtifact(parsed?.artifact) || asArtifact(parsed);
    } catch {
        return null;
    }
};

export default parseArtifactPayload;

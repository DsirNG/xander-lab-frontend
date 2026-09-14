/**
 * 图片工具结果的统一判定与清洗。
 *
 * <p>此前这套逻辑在 AgentChat / WorkspaceAgentChat / LandingAgentWindow 里各抄了一份，
 * 于是「哪些工具算图片工具」在三处各不相同：持久化消息那条路认得
 * {@link IMAGE_RESEND_TOOL}，流式步骤那条路只认 {@link IMAGE_TOOL}。
 * 结果是复用图片（image_resend）的一轮里，流式期间既不渲染图片、也不把正文里的
 * 地址去掉，用户会直接看到一长串 OSS 真实地址。判定必须只有一处。</p>
 */
import { parseToolPayload } from "../services/agentConversationService";

export const IMAGE_TOOL = "image_generate";
export const IMAGE_RESEND_TOOL = "image_resend";
export const IMAGE_TOOL_NAMES = new Set([IMAGE_TOOL, IMAGE_RESEND_TOOL]);

export const isImageTool = (tool) => Boolean(tool) && IMAGE_TOOL_NAMES.has(tool);

/** 流式半截地址至少要这么多字符才认定，避免把普通正文误当成地址前缀。 */
const MIN_PARTIAL_URL_PREFIX = 4;

/** 持久化消息里的图片工具结果；不是图片工具或没有地址时返回 null。 */
export const imageToolResult = (message) => {
    if (message?.kind !== "tool_result") return null;
    const payload = parseToolPayload(message.content);
    const tool = payload?.tool || message.toolName;
    return isImageTool(tool) && payload?.url ? payload : null;
};

/** 流式步骤里的图片工具结果，与持久化路径共用同一套工具判定。 */
export const liveImageStepResult = (step) => {
    if (step?.type !== "tool" || step.phase !== "end") return null;
    return isImageTool(step.tool) && step.result?.url ? step.result : null;
};

/** 本会话已出现过的全部图片地址，用来判断某段正文是否只是在复述图片。 */
export const imageUrlsFromMessages = (messages = []) => {
    const urls = new Set();
    messages.forEach((message) => {
        const result = imageToolResult(message);
        if (result?.url) urls.add(result.url);
    });
    return urls;
};

export const imageUrlsFromSteps = (steps = []) => {
    const urls = new Set();
    steps.forEach((step) => {
        const result = liveImageStepResult(step);
        if (result?.url) urls.add(result.url);
    });
    return urls;
};

/**
 * 判定一段正文是否只是在复述图片结果。
 *
 * <p>必须同时认「完整地址」和「写到一半的地址」。流式回答是边写边推的：
 * 模型把图片地址写进正文时，地址是一个字符一个字符出现的。只认完整地址的话，
 * 在地址补全之前这段半截地址会被当成普通文本渲染出来——用户会先看到真实的
 * OSS 地址（`![AI 生成图片](https://oss-cn-hangz…`），等地址写完才整条消失。
 * 这正是「先看到链接、随后又隐藏」的成因。</p>
 *
 * <p>判据是「正文尾部正好是某个已知图片地址的前缀」。前缀太短会误判，
 * 所以至少 {@link MIN_PARTIAL_URL_PREFIX} 个字符。允许误判的代价很小：
 * 这个判定只在「本轮确实产出了图片」时才生效，而图片回复本来就只展示图片。</p>
 */
export const containsResultUrl = (content, urls) => {
    if (!content || !urls || urls.size === 0) return false;
    for (const url of urls) {
        if (!url) continue;
        if (content.includes(url)) return true;
        const longest = Math.min(url.length, content.length);
        for (let length = longest; length >= MIN_PARTIAL_URL_PREFIX; length -= 1) {
            if (content.endsWith(url.slice(0, length))) return true;
        }
    }
    return false;
};

/** 模型写的 Markdown 图片；只取第一张，避免流式残留把整段正文都吞掉。 */
const MARKDOWN_IMAGE = /!\[.*?\]\([^)]+\)/;

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * 图片回复只保留图片本身。
 *
 * <p>模型有时写成 Markdown 图片，有时把地址当普通链接或裸地址贴在正文里
 * （"下载链接：https://..."）。前者取那张图；后者按已知的图片地址把
 * 图片语法、普通链接和裸地址一并删掉——否则用户看到的就是真实的存储地址。
 * 地址是精确匹配的已知值，不会误删正文里的其他链接。</p>
 */
export const cleanImageMarkdown = (text, urls) => {
    if (!text) return text;
    const imageMatch = text.match(MARKDOWN_IMAGE);
    if (imageMatch) return imageMatch[0];
    if (!urls || urls.size === 0) return text;

    let next = text;
    for (const url of urls) {
        if (!url) continue;
        const target = escapeRegExp(url);
        next = next
            .replace(new RegExp(`!\\[[^\\]]*\\]\\(\\s*${target}[^)]*\\)`, "g"), "")
            .replace(new RegExp(`\\[[^\\]]*\\]\\(\\s*${target}[^)]*\\)`, "g"), "")
            .replace(new RegExp(`<?${target}>?`, "g"), "");
    }
    // 只清掉被删地址留下的行尾空白，不合并空行——否则会把正文的段落结构压平。
    return next
        .split("\n")
        .map((line) => line.replace(/[ \t]+$/, ""))
        .join("\n")
        .trim();
};

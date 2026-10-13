import { delete as deleteRequest, get, post } from "@api";

const CSDN_AUTH = "/api/publishing/csdn/authorization";
const JUEJIN_AUTH = "/api/publishing/juejin/authorization";

/** Creates the same short-lived local-browser authorization flow for any registered platform. */
export const createPlatformConnectionService = (platform) => {
    const authorizationPath = `/api/publishing/${encodeURIComponent(platform)}/authorization`;
    return {
        ...(platform === "wechat_mp" ? {
            testConnection: () => post(`/api/publishing/${encodeURIComponent(platform)}/connection/test`, undefined, { _silent: true, dedupe: false }),
            refreshConnection: async () => {
                const accountProfile = await readWechatAccountProfile();
                return post(`/api/publishing/${encodeURIComponent(platform)}/connection/test`, { accountProfile }, { _silent: true, dedupe: false });
            },
        } : {}),
        startExtensionAuthorization: () => post(`${authorizationPath}/start`, undefined, { _sensitive: true, dedupe: false }),
        cancelExtensionAuthorization: (taskId) => post(`${authorizationPath}/extension/${taskId}/cancel`, undefined, { _silent: true }),
        getAuthorizationStatus: () => get(`${authorizationPath}/status`, undefined, { _silent: true, dedupe: false }),
        disconnect: () => deleteRequest(authorizationPath),
    };
};

/** Loads all connection states in one authenticated request when the settings panel opens. */
export const getPlatformConnectionStatuses = () =>
    get("/api/platform-connections", undefined, { _silent: true, dedupe: false });

export const csdnService = {
    testConnection: () => post("/api/publishing/csdn/connection/test", undefined, { _silent: true, dedupe: false }),
    startAuthorization: () => post(`${CSDN_AUTH}/start`),
    startExtensionAuthorization: () => post(`${CSDN_AUTH}/start`, undefined, { _sensitive: true, dedupe: false }),
    cancelExtensionAuthorization: (taskId) => post(`${CSDN_AUTH}/extension/${taskId}/cancel`, undefined, { _silent: true }),
    getAuthorizationStatus: () =>
        get(`${CSDN_AUTH}/status`, undefined, { _silent: true, dedupe: false }),
    cancelAuthorization: () =>
        post(`${CSDN_AUTH}/cancel`, undefined, {
            _silent: true,
            dedupe: false,
        }),
    disconnect: () => deleteRequest(CSDN_AUTH),
};

export const juejinService = {
    testConnection: () => post("/api/publishing/juejin/connection/test", undefined, { _silent: true, dedupe: false }),
    startAuthorization: () => post(`${JUEJIN_AUTH}/start`),
    startExtensionAuthorization: () => post(`${JUEJIN_AUTH}/start`, undefined, { _sensitive: true, dedupe: false }),
    cancelExtensionAuthorization: (taskId) => post(`${JUEJIN_AUTH}/extension/${taskId}/cancel`, undefined, { _silent: true }),
    getAuthorizationStatus: () =>
        get(`${JUEJIN_AUTH}/status`, undefined, {
            _silent: true,
            dedupe: false,
        }),
    cancelAuthorization: () =>
        post(`${JUEJIN_AUTH}/cancel`, undefined, {
            _silent: true,
            dedupe: false,
        }),
    disconnect: () => deleteRequest(JUEJIN_AUTH),
    syncCatalog: () => post("/api/publishing/juejin/catalog/sync"),
};

const CONNECTOR_CHANNEL = "dinqorai-platform-connector";

/** Checks whether the installed browser extension injected its page bridge. */
export const isPlatformConnectorAvailable = () =>
    requestConnector({ type: "PING" }).then((reply) => reply?.available === true).catch(() => false);

/** Reads the visible account name and avatar through the extension without exposing platform cookies to the page. */
export const readWechatAccountProfile = async () => {
    const reply = await requestConnector({ type: "READ_PROFILE" });
    const nickname = typeof reply?.profile?.nickname === "string" ? reply.profile.nickname.trim() : "";
    if (!nickname || nickname.length > 200) throw new Error("WECHAT_PROFILE_NOT_FOUND");
    const avatarUrl = typeof reply.profile.avatarUrl === "string" ? reply.profile.avatarUrl : null;
    return { nickname, avatarUrl };
};

/** Sends a one-use, short-lived authorization grant to the extension without exposing platform cookies to the page. */
export const startPlatformConnectorAuthorization = async (platform, authorization) =>
    requestConnector({
        type: "START",
        platform,
        taskId: authorization.taskId,
        transferToken: authorization.transferToken,
    });

/** Asks the extension to close its platform tab and discards the matching server-side grant. */
export const cancelPlatformConnectorAuthorization = async (taskId, service) => {
    if (!taskId) return;
    requestConnector({ type: "CANCEL", taskId }).catch(() => {});
    await service.cancelExtensionAuthorization(taskId);
};

/** Creates a Workers grant and hands it to the installed extension. */
export const beginPlatformConnectorAuthorization = async (platform, service) => {
    if (!await isPlatformConnectorAvailable()) {
        throw new Error("CONNECTOR_NOT_INSTALLED");
    }
    const task = await service.startExtensionAuthorization();
    try {
        await startPlatformConnectorAuthorization(platform, task);
        return task;
    } catch (error) {
        await cancelPlatformConnectorAuthorization(task.taskId, service).catch(() => {});
        throw error;
    }
};

function requestConnector(payload) {
    const requestId = window.crypto.randomUUID();
    return new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => {
            window.removeEventListener("message", onMessage);
            reject(new Error("Browser connector is not available"));
        }, payload.type === "START" ? 10000 : payload.type === "READ_PROFILE" ? 30000 : 2500);
        const onMessage = (event) => {
            if (event.source !== window || event.origin !== window.location.origin
                || event.data?.channel !== CONNECTOR_CHANNEL || event.data.requestId !== requestId) return;
            if (event.data.type !== "PONG" && event.data.type !== "START_RESULT" && event.data.type !== "PROFILE_RESULT") return;
            window.clearTimeout(timeout);
            window.removeEventListener("message", onMessage);
            if (event.data.type === "PONG") resolve({ available: event.data.available === true });
            else if (event.data.type === "PROFILE_RESULT" && event.data.ok) resolve({ profile: event.data.profile });
            else if (event.data.type === "PROFILE_RESULT") reject(new Error(event.data.errorCode || "WECHAT_PROFILE_NOT_FOUND"));
            else if (event.data.ok) resolve({ ok: true });
            else reject(new Error("Browser connector could not open the platform page"));
        };
        window.addEventListener("message", onMessage);
        window.postMessage({ channel: CONNECTOR_CHANNEL, ...payload, requestId }, window.location.origin);
    });
}

/** Blog publishing commands owned by the external-platform integration. */
export const syncBlogToCsdn = (postId, config) =>
    post(`/api/blog/posts/${postId}/sync/csdn`, undefined, config);
export const syncBlogToJuejin = (postId, config) =>
    post(`/api/blog/posts/${postId}/sync/juejin`, undefined, config);

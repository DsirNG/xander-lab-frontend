import { delete as deleteRequest, get, post } from "@api";

const CSDN_AUTH = "/api/publishing/csdn/authorization";
const JUEJIN_AUTH = "/api/publishing/juejin/authorization";

export const csdnService = {
    startAuthorization: () => post(`${CSDN_AUTH}/start`),
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
    startAuthorization: () => post(`${JUEJIN_AUTH}/start`),
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

/** Blog publishing commands owned by the external-platform integration. */
export const syncBlogToCsdn = (postId, config) =>
    post(`/api/blog/posts/${postId}/sync/csdn`, undefined, config);
export const syncBlogToJuejin = (postId, config) =>
    post(`/api/blog/posts/${postId}/sync/juejin`, undefined, config);

import { delete as deleteRequest, get, post } from "@api";

const oauthRequest = (requestId) =>
    `/api/mcp/oauth/authorize/requests/${encodeURIComponent(requestId)}`;

/** MCP OAuth authorization remains part of profile/security settings. */
export const mcpOAuthService = {
    getAuthorizationRequest: (requestId) =>
        get(oauthRequest(requestId), undefined, {
            _silent: true,
            dedupe: false,
        }),
    approveAuthorization: (requestId, scopes) => {
        const body = scopes?.length
            ? new URLSearchParams({ scopes: scopes.join(" ") })
            : undefined;
        return post(`${oauthRequest(requestId)}/approve`, body);
    },
    denyAuthorization: (requestId) => post(`${oauthRequest(requestId)}/deny`),
    listClients: () =>
        get("/api/mcp/oauth/clients", undefined, {
            _silent: true,
            dedupe: false,
        }),
    revokeClient: (clientId) =>
        deleteRequest(`/api/mcp/oauth/clients/${encodeURIComponent(clientId)}`),
};

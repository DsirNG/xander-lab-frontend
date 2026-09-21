import i18n from "@locales/index";
import { AUTH_EVENTS, authChannel, refreshMutex } from "../authChannel";
import {
    getRefreshRetryDelay,
    isUnrecoverableRefreshFailure,
    shouldRetryRefresh,
} from "../refreshFailurePolicy";
import { tokenStorage } from "./tokenStorage";
import { HttpError } from "../errors/normalizeHttpError";

export const AUTH_RECOVERY_NOT_HANDLED = Symbol("auth-recovery-not-handled");

const REMOTE_REFRESH_TIMEOUT_MS = 15_000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Coordinates access-token recovery for the shared transport client.
 *
 * The coordinator owns refresh state and cross-tab events. The Axios instance
 * is injected so replayed requests re-enter the same interceptor pipeline.
 */
export function createAuthRecovery({
    axios,
    instance,
    baseURL,
    refreshURL = "/api/auth/refresh",
    refreshTimeout = 15000,
    showToast,
}) {
    let isRefreshing = false;
    let refreshSubscribers = [];
    let remoteRefreshInFlight = false;
    let remoteRefreshTimer = null;
    let suppressLogoutBroadcast = false;

    const forceLoggedOut = () => {
        tokenStorage.clear();
        window.dispatchEvent(
            new CustomEvent("auth:logout", {
                detail: { reason: "session_expired" },
            }),
        );
        showToast(
            "warning",
            i18n.t("auth.sessionExpired", "登录已过期，请重新登录"),
        );
    };

    const sessionExpiredError = () =>
        new HttpError(
            i18n.t("auth.sessionExpired", "登录已过期，请重新登录"),
            401,
            null,
            null,
        );

    const refreshUnavailableError = (cause) =>
        new HttpError(
            i18n.t(
                "http.errors.refreshUnavailable",
                "暂时无法刷新会话，请稍后重试",
            ),
            503,
            null,
            cause ?? null,
        );

    const subscribeTokenRefresh = (onSuccess, onFailure) => {
        refreshSubscribers.push({ onSuccess, onFailure });
    };

    const notifyRefreshSubscribers = (newToken) => {
        refreshSubscribers.forEach(({ onSuccess }) => onSuccess(newToken));
        refreshSubscribers = [];
    };

    const rejectRefreshSubscribers = (error) => {
        refreshSubscribers.forEach(({ onFailure }) => onFailure(error));
        refreshSubscribers = [];
    };

    const queueForRefresh = (config) =>
        new Promise((resolve, reject) => {
            subscribeTokenRefresh(
                (newToken) => {
                    config.headers["Authorization"] = `Bearer ${newToken}`;
                    config._retryRefresh = true;
                    resolve(instance(config));
                },
                (refreshError) => {
                    reject(
                        refreshError instanceof HttpError
                            ? refreshError
                            : sessionExpiredError(),
                    );
                },
            );
        });

    const beginRemoteRefreshWait = () => {
        remoteRefreshInFlight = true;
        if (remoteRefreshTimer) clearTimeout(remoteRefreshTimer);
        remoteRefreshTimer = setTimeout(() => {
            remoteRefreshTimer = null;
            if (!remoteRefreshInFlight) return;
            remoteRefreshInFlight = false;
            rejectRefreshSubscribers(refreshUnavailableError());
        }, REMOTE_REFRESH_TIMEOUT_MS);
    };

    const endRemoteRefreshWait = () => {
        remoteRefreshInFlight = false;
        if (remoteRefreshTimer) {
            clearTimeout(remoteRefreshTimer);
            remoteRefreshTimer = null;
        }
    };

    authChannel.subscribe((event, payload) => {
        switch (event) {
            case AUTH_EVENTS.REFRESH_START:
                if (!isRefreshing) beginRemoteRefreshWait();
                break;
            case AUTH_EVENTS.REFRESH_SUCCESS: {
                const token = tokenStorage.getToken();
                endRemoteRefreshWait();
                if (token) notifyRefreshSubscribers(token);
                break;
            }
            case AUTH_EVENTS.REFRESH_FAILED:
                endRemoteRefreshWait();
                if (payload?.unrecoverable) {
                    forceLoggedOut();
                    rejectRefreshSubscribers(sessionExpiredError());
                } else {
                    rejectRefreshSubscribers(
                        refreshUnavailableError(payload?.cause),
                    );
                }
                break;
            case AUTH_EVENTS.LOGOUT:
                endRemoteRefreshWait();
                suppressLogoutBroadcast = true;
                try {
                    forceLoggedOut();
                } finally {
                    suppressLogoutBroadcast = false;
                }
                rejectRefreshSubscribers(sessionExpiredError());
                break;
            default:
                break;
        }
    });

    if (typeof window !== "undefined" && window.addEventListener) {
        window.addEventListener("auth:logout", (event) => {
            if (suppressLogoutBroadcast) return;
            authChannel.publish(AUTH_EVENTS.LOGOUT, {
                reason: event?.detail?.reason ?? "logout",
            });
        });
    }

    const attemptRefresh = async (refreshToken) => {
        const response = await axios.post(
            `${baseURL}${refreshURL}`,
            { refreshToken },
            { timeout: refreshTimeout },
        );
        const body = response.data;
        const tokenData = body?.data;
        if ((body?.code !== 200 && body?.code !== 0) || !tokenData?.accessToken) {
            const declared = typeof body?.code === "number" ? body.code : 401;
            throw new HttpError(
                body?.message || i18n.t("auth.sessionExpired"),
                declared,
                body?.code,
                body,
            );
        }
        return tokenData;
    };

    const refreshAccessToken = async () => {
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) {
            throw new HttpError(
                i18n.t("http.errors.noRefreshToken"),
                401,
                null,
                null,
            );
        }

        let retriesDone = 0;
        for (;;) {
            try {
                const tokenData = await attemptRefresh(refreshToken);
                const { accessToken, refreshToken: newRefreshToken } = tokenData;
                tokenStorage.setToken(accessToken, { notify: false });
                if (newRefreshToken) {
                    tokenStorage.setRefreshToken(newRefreshToken);
                }
                window.dispatchEvent(
                    new CustomEvent("auth:token-refreshed", {
                        detail: { token: accessToken },
                    }),
                );
                return accessToken;
            } catch (error) {
                if (!shouldRetryRefresh(error, retriesDone)) throw error;
                retriesDone += 1;
                await sleep(getRefreshRetryDelay(retriesDone));
            }
        }
    };

    const recoverUnauthorized = async (config, status) => {
        if (status !== 401 || !config) return AUTH_RECOVERY_NOT_HANDLED;

        const requestUrl = config.url || "";
        const isLoginEndpoint = requestUrl.endsWith("/auth/login");
        const isRefreshEndpoint = requestUrl.endsWith("/auth/refresh");
        const skipAuthRecovery = Boolean(config._skipAuthRecovery);

        if (skipAuthRecovery) return AUTH_RECOVERY_NOT_HANDLED;
        if (isRefreshEndpoint) {
            forceLoggedOut();
            throw sessionExpiredError();
        }
        if (isLoginEndpoint) return AUTH_RECOVERY_NOT_HANDLED;
        if (config._retryRefresh) {
            forceLoggedOut();
            throw sessionExpiredError();
        }

        if (isRefreshing || remoteRefreshInFlight) {
            return queueForRefresh(config);
        }

        isRefreshing = true;
        config._retryRefresh = true;

        let acquired = false;
        try {
            acquired = await refreshMutex.tryAcquire();
        } catch {
            acquired = false;
        }

        if (!acquired) {
            isRefreshing = false;
            config._retryRefresh = false;
            beginRemoteRefreshWait();
            return queueForRefresh(config);
        }

        authChannel.publish(AUTH_EVENTS.REFRESH_START);

        let newToken = null;
        let refreshError = null;
        try {
            newToken = await refreshAccessToken();
        } catch (error) {
            refreshError = error;
        } finally {
            isRefreshing = false;
            refreshMutex.release();
        }

        if (refreshError) {
            const unrecoverable = isUnrecoverableRefreshFailure(refreshError);
            authChannel.publish(AUTH_EVENTS.REFRESH_FAILED, {
                unrecoverable,
            });

            if (unrecoverable) {
                forceLoggedOut();
                const expired = sessionExpiredError();
                rejectRefreshSubscribers(expired);
                throw expired;
            }

            const unavailable = refreshUnavailableError(refreshError);
            rejectRefreshSubscribers(unavailable);
            if (!config._silent) showToast("warning", unavailable.message);
            throw unavailable;
        }

        authChannel.publish(AUTH_EVENTS.REFRESH_SUCCESS);
        notifyRefreshSubscribers(newToken);
        config.headers["Authorization"] = `Bearer ${newToken}`;
        return instance(config);
    };

    return { recoverUnauthorized };
}

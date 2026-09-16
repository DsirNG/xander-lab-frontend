/**
 * 跨 Tab 会话协调（V9 §44）。
 *
 * 为什么必须有这一层：refresh token 在服务端是**轮换 + 重放检测**的。
 * 两个 Tab 同时拿到 401 就都会去刷新；后到的那个拿的是已经被轮换掉的旧
 * token，会被服务端判定为 Reuse，进而把整个会话族撤销 —— 用户什么都没做
 * 却被强制登出。§44 的解法是让同一时刻只有一个 Tab 真的去刷新，其余 Tab
 * 等它的结果，然后从 localStorage 重新读取新 token 并重放自己的挂起请求。
 *
 * 这一层提供两个能力：
 *
 * 1. **广播**（`createAuthChannel`）—— 四种事件：
 *    `refresh-start` / `refresh-success` / `refresh-failed` / `logout`。
 *    降级链：`BroadcastChannel` → `localStorage` + `storage` 事件。
 *
 * 2. **跨 Tab 互斥**（`createRefreshMutex`）—— 广播只解决「已经知道别人在
 *    刷新」的情况；两个 Tab 在同一 tick 同时拿到 401 时，谁都还没发布
 *    `refresh-start`，广播救不了这个竞态。所以还需要一个真正的互斥量。
 *    降级链：`navigator.locks` → `localStorage` 租约。
 *
 * 两个机制都不依赖「对端一定会回应」：任何一步拿不到，调用方都可以退回
 * 「自己刷新」的旧行为，不会卡死。
 *
 * @module api/authChannel
 */

/** 广播频道名。 */
export const AUTH_CHANNEL_NAME = "dinqor-auth";

/** localStorage 降级通道使用的 key。 */
export const AUTH_CHANNEL_STORAGE_KEY = "dinqor_auth_channel";

/** 跨 Tab 刷新互斥量的名字 / 租约 key。 */
export const REFRESH_LOCK_NAME = "dinqor-auth-refresh";
export const REFRESH_LEASE_KEY = "dinqor_auth_refresh_lease";

/** localStorage 租约的默认有效期（ms）。 */
export const DEFAULT_LEASE_MS = 10_000;

/** 跨 Tab 会话事件。 */
export const AUTH_EVENTS = {
    /** 某个 Tab 开始刷新 */
    REFRESH_START: "refresh-start",
    /** 某个 Tab 刷新成功 */
    REFRESH_SUCCESS: "refresh-success",
    /** 某个 Tab 刷新失败（含分类） */
    REFRESH_FAILED: "refresh-failed",
    /** 某个 Tab 登出 / 被强制登出 */
    LOGOUT: "logout",
};

/**
 * 判断是否是「浏览器式」运行环境。
 *
 * 不能只看 `BroadcastChannel` 是否存在：Node 也提供全局 `BroadcastChannel`
 * （来自 `worker_threads`），但它会持有事件循环句柄，让任何导入本模块的
 * Node 脚本（构建期预处理、CLI、单测）无法退出。Node 里没有 `window`，
 * 所以以 `window` 作为浏览器环境的判据。
 *
 * @param {any} env
 * @returns {boolean}
 */
const isBrowserLike = (env) => typeof env?.window !== "undefined";

/**
 * 选择可用的广播传输方式。
 *
 * @param {any} env 运行环境（默认 globalThis）
 * @returns {'broadcast-channel'|'storage-event'|'none'}
 */
export function selectAuthTransport(env = globalThis) {
    if (!isBrowserLike(env)) return "none";
    if (typeof env.BroadcastChannel === "function") {
        return "broadcast-channel";
    }
    if (env.localStorage && typeof env.addEventListener === "function") {
        return "storage-event";
    }
    return "none";
}

/**
 * 选择可用的跨 Tab 互斥策略。
 *
 * @param {any} env 运行环境（默认 globalThis）
 * @returns {'web-locks'|'storage-lease'|'none'}
 */
export function selectLockStrategy(env = globalThis) {
    if (!isBrowserLike(env)) return "none";
    if (env?.navigator?.locks?.request) return "web-locks";
    if (env?.localStorage) return "storage-lease";
    return "none";
}

/**
 * 解析 localStorage 里的租约内容。
 * @param {string|null} raw
 * @returns {{owner: string, expiresAt: number}|null}
 */
function parseLease(raw) {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        if (
            typeof parsed?.owner === "string" &&
            typeof parsed?.expiresAt === "number"
        ) {
            return parsed;
        }
    } catch {
        /* 损坏的租约按「不存在」处理，避免永久占锁 */
    }
    return null;
}

/**
 * 创建跨 Tab 广播通道。
 *
 * 注意：`BroadcastChannel` 与 `storage` 事件都**不会**回调到发布者自己，
 * 这正是广播需要的语义 —— 本 Tab 不需要收到自己发出的事件。
 *
 * @param {object} [options]
 * @param {any} [options.env] 运行环境，默认 globalThis
 * @param {string} [options.channelName] 频道名
 * @returns {{
 *   transport: 'broadcast-channel'|'storage-event'|'none',
 *   publish: (event: string, payload?: any) => void,
 *   subscribe: (handler: (event: string, payload: any) => void) => () => void,
 *   close: () => void,
 * }}
 */
export function createAuthChannel(options = {}) {
    const env = options.env ?? globalThis;
    const channelName = options.channelName ?? AUTH_CHANNEL_NAME;
    const storageKey = options.storageKey ?? AUTH_CHANNEL_STORAGE_KEY;

    const handlers = new Set();
    let channel = null;
    let transport = selectAuthTransport(env);

    const emit = (event, payload) => {
        // 复制一份再遍历：订阅者在回调里退订不应影响本轮派发
        for (const handler of Array.from(handlers)) {
            try {
                handler(event, payload);
            } catch {
                /* 单个订阅者抛错不能拖垮其它订阅者 */
            }
        }
    };

    const onStorage = (storageEvent) => {
        if (storageEvent?.key !== storageKey) return;
        let parsed = null;
        try {
            parsed = JSON.parse(storageEvent.newValue ?? "");
        } catch {
            return;
        }
        if (!parsed || typeof parsed.event !== "string") return;
        emit(parsed.event, parsed.payload);
    };

    if (transport === "broadcast-channel") {
        try {
            channel = new env.BroadcastChannel(channelName);
            channel.onmessage = (message) => {
                const data = message?.data;
                if (!data || typeof data.event !== "string") return;
                emit(data.event, data.payload);
            };
        } catch {
            // 构造失败（例如被 CSP / 隐私模式禁用）→ 退回 storage 通道
            channel = null;
            transport =
                env?.localStorage &&
                typeof env?.addEventListener === "function"
                    ? "storage-event"
                    : "none";
        }
    }

    if (transport === "storage-event") {
        env.addEventListener("storage", onStorage);
    }

    // storage 通道下 setItem 写同样的值不会触发 storage 事件，
    // 所以每次发布都必须带上变化的内容（自增序号 + 时间戳）。
    let seq = 0;

    const publish = (event, payload) => {
        if (channel) {
            try {
                channel.postMessage({ event, payload });
            } catch {
                /* 通道已关闭时忽略 */
            }
            return;
        }
        if (transport !== "storage-event") return;
        try {
            seq += 1;
            env.localStorage.setItem(
                storageKey,
                JSON.stringify({ event, payload, seq, at: Date.now() }),
            );
        } catch {
            /* 隐私模式下 setItem 可能抛 QuotaExceededError */
        }
    };

    const subscribe = (handler) => {
        handlers.add(handler);
        return () => handlers.delete(handler);
    };

    const close = () => {
        handlers.clear();
        if (channel) {
            try {
                channel.close();
            } catch {
                /* 已关闭 */
            }
            channel = null;
        }
        if (transport === "storage-event") {
            env.removeEventListener?.("storage", onStorage);
        }
    };

    return { transport, publish, subscribe, close };
}

/**
 * 创建跨 Tab 刷新互斥量。
 *
 * `tryAcquire()` 返回 `true` 表示本 Tab 拿到了刷新权；返回 `false` 表示
 * 别的 Tab 正在刷新，调用方应改为等待广播结果，而不是自己发起刷新。
 *
 * @param {object} [options]
 * @param {any} [options.env] 运行环境，默认 globalThis
 * @param {() => number} [options.now] 取当前时间，便于测试
 * @param {number} [options.leaseMs] localStorage 租约有效期
 * @param {string} [options.tabId] 本 Tab 标识
 * @returns {{
 *   strategy: 'web-locks'|'storage-lease'|'none',
 *   tabId: string,
 *   tryAcquire: () => Promise<boolean>,
 *   release: () => void,
 * }}
 */
export function createRefreshMutex(options = {}) {
    const env = options.env ?? globalThis;
    const now = options.now ?? (() => Date.now());
    const leaseMs = options.leaseMs ?? DEFAULT_LEASE_MS;
    const strategy = selectLockStrategy(env);
    const tabId =
        options.tabId ??
        `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

    /** Web Locks 下持有锁期间用于释放的回调 */
    let heldRelease = null;

    const tryAcquireWebLock = async () => {
        if (heldRelease) return true; // 本 Tab 已持有，重入视为成功
        let releaseFn = null;
        const acquired = await new Promise((resolve) => {
            let settled = false;
            const settle = (value) => {
                if (settled) return;
                settled = true;
                resolve(value);
            };
            try {
                env.navigator.locks
                    .request(REFRESH_LOCK_NAME, { ifAvailable: true }, (lock) => {
                        if (!lock) {
                            settle(false);
                            return undefined;
                        }
                        settle(true);
                        // 保持锁直到 release() 被调用
                        return new Promise((release) => {
                            releaseFn = release;
                        });
                    })
                    .catch(() => settle(false));
            } catch {
                settle(false);
            }
        });
        if (acquired) heldRelease = releaseFn;
        return acquired;
    };

    const tryAcquireLease = () => {
        const timestamp = now();
        const current = parseLease(env.localStorage.getItem(REFRESH_LEASE_KEY));
        const heldByOther =
            current !== null &&
            current.expiresAt > timestamp &&
            current.owner !== tabId;
        if (heldByOther) return false;

        try {
            env.localStorage.setItem(
                REFRESH_LEASE_KEY,
                JSON.stringify({ owner: tabId, expiresAt: timestamp + leaseMs }),
            );
        } catch {
            // 写不进去（隐私模式）→ 不阻塞，退回「自己刷新」
            return true;
        }
        // 回读确认：并发写入后写者胜，只有读回自己的租约才算真正拿到
        const confirmed = parseLease(env.localStorage.getItem(REFRESH_LEASE_KEY));
        return confirmed?.owner === tabId;
    };

    const tryAcquire = async () => {
        if (strategy === "web-locks") return tryAcquireWebLock();
        if (strategy === "storage-lease") return tryAcquireLease();
        // 无任何互斥能力 → 退回旧行为（自己刷新）
        return true;
    };

    const release = () => {
        if (heldRelease) {
            const releaseFn = heldRelease;
            heldRelease = null;
            try {
                releaseFn();
            } catch {
                /* 已释放 */
            }
            return;
        }
        if (strategy !== "storage-lease") return;
        // 只删自己的租约：可能已被过期的后续 Tab 接管
        const current = parseLease(env.localStorage.getItem(REFRESH_LEASE_KEY));
        if (current?.owner !== tabId) return;
        try {
            env.localStorage.removeItem(REFRESH_LEASE_KEY);
        } catch {
            /* 忽略 */
        }
    };

    return { strategy, tabId, tryAcquire, release };
}

// ─────────────────────────────────────────────
// 全应用共享实例
// ─────────────────────────────────────────────

/**
 * 共享广播通道。放在模块级是为了让 `http.js`（刷新路径）与
 * `authService.js`（主动登出）用同一个通道，避免各建一份导致
 * 事件在两个通道之间互相听不到。
 *
 * 在没有 `BroadcastChannel` / `localStorage` 的环境（Node 单测、
 * 老浏览器）里会退化成 no-op，调用方无需分支判断。
 */
export const authChannel = createAuthChannel();

/** 共享的跨 Tab 刷新互斥量。 */
export const refreshMutex = createRefreshMutex();

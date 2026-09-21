import assert from "node:assert/strict";
import test from "node:test";
import {
    AUTH_CHANNEL_STORAGE_KEY,
    AUTH_EVENTS,
    DEFAULT_LEASE_MS,
    REFRESH_LEASE_KEY,
    createAuthChannel,
    createRefreshMutex,
    selectAuthTransport,
    selectLockStrategy,
} from "./authChannel.js";

/** 极简 localStorage 替身 */
function fakeStorage() {
    const map = new Map();
    return {
        getItem: (key) => (map.has(key) ? map.get(key) : null),
        setItem: (key, value) => {
            map.set(key, String(value));
        },
        removeItem: (key) => {
            map.delete(key);
        },
        _map: map,
    };
}

/** BroadcastChannel 替身：记录发布内容，并可模拟「别的 Tab 发来消息」 */
function fakeBroadcastChannel({ throwOnConstruct = false } = {}) {
    const instances = [];
    class FakeBroadcastChannel {
        constructor(name) {
            if (throwOnConstruct) throw new Error("BroadcastChannel disabled");
            this.name = name;
            this.onmessage = null;
            this.posted = [];
            this.closed = false;
            instances.push(this);
        }

        postMessage(data) {
            this.posted.push(data);
        }

        close() {
            this.closed = true;
        }

        /** 模拟来自其它 Tab 的消息 */
        receive(data) {
            this.onmessage?.({ data });
        }
    }
    return { FakeBroadcastChannel, instances };
}

/** 运行环境替身 */
function fakeEnv({ BroadcastChannel, localStorage, locks } = {}) {
    const listeners = new Map();
    const env = {
        BroadcastChannel,
        localStorage,
        navigator: locks ? { locks } : undefined,
        addEventListener: (type, handler) => {
            if (!listeners.has(type)) listeners.set(type, new Set());
            listeners.get(type).add(handler);
        },
        removeEventListener: (type, handler) => {
            listeners.get(type)?.delete(handler);
        },
        _emit: (type, event) => {
            for (const handler of listeners.get(type) ?? []) handler(event);
        },
        _listenerCount: (type) => listeners.get(type)?.size ?? 0,
    };
    // 浏览器环境的判据：真实浏览器里 globalThis === window
    env.window = env;
    return env;
}

/** 等微任务队列排空，用于观察异步释放的锁 */
const flushMicrotasks = () => new Promise((resolve) => setTimeout(resolve, 0));

/** Web Locks 替身：实现 ifAvailable 语义，并在回调返回的 promise 落定前持锁 */
function fakeLocks() {
    const held = new Set();
    return {
        request: async (name, options, callback) => {
            if (options?.ifAvailable && held.has(name)) {
                return callback(null);
            }
            held.add(name);
            try {
                return await callback({ name });
            } finally {
                held.delete(name);
            }
        },
        _held: held,
    };
}

// ─────────────────────────────────────────────
// 降级链选择
// ─────────────────────────────────────────────

test("广播传输优先级：BroadcastChannel > storage 事件 > 无", () => {
    assert.equal(
        selectAuthTransport(fakeEnv({ BroadcastChannel: function () {} })),
        "broadcast-channel",
    );
    assert.equal(
        selectAuthTransport(fakeEnv({ localStorage: fakeStorage() })),
        "storage-event",
    );
    assert.equal(selectAuthTransport(fakeEnv({})), "none");
    // 只有 localStorage、没有事件监听能力时不能选 storage 通道
    const noEvents = fakeEnv({ localStorage: fakeStorage() });
    delete noEvents.addEventListener;
    assert.equal(selectAuthTransport(noEvents), "none");
});

test("互斥策略优先级：navigator.locks > localStorage 租约 > 无", () => {
    assert.equal(
        selectLockStrategy(fakeEnv({ locks: { request: () => {} } })),
        "web-locks",
    );
    assert.equal(
        selectLockStrategy(fakeEnv({ localStorage: fakeStorage() })),
        "storage-lease",
    );
    assert.equal(selectLockStrategy(fakeEnv({})), "none");
});

test("Node 环境（有 BroadcastChannel 但没有 window）不得启用任何浏览器通道", () => {
    // 回归测试：Node 提供全局 BroadcastChannel（来自 worker_threads），
    // 但它持有事件循环句柄。若只按「BroadcastChannel 是否存在」判断，
    // 模块级单例就会在 Node 里建出真实通道，导致任何导入本模块的
    // Node 脚本无法退出（表现为测试进程挂死）。
    const nodeLike = {
        BroadcastChannel: function () {},
        navigator: {},
        // 故意不提供 window / localStorage / addEventListener
    };
    assert.equal(selectAuthTransport(nodeLike), "none");
    assert.equal(selectLockStrategy(nodeLike), "none");

    // 而且真的不能构造出通道：构造失败会退回 storage，也应为 none
    const channel = createAuthChannel({ env: nodeLike });
    assert.equal(channel.transport, "none");
    channel.close();
});

// ─────────────────────────────────────────────
// 广播通道
// ─────────────────────────────────────────────

test("BroadcastChannel 通道：发布走 postMessage，收到的消息派发给订阅者", () => {
    const { FakeBroadcastChannel, instances } = fakeBroadcastChannel();
    const env = fakeEnv({ BroadcastChannel: FakeBroadcastChannel });
    const channel = createAuthChannel({ env });

    assert.equal(channel.transport, "broadcast-channel");

    const received = [];
    channel.subscribe((event, payload) => received.push([event, payload]));

    channel.publish(AUTH_EVENTS.REFRESH_START, { tabId: "a" });
    assert.deepEqual(instances[0].posted, [
        { event: "refresh-start", payload: { tabId: "a" } },
    ]);

    // 模拟别的 Tab 广播 refresh-success
    instances[0].receive({
        event: "refresh-success",
        payload: { token: "t1" },
    });
    assert.deepEqual(received, [["refresh-success", { token: "t1" }]]);

    channel.close();
    assert.equal(instances[0].closed, true);
});

test("广播通道：非字符串 event 的消息被丢弃", () => {
    const { FakeBroadcastChannel, instances } = fakeBroadcastChannel();
    const channel = createAuthChannel({
        env: fakeEnv({ BroadcastChannel: FakeBroadcastChannel }),
    });
    const received = [];
    channel.subscribe((event) => received.push(event));

    instances[0].receive(null);
    instances[0].receive({ payload: {} });
    instances[0].receive({ event: 42 });
    assert.deepEqual(received, []);
});

test("BroadcastChannel 构造失败时退回 storage 通道", () => {
    const { FakeBroadcastChannel } = fakeBroadcastChannel({
        throwOnConstruct: true,
    });
    const storage = fakeStorage();
    const env = fakeEnv({
        BroadcastChannel: FakeBroadcastChannel,
        localStorage: storage,
    });
    const channel = createAuthChannel({ env });

    assert.equal(channel.transport, "storage-event");
    channel.publish(AUTH_EVENTS.LOGOUT, { reason: "session_expired" });
    assert.ok(storage.getItem(AUTH_CHANNEL_STORAGE_KEY));
});

test("storage 通道：每次发布内容都不同（否则不会触发 storage 事件）", () => {
    const storage = fakeStorage();
    const env = fakeEnv({ localStorage: storage });
    const channel = createAuthChannel({ env });

    assert.equal(channel.transport, "storage-event");
    channel.publish(AUTH_EVENTS.REFRESH_START);
    const first = storage.getItem(AUTH_CHANNEL_STORAGE_KEY);
    channel.publish(AUTH_EVENTS.REFRESH_START);
    const second = storage.getItem(AUTH_CHANNEL_STORAGE_KEY);

    // 同事件连续发布两次，值必须不同，否则浏览器不会派发 storage 事件
    assert.notEqual(first, second);
    assert.equal(JSON.parse(second).event, "refresh-start");
});

test("storage 通道：只响应本频道的 key，损坏内容被忽略", () => {
    const storage = fakeStorage();
    const env = fakeEnv({ localStorage: storage });
    const channel = createAuthChannel({ env });

    const received = [];
    channel.subscribe((event, payload) => received.push([event, payload]));

    // 其它 key 的 storage 事件
    env._emit("storage", { key: "access_token", newValue: "x" });
    // 损坏 JSON
    env._emit("storage", { key: AUTH_CHANNEL_STORAGE_KEY, newValue: "{oops" });
    // 缺 event 字段
    env._emit("storage", {
        key: AUTH_CHANNEL_STORAGE_KEY,
        newValue: JSON.stringify({ payload: {} }),
    });
    assert.deepEqual(received, []);

    env._emit("storage", {
        key: AUTH_CHANNEL_STORAGE_KEY,
        newValue: JSON.stringify({ event: "logout", payload: { a: 1 } }),
    });
    assert.deepEqual(received, [["logout", { a: 1 }]]);
});

test("通道 close 后退订监听并停止派发", () => {
    const storage = fakeStorage();
    const env = fakeEnv({ localStorage: storage });
    const channel = createAuthChannel({ env });

    const received = [];
    channel.subscribe((event) => received.push(event));
    assert.equal(env._listenerCount("storage"), 1);

    channel.close();
    assert.equal(env._listenerCount("storage"), 0);

    env._emit("storage", {
        key: AUTH_CHANNEL_STORAGE_KEY,
        newValue: JSON.stringify({ event: "logout" }),
    });
    assert.deepEqual(received, []);
});

test("订阅者在回调里退订不影响本轮其它订阅者", () => {
    const { FakeBroadcastChannel, instances } = fakeBroadcastChannel();
    const channel = createAuthChannel({
        env: fakeEnv({ BroadcastChannel: FakeBroadcastChannel }),
    });

    const seen = [];
    const unsubscribe = channel.subscribe(() => {
        seen.push("first");
        unsubscribe();
    });
    channel.subscribe(() => seen.push("second"));

    instances[0].receive({ event: "logout" });
    assert.deepEqual(seen, ["first", "second"]);
});

test("单个订阅者抛错不会中断其它订阅者", () => {
    const { FakeBroadcastChannel, instances } = fakeBroadcastChannel();
    const channel = createAuthChannel({
        env: fakeEnv({ BroadcastChannel: FakeBroadcastChannel }),
    });

    const seen = [];
    channel.subscribe(() => {
        throw new Error("boom");
    });
    channel.subscribe(() => seen.push("survived"));

    instances[0].receive({ event: "logout" });
    assert.deepEqual(seen, ["survived"]);
});

test("无任何传输能力时发布是安全的空操作", () => {
    const channel = createAuthChannel({ env: {} });
    assert.equal(channel.transport, "none");
    assert.doesNotThrow(() => channel.publish(AUTH_EVENTS.REFRESH_START));
    assert.doesNotThrow(() => channel.close());
});

// ─────────────────────────────────────────────
// 跨 Tab 互斥
// ─────────────────────────────────────────────

test("storage 租约：先到者拿到，未过期时另一个 Tab 拿不到", async () => {
    const storage = fakeStorage();
    let clock = 1_000;
    const env = fakeEnv({ localStorage: storage });

    const tabA = createRefreshMutex({ env, tabId: "A", now: () => clock });
    const tabB = createRefreshMutex({ env, tabId: "B", now: () => clock });

    assert.equal(tabA.strategy, "storage-lease");
    assert.equal(await tabA.tryAcquire(), true);
    assert.equal(await tabB.tryAcquire(), false);
});

test("storage 租约：过期后其它 Tab 可以接管", async () => {
    const storage = fakeStorage();
    let clock = 1_000;
    const env = fakeEnv({ localStorage: storage });

    const tabA = createRefreshMutex({ env, tabId: "A", now: () => clock });
    const tabB = createRefreshMutex({ env, tabId: "B", now: () => clock });

    assert.equal(await tabA.tryAcquire(), true);
    // 刚过有效期
    clock += DEFAULT_LEASE_MS + 1;
    assert.equal(await tabB.tryAcquire(), true);
    // 且此时 B 拿到的租约确实是 B 的
    assert.equal(JSON.parse(storage.getItem(REFRESH_LEASE_KEY)).owner, "B");
});

test("storage 租约：release 只删自己的租约", async () => {
    const storage = fakeStorage();
    let clock = 1_000;
    const env = fakeEnv({ localStorage: storage });

    const tabA = createRefreshMutex({ env, tabId: "A", now: () => clock });
    const tabB = createRefreshMutex({ env, tabId: "B", now: () => clock });

    await tabA.tryAcquire();
    clock += DEFAULT_LEASE_MS + 1;
    await tabB.tryAcquire();

    // A 此时释放：租约已归 B，A 不得把 B 的锁删掉
    tabA.release();
    assert.equal(JSON.parse(storage.getItem(REFRESH_LEASE_KEY)).owner, "B");

    tabB.release();
    assert.equal(storage.getItem(REFRESH_LEASE_KEY), null);
});

test("storage 租约：损坏的租约不会永久占锁", async () => {
    const storage = fakeStorage();
    storage.setItem(REFRESH_LEASE_KEY, "{not-json");
    const env = fakeEnv({ localStorage: storage });
    const mutex = createRefreshMutex({ env, tabId: "A", now: () => 1_000 });

    assert.equal(await mutex.tryAcquire(), true);
});

test("web-locks：拿到锁、重入、被占用时让出、释放后归还", async () => {
    const locks = fakeLocks();
    const env = fakeEnv({ localStorage: fakeStorage(), locks });

    const tabA = createRefreshMutex({ env, tabId: "A" });
    const tabB = createRefreshMutex({ env, tabId: "B" });

    assert.equal(tabA.strategy, "web-locks");
    assert.equal(await tabA.tryAcquire(), true);
    // 重入
    assert.equal(await tabA.tryAcquire(), true);
    // B 让出
    assert.equal(await tabB.tryAcquire(), false);

    tabA.release();
    // Web Locks 的释放是在微任务里完成的：release() 同步返回，
    // 锁真正归还发生在回调返回的 promise 落定之后。
    await flushMicrotasks();
    assert.equal(locks._held.has("dinqor-auth-refresh"), false);
    // 释放后 B 可以拿到
    assert.equal(await tabB.tryAcquire(), true);
    tabB.release();
});

test("无互斥能力时退回「自己刷新」，不阻塞调用方", async () => {
    const mutex = createRefreshMutex({ env: {}, tabId: "A" });
    assert.equal(mutex.strategy, "none");
    assert.equal(await mutex.tryAcquire(), true);
    assert.doesNotThrow(() => mutex.release());
});

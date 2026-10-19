const orderKey = (userId) => `alipay:pending:${userId}`;
const attemptKey = (userId, productId) =>
    `alipay:attempt:${userId}:${productId}`;

export function checkoutKey(userId, productId) {
    const key = attemptKey(userId, productId);
    const saved = sessionStorage.getItem(key);
    if (saved) return saved;
    const created = crypto.randomUUID();
    sessionStorage.setItem(key, created);
    return created;
}

export function saveCheckout(userId, order) {
    if (!/^A[a-f0-9]{32}$/.test(order.outTradeNo))
        throw new Error("Invalid payment order");
    sessionStorage.setItem(orderKey(userId), order.outTradeNo);
}

export function savedCheckout(userId) {
    const value = sessionStorage.getItem(orderKey(userId));
    return /^A[a-f0-9]{32}$/.test(value || "") ? value : null;
}

export function finishCheckout(userId, productId) {
    sessionStorage.removeItem(attemptKey(userId, productId));
}

/** Submit only the provider form; never execute response scripts or trust callback query parameters. */
export function submitAlipayForm(html, environment) {
    const documentFragment = new DOMParser().parseFromString(html, "text/html");
    const forms = documentFragment.querySelectorAll("form");
    if (forms.length !== 1 || forms[0].method.toLowerCase() !== "post")
        throw new Error("Invalid payment form");
    const action = new URL(forms[0].getAttribute("action"));
    const host =
        environment === "sandbox"
            ? "openapi-sandbox.dl.alipaydev.com"
            : environment === "production"
              ? "openapi.alipay.com"
              : null;
    if (
        !host ||
        action.protocol !== "https:" ||
        action.hostname !== host ||
        action.port ||
        action.pathname !== "/gateway.do" ||
        action.username ||
        action.password ||
        action.hash
    ) {
        throw new Error("Invalid payment destination");
    }
    const form = document.createElement("form");
    form.method = "POST";
    form.action = action.toString();
    form.hidden = true;
    for (const source of forms[0].querySelectorAll('input[type="hidden"]')) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = source.name;
        input.value = source.value;
        form.appendChild(input);
    }
    document.body.appendChild(form);
    try {
        HTMLFormElement.prototype.submit.call(form);
    } finally {
        form.remove();
    }
}

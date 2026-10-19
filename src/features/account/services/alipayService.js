import { get, post } from "@api";

const config = { _sensitive: true };
export const alipayService = {
    products: (options) =>
        get("/api/alipay/products", undefined, { ...config, ...options }),
    create: (productId, idempotencyKey) =>
        post(
            "/api/alipay/orders",
            { productId },
            {
                ...config,
                headers: { "Idempotency-Key": idempotencyKey },
            },
        ),
    reconcile: (outTradeNo, options) =>
        post(
            `/api/alipay/orders/${encodeURIComponent(outTradeNo)}/reconcile`,
            {},
            { ...config, ...options },
        ),
    close: (outTradeNo) =>
        post(
            `/api/alipay/orders/${encodeURIComponent(outTradeNo)}/close`,
            {},
            config,
        ),
};

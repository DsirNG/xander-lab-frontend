/** Empty slots stay local; only intentionally configured cards are submitted. */
export function pointsCardSlots(products = []) {
    return [10, 50, 100].map((points, index) => ({
        productId: "",
        name: "",
        points,
        priceCents: points * 10,
        enabled: false,
        ...products[index],
    }));
}

export function pointsCardsPayload(cards, subscriptions) {
    const products = cards
        .filter(
            (card) => card.productId.trim() || card.name.trim() || card.enabled,
        )
        .map((card) => ({
            ...card,
            productId: card.productId.trim(),
            name: card.name.trim(),
            priceCents: card.points * 10,
        }));
    if (
        products.some(
            (card) =>
                !/^[A-Za-z0-9_]{1,20}$/.test(card.productId) ||
                !card.name ||
                card.name.length > 20 ||
                !Number.isSafeInteger(card.points) ||
                card.points < 10 ||
                card.points > 10000 ||
                card.points % 10 !== 0,
        )
    ) {
        return { error: "pointsCardsInvalid" };
    }
    const ids = [
        ...subscriptions.map((p) => p.productId.trim()).filter(Boolean),
        ...products.map((p) => p.productId),
    ];
    if (new Set(ids).size !== ids.length)
        return { error: "pointsCardsDuplicate" };
    return { products };
}

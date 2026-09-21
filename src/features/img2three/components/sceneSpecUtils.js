import * as THREE from "three";

export const isRecord = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const readNumber = (value, fallback, min = -1_000, max = 1_000) => {
    const number = Number(value);
    return Number.isFinite(number) ? clamp(number, min, max) : fallback;
};

export const readLayerNumber = (value, keys, fallback, min = 0, max = 1) => {
    if (typeof value === "number") return clamp(value, min, max);
    if (isRecord(value)) {
        for (const key of keys) {
            if (typeof value[key] === "number")
                return clamp(value[key], min, max);
        }
    }
    return fallback;
};

export const asVec2 = (value, fallback = [0, 0]) => {
    if (!Array.isArray(value) || value.length < 2) return fallback.slice();
    return [
        readNumber(value[0], fallback[0]),
        readNumber(value[1], fallback[1]),
    ];
};

export const asVec3 = (value, fallback = [0, 0, 0]) => {
    if (!Array.isArray(value) || value.length < 3) return fallback.slice();
    return [
        readNumber(value[0], fallback[0]),
        readNumber(value[1], fallback[1]),
        readNumber(value[2], fallback[2]),
    ];
};

export const asPositiveVec3 = (value, fallback = [1, 1, 1]) => {
    const vector = asVec3(value, fallback);
    return vector.map((item) => clamp(Math.abs(item), 0.001, 1_000));
};

export const safeName = (value, fallback) => {
    const text = typeof value === "string" ? value.trim() : "";
    return (text || fallback).slice(0, 160);
};

export const parseColor = (value, fallback = 0x888888) => {
    if (typeof value === "number" && Number.isFinite(value))
        return new THREE.Color(value);
    if (typeof value === "string" && value.trim()) {
        try {
            return new THREE.Color(value.trim());
        } catch {
            return new THREE.Color(fallback);
        }
    }
    return new THREE.Color(fallback);
};

export const abortError = () => {
    const error = new Error("Scene construction was cancelled");
    error.name = "AbortError";
    return error;
};

export const throwIfAborted = (signal) => {
    if (signal?.aborted) throw abortError();
};

export const wouldCreateCycle = (id, parentId, parentById) => {
    let cursor = parentId;
    const visited = new Set([id]);
    while (cursor) {
        if (visited.has(cursor)) return true;
        visited.add(cursor);
        cursor = parentById.get(cursor);
    }
    return false;
};

export const addFallbackMesh = (root) => {
    const fallback = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.2,
            roughness: 0.6,
        }),
    );
    fallback.name = "fallback-model";
    fallback.castShadow = true;
    fallback.receiveShadow = true;
    root.add(fallback);
};

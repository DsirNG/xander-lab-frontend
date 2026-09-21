import * as THREE from "three";
import {
    abortError,
    clamp,
    isRecord,
    parseColor,
    readLayerNumber,
    readNumber,
    safeName,
    throwIfAborted,
} from "./sceneSpecUtils";

export const RELIEF_SCHEMA_VERSION = "xander-image-relief/1";

export const RELIEF_LIMITS = Object.freeze({
    reliefResolution: 176,
    reliefCells: 31_000,
    textureEdge: 1024,
    // A 10 MiB upload expands to roughly 13.34 MiB when Base64 encoded.
    embeddedImageCharacters: 16 * 1024 * 1024,
});

const validateReliefImageSource = (value) => {
    if (typeof value !== "string" || !value.startsWith("data:image/")) {
        throw new Error("Image relief requires an embedded image data URL");
    }
    if (value.length > RELIEF_LIMITS.embeddedImageCharacters) {
        throw new Error("Embedded image exceeds the safe preview budget");
    }
    if (!/^data:image\/(png|webp|jpeg);base64,/i.test(value)) {
        throw new Error("Unsupported embedded image format");
    }
    return value;
};

const loadImage = (source, signal) =>
    new Promise((resolve, reject) => {
        throwIfAborted(signal);
        const image = new Image();
        image.decoding = "async";
        let settled = false;
        const finish = (callback, value) => {
            if (settled) return;
            settled = true;
            signal?.removeEventListener("abort", handleAbort);
            image.onload = null;
            image.onerror = null;
            callback(value);
        };
        const handleAbort = () => {
            image.src = "";
            finish(reject, abortError());
        };
        image.onload = () => finish(resolve, image);
        image.onerror = () =>
            finish(
                reject,
                new Error("Unable to decode the embedded relief image"),
            );
        signal?.addEventListener("abort", handleAbort, { once: true });
        image.src = source;
    });

const createCanvas = (width, height) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
};

const smoothStep = (low, high, value) => {
    if (value <= low) return 0;
    if (value >= high) return 1;
    const progress = (value - low) / Math.max(0.000001, high - low);
    return progress * progress * (3 - 2 * progress);
};

const buildReliefGeometry = (pixels, gridWidth, gridHeight, settings) => {
    const cellCount = gridWidth * gridHeight;
    const alpha = new Float32Array(cellCount);
    const luminance = new Float32Array(cellCount);
    const surfaceRelief = new Float32Array(cellCount);
    const active = new Uint8Array(cellCount);
    let activeCells = 0;
    for (let index = 0; index < cellCount; index += 1) {
        const coverage = pixels[index * 4 + 3] / 255;
        alpha[index] = coverage;
        luminance[index] =
            (pixels[index * 4] * 0.2126 +
                pixels[index * 4 + 1] * 0.7152 +
                pixels[index * 4 + 2] * 0.0722) /
            255;
        if (coverage >= settings.alphaThreshold) {
            active[index] = 1;
            activeCells += 1;
        }
    }
    if (activeCells === 0)
        throw new Error(
            "The relief image does not contain an opaque foreground",
        );

    // Preserve a subtle amount of image-derived form instead of producing a flat
    // silhouette extrusion. Broad luminance contributes gently; local contrast has
    // more influence so bevels, seams and highlights remain visible after relighting.
    // The normalized result is clamped to [0, 1], keeping displacement inside heightScale.
    for (let row = 0; row < gridHeight; row += 1) {
        for (let column = 0; column < gridWidth; column += 1) {
            const index = row * gridWidth + column;
            if (!active[index]) continue;
            let weightedTotal = 0;
            let weight = 0;
            for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
                for (
                    let columnOffset = -1;
                    columnOffset <= 1;
                    columnOffset += 1
                ) {
                    const neighborRow = row + rowOffset;
                    const neighborColumn = column + columnOffset;
                    if (
                        neighborRow < 0 ||
                        neighborRow >= gridHeight ||
                        neighborColumn < 0 ||
                        neighborColumn >= gridWidth
                    )
                        continue;
                    const neighborIndex =
                        neighborRow * gridWidth + neighborColumn;
                    if (!active[neighborIndex]) continue;
                    const neighborWeight = alpha[neighborIndex];
                    weightedTotal += luminance[neighborIndex] * neighborWeight;
                    weight += neighborWeight;
                }
            }
            const localMean =
                weight > 0 ? weightedTotal / weight : luminance[index];
            const localContrast = clamp(
                luminance[index] - localMean,
                -0.45,
                0.45,
            );
            surfaceRelief[index] = clamp(
                0.55 + (luminance[index] - 0.5) * 0.18 + localContrast * 0.55,
                0.08,
                0.95,
            );
        }
    }

    const vertexColumns = gridWidth + 1;
    const surfaceVertices = vertexColumns * (gridHeight + 1);
    const positions = new Float32Array(surfaceVertices * 2 * 3);
    const uvs = new Float32Array(surfaceVertices * 2 * 2);
    const halfDepth = settings.depth / 2;

    const vertexCoverage = (row, column) => {
        let total = 0;
        let samples = 0;
        for (let rowOffset = -1; rowOffset <= 0; rowOffset += 1) {
            for (let columnOffset = -1; columnOffset <= 0; columnOffset += 1) {
                const cellRow = row + rowOffset;
                const cellColumn = column + columnOffset;
                if (
                    cellRow < 0 ||
                    cellRow >= gridHeight ||
                    cellColumn < 0 ||
                    cellColumn >= gridWidth
                )
                    continue;
                total += alpha[cellRow * gridWidth + cellColumn];
                samples += 1;
            }
        }
        return samples ? total / samples : 0;
    };

    const vertexRelief = (row, column) => {
        let total = 0;
        let weight = 0;
        for (let rowOffset = -1; rowOffset <= 0; rowOffset += 1) {
            for (let columnOffset = -1; columnOffset <= 0; columnOffset += 1) {
                const cellRow = row + rowOffset;
                const cellColumn = column + columnOffset;
                if (
                    cellRow < 0 ||
                    cellRow >= gridHeight ||
                    cellColumn < 0 ||
                    cellColumn >= gridWidth
                )
                    continue;
                const cellIndex = cellRow * gridWidth + cellColumn;
                if (!active[cellIndex]) continue;
                total += surfaceRelief[cellIndex] * alpha[cellIndex];
                weight += alpha[cellIndex];
            }
        }
        return weight > 0 ? total / weight : 0;
    };

    for (let row = 0; row <= gridHeight; row += 1) {
        for (let column = 0; column <= gridWidth; column += 1) {
            const frontIndex = row * vertexColumns + column;
            const backIndex = surfaceVertices + frontIndex;
            const x = (column / gridWidth - 0.5) * settings.width;
            const y = (0.5 - row / gridHeight) * settings.height;
            const coverage = smoothStep(
                settings.alphaThreshold,
                Math.min(1, settings.alphaThreshold + settings.edgeSoftness),
                vertexCoverage(row, column),
            );
            const frontZ =
                halfDepth +
                coverage * vertexRelief(row, column) * settings.heightScale;
            positions.set([x, y, frontZ], frontIndex * 3);
            positions.set([x, y, -halfDepth], backIndex * 3);
            const u = column / gridWidth;
            const v = 1 - row / gridHeight;
            uvs.set([u, v], frontIndex * 2);
            uvs.set([u, v], backIndex * 2);
        }
    }

    const frontIndices = [];
    const backIndices = [];
    const sideIndices = [];
    const isActive = (row, column) =>
        row >= 0 &&
        row < gridHeight &&
        column >= 0 &&
        column < gridWidth &&
        active[row * gridWidth + column] === 1;
    const addSide = (frontA, frontB) => {
        const backA = surfaceVertices + frontA;
        const backB = surfaceVertices + frontB;
        sideIndices.push(frontA, backA, frontB, frontB, backA, backB);
    };

    for (let row = 0; row < gridHeight; row += 1) {
        for (let column = 0; column < gridWidth; column += 1) {
            if (!isActive(row, column)) continue;
            const topLeft = row * vertexColumns + column;
            const topRight = topLeft + 1;
            const bottomLeft = topLeft + vertexColumns;
            const bottomRight = bottomLeft + 1;
            frontIndices.push(
                topLeft,
                bottomLeft,
                topRight,
                topRight,
                bottomLeft,
                bottomRight,
            );
            const backTopLeft = surfaceVertices + topLeft;
            const backTopRight = surfaceVertices + topRight;
            const backBottomLeft = surfaceVertices + bottomLeft;
            const backBottomRight = surfaceVertices + bottomRight;
            backIndices.push(
                backTopLeft,
                backTopRight,
                backBottomLeft,
                backTopRight,
                backBottomRight,
                backBottomLeft,
            );
            if (!isActive(row - 1, column)) addSide(topLeft, topRight);
            if (!isActive(row, column + 1)) addSide(topRight, bottomRight);
            if (!isActive(row + 1, column)) addSide(bottomRight, bottomLeft);
            if (!isActive(row, column - 1)) addSide(bottomLeft, topLeft);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
    geometry.setIndex([...frontIndices, ...backIndices, ...sideIndices]);
    geometry.addGroup(0, frontIndices.length, 0);
    geometry.addGroup(
        frontIndices.length,
        backIndices.length + sideIndices.length,
        1,
    );
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return geometry;
};

export const buildImageReliefGroup = async (sceneSpec, signal) => {
    throwIfAborted(signal);
    if (typeof document === "undefined" || typeof Image === "undefined") {
        throw new Error(
            "Image relief construction requires a browser environment",
        );
    }
    const source = validateReliefImageSource(sceneSpec.image?.dataUrl);
    const image = await loadImage(source, signal);
    throwIfAborted(signal);

    const relief = isRecord(sceneSpec.relief) ? sceneSpec.relief : {};
    const sourceAspect = image.naturalWidth / Math.max(1, image.naturalHeight);
    const requestedResolution = Math.round(
        readNumber(relief.resolution, 128, 16, RELIEF_LIMITS.reliefResolution),
    );
    let gridWidth =
        sourceAspect >= 1
            ? requestedResolution
            : Math.max(8, Math.round(requestedResolution * sourceAspect));
    let gridHeight =
        sourceAspect >= 1
            ? Math.max(8, Math.round(requestedResolution / sourceAspect))
            : requestedResolution;
    if (gridWidth * gridHeight > RELIEF_LIMITS.reliefCells) {
        const reduction = Math.sqrt(
            RELIEF_LIMITS.reliefCells / (gridWidth * gridHeight),
        );
        gridWidth = Math.max(8, Math.floor(gridWidth * reduction));
        gridHeight = Math.max(8, Math.floor(gridHeight * reduction));
    }

    const sampleCanvas = createCanvas(gridWidth, gridHeight);
    const sampleContext = sampleCanvas.getContext("2d", {
        willReadFrequently: true,
    });
    if (!sampleContext) throw new Error("Canvas pixel access is unavailable");
    sampleContext.clearRect(0, 0, gridWidth, gridHeight);
    sampleContext.imageSmoothingEnabled = true;
    sampleContext.imageSmoothingQuality = "high";
    sampleContext.drawImage(image, 0, 0, gridWidth, gridHeight);
    const pixels = sampleContext.getImageData(0, 0, gridWidth, gridHeight).data;
    throwIfAborted(signal);

    const modelWidth = readNumber(
        relief.width,
        sourceAspect >= 1 ? 2.4 : 2.4 * sourceAspect,
        0.05,
        100,
    );
    const modelHeight = readNumber(
        relief.height,
        sourceAspect >= 1 ? 2.4 / sourceAspect : 2.4,
        0.05,
        100,
    );
    const depth = readNumber(
        relief.depth,
        Math.min(modelWidth, modelHeight) * 0.1,
        0.005,
        10,
    );
    const geometry = buildReliefGeometry(pixels, gridWidth, gridHeight, {
        width: modelWidth,
        height: modelHeight,
        depth,
        heightScale: readNumber(
            relief.heightScale,
            depth * 0.2,
            0,
            Math.max(depth * 4, 0.01),
        ),
        alphaThreshold: readNumber(relief.alphaThreshold, 0.06, 0.001, 0.95),
        edgeSoftness: readNumber(relief.edgeSoftness, 0.04, 0.001, 0.5),
    });

    const textureScale = Math.min(
        1,
        RELIEF_LIMITS.textureEdge /
            Math.max(image.naturalWidth, image.naturalHeight),
    );
    const textureWidth = Math.max(
        2,
        Math.round(image.naturalWidth * textureScale),
    );
    const textureHeight = Math.max(
        2,
        Math.round(image.naturalHeight * textureScale),
    );
    const textureCanvas = createCanvas(textureWidth, textureHeight);
    const textureContext = textureCanvas.getContext("2d");
    if (!textureContext) {
        geometry.dispose();
        throw new Error("Canvas texture creation is unavailable");
    }
    textureContext.clearRect(0, 0, textureWidth, textureHeight);
    textureContext.imageSmoothingEnabled = true;
    textureContext.imageSmoothingQuality = "high";
    textureContext.drawImage(image, 0, 0, textureWidth, textureHeight);
    if (signal?.aborted) {
        geometry.dispose();
        throw abortError();
    }

    const texture = new THREE.CanvasTexture(textureCanvas);
    texture.name = "image-relief-texture";
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    const materialSpec = isRecord(sceneSpec.material) ? sceneSpec.material : {};
    const frontMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        map: texture,
        metalness: readLayerNumber(materialSpec.metalness, ["base"], 0.18),
        roughness: readLayerNumber(materialSpec.roughness, ["base"], 0.48),
        alphaTest: readNumber(relief.alphaThreshold, 0.06, 0.001, 0.95),
        side: THREE.FrontSide,
    });
    frontMaterial.name = "textured-front";
    const sideMaterial = new THREE.MeshPhysicalMaterial({
        color: parseColor(
            materialSpec.sideColor ?? materialSpec.baseColor,
            0x44484d,
        ),
        metalness: readLayerNumber(materialSpec.metalness, ["base"], 0.18),
        roughness: clamp(
            readLayerNumber(materialSpec.roughness, ["base"], 0.48) + 0.16,
            0,
            1,
        ),
        side: THREE.DoubleSide,
    });
    sideMaterial.name = "relief-back-and-walls";

    const mesh = new THREE.Mesh(geometry, [frontMaterial, sideMaterial]);
    mesh.name = safeName(
        sceneSpec.title || sceneSpec.targetName,
        "image-relief",
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.reliefResolution = [gridWidth, gridHeight];
    const root = new THREE.Group();
    root.name = mesh.name;
    root.userData.sceneSpecKind = "image-relief";
    root.userData.schemaVersion = RELIEF_SCHEMA_VERSION;
    root.add(mesh);
    return root;
};

import * as THREE from "three";
import {
    addFallbackMesh,
    asPositiveVec3,
    asVec3,
    isRecord,
    parseColor,
    readNumber,
    safeName,
    wouldCreateCycle,
} from "./sceneSpecUtils";

const LEGACY_TYPES = new Set([
    "box",
    "sphere",
    "cylinder",
    "cone",
    "torus",
    "plane",
    "group",
]);

const createLegacyGeometry = (node) => {
    const type = String(node.type || "box").toLowerCase();
    const size = asPositiveVec3(node.size, [1, 1, 1]);
    const radius = readNumber(node.radius, 0.4, 0.01, 100);
    const height = readNumber(node.height, 1, 0.01, 100);
    const tube = readNumber(node.tube, 0.12, 0.005, 100);

    switch (type) {
        case "sphere":
            return new THREE.SphereGeometry(radius, 32, 24);
        case "cylinder":
            return new THREE.CylinderGeometry(radius, radius, height, 24);
        case "cone":
            return new THREE.ConeGeometry(radius, height, 24);
        case "torus":
            return new THREE.TorusGeometry(
                radius,
                Math.min(tube, radius * 0.95),
                16,
                48,
            );
        case "plane":
            return new THREE.PlaneGeometry(size[0], size[1]);
        case "box":
        default:
            return new THREE.BoxGeometry(size[0], size[1], size[2]);
    }
};

const createLegacyMaterial = (node) =>
    new THREE.MeshStandardMaterial({
        color: parseColor(node.color),
        metalness: readNumber(node.metalness, 0.25, 0, 1),
        roughness: readNumber(node.roughness, 0.55, 0, 1),
    });

export const buildLegacyGroup = (sceneSpec, legacyNodeLimit = 80) => {
    const root = new THREE.Group();
    root.name = safeName(sceneSpec?.title, "scene-root");
    root.userData.sceneSpecKind = "legacy-nodes";

    const rawNodes = Array.isArray(sceneSpec?.nodes)
        ? sceneSpec.nodes.slice(0, legacyNodeLimit)
        : [];
    const objects = new Map();
    const parentById = new Map();

    rawNodes.forEach((raw, index) => {
        if (!isRecord(raw)) return;
        const type = String(raw.type || "box").toLowerCase();
        if (!LEGACY_TYPES.has(type)) return;

        const id = safeName(raw.id, `node-${index}`);
        if (objects.has(id)) return;
        const object3d =
            type === "group"
                ? new THREE.Group()
                : new THREE.Mesh(
                      createLegacyGeometry(raw),
                      createLegacyMaterial(raw),
                  );
        object3d.name = id;
        if (object3d.isMesh) {
            object3d.castShadow = true;
            object3d.receiveShadow = true;
        }
        const position = asVec3(raw.position);
        const rotation = asVec3(raw.rotation);
        const scale = asPositiveVec3(raw.scale, [1, 1, 1]);
        object3d.position.set(...position);
        object3d.rotation.set(...rotation);
        object3d.scale.set(...scale);
        objects.set(id, object3d);

        const parentId =
            raw.parent == null || raw.parent === ""
                ? null
                : safeName(raw.parent, "");
        parentById.set(id, parentId);
    });

    objects.forEach((object3d, id) => {
        const parentId = parentById.get(id);
        if (
            parentId &&
            objects.has(parentId) &&
            !wouldCreateCycle(id, parentId, parentById)
        ) {
            objects.get(parentId).add(object3d);
        } else {
            root.add(object3d);
        }
    });

    if (objects.size === 0) addFallbackMesh(root);
    return root;
};

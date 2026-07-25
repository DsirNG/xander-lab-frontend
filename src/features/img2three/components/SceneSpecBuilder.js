import * as THREE from 'three';

const ALLOWED_TYPES = new Set(['box', 'sphere', 'cylinder', 'cone', 'torus', 'plane', 'group']);

const asVec3 = (value, fallback = [0, 0, 0]) => {
  if (!Array.isArray(value) || value.length < 3) return fallback;
  return [
    Number(value[0]) || 0,
    Number(value[1]) || 0,
    Number(value[2]) || 0,
  ];
};

const parseColor = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    try {
      return new THREE.Color(value.trim()).getHex();
    } catch {
      return 0x888888;
    }
  }
  return 0x888888;
};

const createGeometry = (node) => {
  const type = String(node.type || 'box').toLowerCase();
  const size = asVec3(node.size, [1, 1, 1]);
  const radius = Number(node.radius);
  const height = Number(node.height);
  const tube = Number(node.tube);

  switch (type) {
    case 'sphere':
      return new THREE.SphereGeometry(Number.isFinite(radius) && radius > 0 ? radius : 0.5, 32, 24);
    case 'cylinder':
      return new THREE.CylinderGeometry(
        Number.isFinite(radius) && radius > 0 ? radius : 0.4,
        Number.isFinite(radius) && radius > 0 ? radius : 0.4,
        Number.isFinite(height) && height > 0 ? height : 1,
        24
      );
    case 'cone':
      return new THREE.ConeGeometry(
        Number.isFinite(radius) && radius > 0 ? radius : 0.4,
        Number.isFinite(height) && height > 0 ? height : 1,
        24
      );
    case 'torus':
      return new THREE.TorusGeometry(
        Number.isFinite(radius) && radius > 0 ? radius : 0.45,
        Number.isFinite(tube) && tube > 0 ? tube : 0.12,
        16,
        48
      );
    case 'plane':
      return new THREE.PlaneGeometry(Math.max(0.05, size[0]), Math.max(0.05, size[1]));
    case 'box':
    default:
      return new THREE.BoxGeometry(
        Math.max(0.05, size[0]),
        Math.max(0.05, size[1]),
        Math.max(0.05, size[2])
      );
  }
};

const createMaterial = (node) => {
  const metalness = Number(node.metalness);
  const roughness = Number(node.roughness);
  return new THREE.MeshStandardMaterial({
    color: parseColor(node.color),
    metalness: Number.isFinite(metalness) ? Math.min(1, Math.max(0, metalness)) : 0.25,
    roughness: Number.isFinite(roughness) ? Math.min(1, Math.max(0, roughness)) : 0.55,
  });
};

/**
 * Builds a THREE.Group from a constrained sceneSpec JSON (whitelist geometries only).
 * Never evaluates factory TypeScript.
 */
export function buildGroupFromSceneSpec(sceneSpec) {
  const root = new THREE.Group();
  root.name = sceneSpec?.title || 'scene-root';

  const nodes = Array.isArray(sceneSpec?.nodes) ? sceneSpec.nodes.slice(0, 40) : [];
  const byId = new Map();
  const objects = new Map();

  nodes.forEach((raw, index) => {
    if (!raw || typeof raw !== 'object') return;
    const type = String(raw.type || 'box').toLowerCase();
    if (!ALLOWED_TYPES.has(type)) return;

    const id = String(raw.id || `node-${index}`);
    byId.set(id, { ...raw, id, type });

    let object3d;
    if (type === 'group') {
      object3d = new THREE.Group();
    } else {
      const geometry = createGeometry(raw);
      const material = createMaterial(raw);
      object3d = new THREE.Mesh(geometry, material);
      object3d.castShadow = true;
      object3d.receiveShadow = true;
    }
    object3d.name = id;
    const position = asVec3(raw.position);
    const rotation = asVec3(raw.rotation);
    const scale = asVec3(raw.scale, [1, 1, 1]);
    object3d.position.set(position[0], position[1], position[2]);
    object3d.rotation.set(rotation[0], rotation[1], rotation[2]);
    object3d.scale.set(
      Math.max(0.01, scale[0]),
      Math.max(0.01, scale[1]),
      Math.max(0.01, scale[2])
    );
    objects.set(id, object3d);
  });

  objects.forEach((object3d, id) => {
    const meta = byId.get(id);
    const parentId = meta?.parent == null || meta.parent === '' ? null : String(meta.parent);
    if (parentId && objects.has(parentId) && parentId !== id) {
      objects.get(parentId).add(object3d);
    } else {
      root.add(object3d);
    }
  });

  if (root.children.length === 0) {
    const fallback = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.2, roughness: 0.6 })
    );
    fallback.castShadow = true;
    fallback.receiveShadow = true;
    root.add(fallback);
  }

  return root;
}

export function readCameraFromSceneSpec(sceneSpec) {
  const camera = sceneSpec?.camera || {};
  return {
    position: asVec3(camera.position, [1.8, 1.2, 2.4]),
    target: asVec3(camera.target, [0, 0, 0]),
    fov: Number(camera.fov) > 0 ? Number(camera.fov) : 36,
  };
}

import * as THREE from 'three';

const RELIEF_SCHEMA_VERSION = 'xander-image-relief/1';
const LEGACY_TYPES = new Set(['box', 'sphere', 'cylinder', 'cone', 'torus', 'plane', 'group']);
const SCULPT_TYPES = new Set([
  'box',
  'sphere',
  'ellipsoid',
  'cylinder',
  'cone',
  'capsule',
  'torus',
  'plane-card',
  'extrude',
  'ground-blade',
  'lathe',
  'tube',
  'curve-sweep',
  'instanced-cluster',
]);

const LIMITS = Object.freeze({
  legacyNodes: 80,
  components: 160,
  materials: 64,
  sockets: 320,
  repetitionSystems: 32,
  instancesPerSystem: 128,
  totalInstances: 512,
  profilePoints: 256,
  pathPoints: 128,
  reliefResolution: 176,
  reliefCells: 31_000,
  textureEdge: 1024,
  // A 10 MiB upload expands to roughly 13.34 MiB when Base64 encoded.
  embeddedImageCharacters: 16 * 1024 * 1024,
});

const DEFAULT_EXTRUDE_PROFILE = {
  points: [[-0.3, -0.3], [0.3, -0.3], [0.3, 0.3], [-0.3, 0.3]],
  depth: 0.1,
};
const DEFAULT_BLADE_SPEC = {
  stations: [
    [0, 0.08, -0.09],
    [0.12, 0.086, -0.1],
    [0.3, 0.086, -0.11],
    [0.5, 0.084, -0.108],
    [0.63, 0.078, -0.095],
    [0.74, 0.055, -0.055],
    [0.82, 0.028, -0.02],
    [0.88, 0, 0],
  ],
  thickness: 0.05,
  grindFrac: 0.55,
  swedgeFromTipFrac: 0.34,
};
const DEFAULT_LATHE_PROFILE = {
  points: [[0.3, -0.5], [0.15, 0], [0.3, 0.5]],
  segments: 24,
};
const DEFAULT_TUBE_PATH = {
  points: [[0, -0.5, 0], [0, 0.5, 0]],
  radius: 0.05,
  closed: false,
};
const DEFAULT_CURVE_SWEEP = {
  spine: [[-0.5, -0.4, 0], [-0.1, 0.1, 0], [0.3, 0.2, 0], [0.6, -0.1, 0]],
  crossSection: {
    points: [[-0.04, -0.02], [0.04, -0.02], [0.04, 0.02], [-0.04, 0.02]],
  },
  closed: false,
};

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const readNumber = (value, fallback, min = -1_000, max = 1_000) => {
  const number = Number(value);
  return Number.isFinite(number) ? clamp(number, min, max) : fallback;
};

const readLayerNumber = (value, keys, fallback, min = 0, max = 1) => {
  if (typeof value === 'number') return clamp(value, min, max);
  if (isRecord(value)) {
    for (const key of keys) {
      if (typeof value[key] === 'number') return clamp(value[key], min, max);
    }
  }
  return fallback;
};

const asVec2 = (value, fallback = [0, 0]) => {
  if (!Array.isArray(value) || value.length < 2) return fallback.slice();
  return [
    readNumber(value[0], fallback[0]),
    readNumber(value[1], fallback[1]),
  ];
};

const asVec3 = (value, fallback = [0, 0, 0]) => {
  if (!Array.isArray(value) || value.length < 3) return fallback.slice();
  return [
    readNumber(value[0], fallback[0]),
    readNumber(value[1], fallback[1]),
    readNumber(value[2], fallback[2]),
  ];
};

const asPositiveVec3 = (value, fallback = [1, 1, 1]) => {
  const vector = asVec3(value, fallback);
  return vector.map((item) => clamp(Math.abs(item), 0.001, 1_000));
};

const safeName = (value, fallback) => {
  const text = typeof value === 'string' ? value.trim() : '';
  return (text || fallback).slice(0, 160);
};

const parseColor = (value, fallback = 0x888888) => {
  if (typeof value === 'number' && Number.isFinite(value)) return new THREE.Color(value);
  if (typeof value === 'string' && value.trim()) {
    try {
      return new THREE.Color(value.trim());
    } catch {
      return new THREE.Color(fallback);
    }
  }
  return new THREE.Color(fallback);
};

const abortError = () => {
  const error = new Error('Scene construction was cancelled');
  error.name = 'AbortError';
  return error;
};

const throwIfAborted = (signal) => {
  if (signal?.aborted) throw abortError();
};

const sanitizeVec2List = (value, fallback, minimum = 3) => {
  const source = Array.isArray(value) ? value : fallback;
  const result = source
    .slice(0, LIMITS.profilePoints)
    .filter((point) => Array.isArray(point) && point.length >= 2)
    .map((point) => asVec2(point));
  return result.length >= minimum ? result : fallback.map((point) => point.slice());
};

const sanitizeVec3List = (value, fallback, minimum = 2) => {
  const source = Array.isArray(value) ? value : fallback;
  const result = source
    .slice(0, LIMITS.pathPoints)
    .filter((point) => Array.isArray(point) && point.length >= 3)
    .map((point) => asVec3(point));
  return result.length >= minimum ? result : fallback.map((point) => point.slice());
};

const createLegacyGeometry = (node) => {
  const type = String(node.type || 'box').toLowerCase();
  const size = asPositiveVec3(node.size, [1, 1, 1]);
  const radius = readNumber(node.radius, 0.4, 0.01, 100);
  const height = readNumber(node.height, 1, 0.01, 100);
  const tube = readNumber(node.tube, 0.12, 0.005, 100);

  switch (type) {
    case 'sphere':
      return new THREE.SphereGeometry(radius, 32, 24);
    case 'cylinder':
      return new THREE.CylinderGeometry(radius, radius, height, 24);
    case 'cone':
      return new THREE.ConeGeometry(radius, height, 24);
    case 'torus':
      return new THREE.TorusGeometry(radius, Math.min(tube, radius * 0.95), 16, 48);
    case 'plane':
      return new THREE.PlaneGeometry(size[0], size[1]);
    case 'box':
    default:
      return new THREE.BoxGeometry(size[0], size[1], size[2]);
  }
};

const createLegacyMaterial = (node) => new THREE.MeshStandardMaterial({
  color: parseColor(node.color),
  metalness: readNumber(node.metalness, 0.25, 0, 1),
  roughness: readNumber(node.roughness, 0.55, 0, 1),
});

const wouldCreateCycle = (id, parentId, parentById) => {
  let cursor = parentId;
  const visited = new Set([id]);
  while (cursor) {
    if (visited.has(cursor)) return true;
    visited.add(cursor);
    cursor = parentById.get(cursor);
  }
  return false;
};

const addFallbackMesh = (root) => {
  const fallback = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.2, roughness: 0.6 }),
  );
  fallback.name = 'fallback-model';
  fallback.castShadow = true;
  fallback.receiveShadow = true;
  root.add(fallback);
};

const buildLegacyGroup = (sceneSpec) => {
  const root = new THREE.Group();
  root.name = safeName(sceneSpec?.title, 'scene-root');
  root.userData.sceneSpecKind = 'legacy-nodes';

  const rawNodes = Array.isArray(sceneSpec?.nodes)
    ? sceneSpec.nodes.slice(0, LIMITS.legacyNodes)
    : [];
  const objects = new Map();
  const parentById = new Map();

  rawNodes.forEach((raw, index) => {
    if (!isRecord(raw)) return;
    const type = String(raw.type || 'box').toLowerCase();
    if (!LEGACY_TYPES.has(type)) return;

    const id = safeName(raw.id, `node-${index}`);
    if (objects.has(id)) return;
    const object3d = type === 'group'
      ? new THREE.Group()
      : new THREE.Mesh(createLegacyGeometry(raw), createLegacyMaterial(raw));
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
    const parentId = raw.parent == null || raw.parent === '' ? null : safeName(raw.parent, '');
    parentById.set(id, parentId);
  });

  objects.forEach((object3d, id) => {
    const parentId = parentById.get(id);
    if (parentId && objects.has(parentId) && !wouldCreateCycle(id, parentId, parentById)) {
      objects.get(parentId).add(object3d);
    } else {
      root.add(object3d);
    }
  });

  if (objects.size === 0) addFallbackMesh(root);
  return root;
};

const createSculptMaterial = (materialSpec = {}) => {
  const baseColor = materialSpec.baseColor
    ?? materialSpec.color
    ?? materialSpec.albedo?.dominant
    ?? '#8A7A5F';
  const opacity = readLayerNumber(materialSpec.opacity, ['base', 'amount'], 1);
  const transmission = readLayerNumber(materialSpec.transmission, ['base', 'amount'], 0);
  const material = new THREE.MeshPhysicalMaterial({
    color: parseColor(baseColor, 0x8a7a5f),
    roughness: readLayerNumber(materialSpec.roughness, ['base'], 0.65),
    metalness: readLayerNumber(materialSpec.metalness, ['base'], 0),
    clearcoat: readLayerNumber(materialSpec.clearcoat, ['base', 'amount'], 0),
    clearcoatRoughness: readLayerNumber(materialSpec.clearcoatRoughness, ['base'], 0.25),
    transmission,
    ior: readLayerNumber(materialSpec.ior, ['base', 'value'], 1.5, 1, 2.333),
    thickness: readLayerNumber(materialSpec.thickness, ['base', 'amount'], 0, 0, 100),
    attenuationDistance: readLayerNumber(
      materialSpec.attenuationDistance,
      ['base', 'value'],
      1_000,
      0.001,
      1_000,
    ),
    attenuationColor: parseColor(materialSpec.attenuationColor, 0xffffff),
    sheen: readLayerNumber(materialSpec.sheen, ['base', 'amount'], 0),
    sheenColor: parseColor(materialSpec.sheenColor, 0xffffff),
    sheenRoughness: readLayerNumber(materialSpec.sheenRoughness, ['base'], 1),
    iridescence: readLayerNumber(materialSpec.iridescence, ['base', 'amount'], 0),
    iridescenceIOR: readLayerNumber(materialSpec.iridescenceIOR, ['base', 'value'], 1.3, 1, 2.333),
    anisotropy: readLayerNumber(materialSpec.anisotropy, ['base', 'amount'], 0),
    anisotropyRotation: readLayerNumber(materialSpec.anisotropy, ['rotation'], 0, -Math.PI * 2, Math.PI * 2),
    specularIntensity: readLayerNumber(materialSpec.specularIntensity, ['base'], 1),
    specularColor: parseColor(materialSpec.specularColor, 0xffffff),
    emissive: parseColor(materialSpec.emissive, 0x000000),
    emissiveIntensity: readLayerNumber(materialSpec.emissiveIntensity, ['base'], 1, 0, 100),
    opacity,
    transparent: opacity < 0.999 || transmission > 0,
    alphaTest: readLayerNumber(materialSpec.alpha, ['cutoff', 'alphaTest'], 0),
    side: materialSpec.doubleSided === true ? THREE.DoubleSide : THREE.FrontSide,
    depthWrite: opacity >= 0.999,
  });
  material.envMapIntensity = readNumber(materialSpec.envMapIntensity, 0.9, 0, 10);
  material.name = safeName(materialSpec.name || materialSpec.id, 'sculpt-material');
  material.userData.sculptMaterialId = safeName(materialSpec.id, 'material');
  material.userData.hidden = opacity <= 0.001;
  return material;
};

const buildExtrudeShape = (profile) => {
  const points = sanitizeVec2List(profile?.points, DEFAULT_EXTRUDE_PROFILE.points);
  const shape = new THREE.Shape();
  shape.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  shape.closePath();

  const holes = Array.isArray(profile?.holes) ? profile.holes.slice(0, 32) : [];
  holes.forEach((rawHole) => {
    const holePoints = sanitizeVec2List(rawHole, [], 3);
    if (holePoints.length < 3) return;
    const hole = new THREE.Path();
    hole.moveTo(holePoints[0][0], holePoints[0][1]);
    holePoints.slice(1).forEach(([x, y]) => hole.lineTo(x, y));
    hole.closePath();
    shape.holes.push(hole);
  });

  const ovalHoles = Array.isArray(profile?.ovalHoles) ? profile.ovalHoles.slice(0, 32) : [];
  ovalHoles.forEach((oval) => {
    if (!isRecord(oval)) return;
    const hole = new THREE.Path();
    hole.absellipse(
      readNumber(oval.cx, 0),
      readNumber(oval.cy, 0),
      readNumber(oval.rx, 0.05, 0.001, 100),
      readNumber(oval.ry, 0.05, 0.001, 100),
      0,
      Math.PI * 2,
      true,
    );
    shape.holes.push(hole);
  });
  return shape;
};

const buildExtrudeGeometry = (profile = DEFAULT_EXTRUDE_PROFILE) => new THREE.ExtrudeGeometry(
  buildExtrudeShape(profile),
  {
    depth: readNumber(profile.depth, DEFAULT_EXTRUDE_PROFILE.depth, 0.001, 100),
    steps: Math.round(readNumber(profile.steps, 1, 1, 8)),
    bevelEnabled: profile.bevelEnabled === true,
    bevelSize: readNumber(profile.bevelSize, 0.01, 0, 10),
    bevelThickness: readNumber(profile.bevelThickness, 0.01, 0, 10),
    bevelSegments: Math.round(readNumber(profile.bevelSegments, 1, 1, 6)),
  },
);

const buildGroundBladeGeometry = (rawSpec = DEFAULT_BLADE_SPEC) => {
  const stations = sanitizeVec3List(rawSpec.stations, DEFAULT_BLADE_SPEC.stations);
  const thickness = readNumber(rawSpec.thickness, DEFAULT_BLADE_SPEC.thickness, 0.001, 10);
  const halfThickness = thickness / 2;
  const grindFrac = readNumber(rawSpec.grindFrac, DEFAULT_BLADE_SPEC.grindFrac, 0.05, 0.95);
  const swedgeFrac = readNumber(
    rawSpec.swedgeFromTipFrac,
    DEFAULT_BLADE_SPEC.swedgeFromTipFrac,
    0,
    1,
  );
  const firstX = stations[0][0];
  const lastX = stations[stations.length - 1][0];
  const length = lastX - firstX || 1;
  let minY = Infinity;
  let maxY = -Infinity;
  stations.forEach((station) => {
    minY = Math.min(minY, station[2]);
    maxY = Math.max(maxY, station[1]);
  });
  const height = maxY - minY || 1;

  const ring = ([x, topY, bottomY]) => {
    const sectionHeight = Math.max(0.0001, topY - bottomY);
    const grindY = bottomY + grindFrac * sectionHeight;
    const swedgeY = topY - 0.42 * sectionHeight;
    const swedgeThickness = ((lastX - x) / length < swedgeFrac) ? 0 : halfThickness;
    return [
      [x, bottomY, 0],
      [x, grindY, halfThickness],
      [x, swedgeY, halfThickness],
      [x, topY, swedgeThickness],
      [x, topY, -swedgeThickness],
      [x, swedgeY, -halfThickness],
      [x, grindY, -halfThickness],
    ];
  };

  const positions = [];
  const addTriangle = (a, b, c) => positions.push(...a, ...b, ...c);
  let previous = ring(stations[0]);
  for (let index = 1; index < 6; index += 1) {
    addTriangle(previous[0], previous[index], previous[index + 1]);
  }
  for (let stationIndex = 1; stationIndex < stations.length; stationIndex += 1) {
    const current = ring(stations[stationIndex]);
    for (let index = 0; index < 7; index += 1) {
      const next = (index + 1) % 7;
      addTriangle(previous[index], previous[next], current[next]);
      addTriangle(previous[index], current[next], current[index]);
    }
    previous = current;
  }
  for (let index = 1; index < 6; index += 1) {
    addTriangle(previous[0], previous[index + 1], previous[index]);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const uv = [];
  for (let index = 0; index < positions.length; index += 3) {
    uv.push((positions[index] - firstX) / length, (positions[index + 1] - minY) / height);
  }
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.computeVertexNormals();
  return geometry;
};

const buildLatheGeometry = (profile = DEFAULT_LATHE_PROFILE) => {
  const points = sanitizeVec2List(profile.points, DEFAULT_LATHE_PROFILE.points, 2)
    .map(([radius, y]) => new THREE.Vector2(Math.max(0.0001, Math.abs(radius)), y));
  return new THREE.LatheGeometry(
    points,
    Math.round(readNumber(profile.segments, DEFAULT_LATHE_PROFILE.segments, 8, 96)),
  );
};

const buildTubeGeometry = (rawPath = DEFAULT_TUBE_PATH) => {
  const points = sanitizeVec3List(rawPath.points, DEFAULT_TUBE_PATH.points)
    .map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const closed = rawPath.closed === true && points.length >= 3;
  const curve = new THREE.CatmullRomCurve3(points, closed, 'centripetal');
  return new THREE.TubeGeometry(
    curve,
    Math.round(readNumber(rawPath.tubularSegments, Math.max(8, points.length * 6), 8, 256)),
    readNumber(rawPath.radius, DEFAULT_TUBE_PATH.radius, 0.001, 100),
    Math.round(readNumber(rawPath.radialSegments, 12, 3, 48)),
    closed,
  );
};

const buildCurveSweepGeometry = (rawSweep = DEFAULT_CURVE_SWEEP) => {
  const crossSection = sanitizeVec2List(
    rawSweep.crossSection?.points,
    DEFAULT_CURVE_SWEEP.crossSection.points,
  );
  const shape = new THREE.Shape();
  shape.moveTo(crossSection[0][0], crossSection[0][1]);
  crossSection.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
  shape.closePath();
  const spine = sanitizeVec3List(rawSweep.spine, DEFAULT_CURVE_SWEEP.spine)
    .map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const closed = rawSweep.closed === true && spine.length >= 3;
  const path = new THREE.CatmullRomCurve3(spine, closed, 'centripetal');
  return new THREE.ExtrudeGeometry(shape, {
    extrudePath: path,
    steps: Math.round(readNumber(rawSweep.steps, Math.max(24, spine.length * 8), 8, 256)),
    bevelEnabled: false,
  });
};

const createSculptGeometry = (primitive, component = {}) => {
  const descriptor = isRecord(component.geometryDescriptor) ? component.geometryDescriptor : {};
  switch (primitive) {
    case 'sphere':
    case 'ellipsoid':
      return new THREE.SphereGeometry(0.5, 48, 32);
    case 'cylinder':
      return new THREE.CylinderGeometry(0.5, 0.5, 1, 40, 4);
    case 'cone':
      return new THREE.ConeGeometry(0.5, 1, 40, 4);
    case 'capsule':
      return new THREE.CapsuleGeometry(0.35, 0.7, 12, 24);
    case 'torus': {
      const tubeRatio = readNumber(descriptor.torusTubeRatio, 0.18, 0.02, 0.95);
      return new THREE.TorusGeometry(0.45, 0.45 * tubeRatio, 20, 72);
    }
    case 'plane-card':
      return new THREE.PlaneGeometry(1, 1, 12, 12);
    case 'extrude':
      return buildExtrudeGeometry(isRecord(descriptor.profile2D)
        ? descriptor.profile2D
        : DEFAULT_EXTRUDE_PROFILE);
    case 'ground-blade':
      return buildGroundBladeGeometry(isRecord(descriptor.bladeSpec)
        ? descriptor.bladeSpec
        : DEFAULT_BLADE_SPEC);
    case 'lathe':
      return buildLatheGeometry(isRecord(descriptor.latheProfile)
        ? descriptor.latheProfile
        : DEFAULT_LATHE_PROFILE);
    case 'tube':
      return buildTubeGeometry(isRecord(descriptor.tubePath)
        ? descriptor.tubePath
        : DEFAULT_TUBE_PATH);
    case 'curve-sweep':
      return buildCurveSweepGeometry(isRecord(descriptor.curveSweep)
        ? descriptor.curveSweep
        : DEFAULT_CURVE_SWEEP);
    case 'instanced-cluster': {
      const base = SCULPT_TYPES.has(String(descriptor.baseGeometry))
        && descriptor.baseGeometry !== 'instanced-cluster'
        ? String(descriptor.baseGeometry)
        : 'box';
      return createSculptGeometry(base, component);
    }
    case 'box':
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
};

const componentScale = (component, transform) => {
  if (Array.isArray(transform.scale)) return asPositiveVec3(transform.scale);
  const dimensions = isRecord(component.dimensions) ? component.dimensions : {};
  const radius = readNumber(dimensions.radius, 0.5, 0.001, 500);
  return asPositiveVec3([
    dimensions.width ?? radius * 2,
    dimensions.height ?? dimensions.length ?? 1,
    dimensions.depth ?? radius * 2,
  ]);
};

const makeAttachmentEndpoint = (component) => {
  if (!isRecord(component.attachment)) return null;
  const attachment = component.attachment;
  if (!Array.isArray(attachment.localStart) || !Array.isArray(attachment.localEnd)) return null;
  const start = new THREE.Vector3(...asVec3(attachment.localStart));
  const end = new THREE.Vector3(...asVec3(attachment.localEnd, [0, 1, 0]));
  const direction = end.clone().sub(start);
  const rawLength = direction.length();
  if (rawLength <= 0.0001) return null;
  direction.normalize();
  const embedDepth = readNumber(
    attachment.embedDepth ?? attachment.overlap,
    0,
    0,
    Math.min(rawLength * 0.45, 10),
  );
  const embeddedStart = start.clone().addScaledVector(direction, -embedDepth);
  const delta = end.clone().sub(embeddedStart);
  const length = delta.length();
  return {
    start: embeddedStart,
    midpoint: delta.clone().multiplyScalar(0.5),
    quaternion: new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      delta.clone().normalize(),
    ),
    length,
    baseRadius: readNumber(attachment.baseRadius, 0.06, 0.003, 100),
    endRadius: readNumber(
      attachment.endRadius,
      readNumber(attachment.baseRadius, 0.06, 0.003, 100) * 0.55,
      0.002,
      100,
    ),
  };
};

const applyObjectTransform = (object, transform, scaleFallback = [1, 1, 1]) => {
  const position = asVec3(transform?.position);
  const rotation = asVec3(transform?.rotation);
  const scale = asPositiveVec3(transform?.scale, scaleFallback);
  object.position.set(...position);
  object.rotation.set(...rotation);
  object.scale.set(...scale);
};

const makeInstanceTransform = (system, index, count) => {
  const placement = isRecord(system.placement) ? system.placement : {};
  const mode = String(placement.mode || 'radial').toLowerCase();
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3(...asPositiveVec3(system.instanceScale, [0.1, 0.1, 0.1]));
  const explicit = Array.isArray(system.instances) && isRecord(system.instances[index])
    ? system.instances[index]
    : null;

  if (explicit) {
    position.set(...asVec3(explicit.position));
    quaternion.setFromEuler(new THREE.Euler(...asVec3(explicit.rotation)));
    scale.set(...asPositiveVec3(explicit.scale, scale.toArray()));
    return new THREE.Matrix4().compose(position, quaternion, scale);
  }

  if (mode === 'linear') {
    const start = new THREE.Vector3(...asVec3(placement.start));
    if (Array.isArray(placement.end)) {
      const end = new THREE.Vector3(...asVec3(placement.end));
      position.lerpVectors(start, end, count <= 1 ? 0 : index / (count - 1));
    } else {
      const direction = new THREE.Vector3(...asVec3(placement.direction, [1, 0, 0]));
      if (direction.lengthSq() < 0.000001) direction.set(1, 0, 0);
      direction.normalize();
      position.copy(start).addScaledVector(direction, readNumber(placement.spacing, 0.15, 0, 100) * index);
      quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction);
    }
  } else if (mode === 'grid') {
    const columns = Math.max(1, Math.round(readNumber(placement.columns, Math.ceil(Math.sqrt(count)), 1, count)));
    const rows = Math.max(1, Math.round(readNumber(placement.rows, Math.ceil(count / columns), 1, count)));
    const layerSize = columns * rows;
    const layer = Math.floor(index / layerSize);
    const withinLayer = index % layerSize;
    const row = Math.floor(withinLayer / columns);
    const column = withinLayer % columns;
    const spacing = asVec3(placement.spacing, [0.15, 0.15, 0.15]);
    const origin = asVec3(placement.origin);
    position.set(
      origin[0] + (column - (columns - 1) / 2) * spacing[0],
      origin[1] + (row - (rows - 1) / 2) * spacing[1],
      origin[2] + layer * spacing[2],
    );
  } else if (mode === 'path' && Array.isArray(placement.points)) {
    const points = sanitizeVec3List(placement.points, DEFAULT_TUBE_PATH.points)
      .map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const curve = new THREE.CatmullRomCurve3(points, placement.closed === true, 'centripetal');
    const t = count <= 1 ? 0 : index / (count - 1);
    position.copy(curve.getPointAt(t));
    const tangent = curve.getTangentAt(t).normalize();
    quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent);
  } else {
    const axis = new THREE.Vector3(...asVec3(placement.axis, [0, 0, 1]));
    if (axis.lengthSq() < 0.000001) axis.set(0, 0, 1);
    axis.normalize();
    const seed = Math.abs(axis.z) < 0.9
      ? new THREE.Vector3(0, 0, 1)
      : new THREE.Vector3(1, 0, 0);
    const perpendicular = new THREE.Vector3().crossVectors(axis, seed).normalize();
    const start = THREE.MathUtils.degToRad(readNumber(placement.startAngleDeg, 0, -36_000, 36_000));
    const span = THREE.MathUtils.degToRad(readNumber(placement.arcDegrees, 360, -36_000, 36_000));
    const angle = start + (count <= 1 ? 0 : span * index / (span === Math.PI * 2 ? count : count - 1));
    const direction = perpendicular.clone().applyAxisAngle(axis, angle);
    const center = new THREE.Vector3(...asVec3(placement.center));
    position.copy(center).addScaledVector(direction, readNumber(placement.radius, 0, 0, 1_000));
    const orient = placement.orientation === 'tangent'
      ? new THREE.Vector3().crossVectors(axis, direction).normalize()
      : direction;
    quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), orient);
  }
  return new THREE.Matrix4().compose(position, quaternion, scale);
};

const buildSculptGroup = (sceneSpec) => {
  const root = new THREE.Group();
  root.name = safeName(sceneSpec.targetName || sceneSpec.title, 'object-sculpt');
  root.userData.sceneSpecKind = 'object-sculpt-spec';
  root.userData.schemaVersion = safeName(sceneSpec.schemaVersion, 'unknown');

  const materialMap = new Map();
  const materials = Array.isArray(sceneSpec.materials)
    ? sceneSpec.materials.slice(0, LIMITS.materials)
    : [];
  materials.forEach((materialSpec, index) => {
    if (!isRecord(materialSpec)) return;
    const id = safeName(materialSpec.id, `material-${index}`);
    if (!materialMap.has(id)) materialMap.set(id, createSculptMaterial({ ...materialSpec, id }));
  });
  if (materialMap.size === 0) {
    materialMap.set('base', createSculptMaterial({ id: 'base', baseColor: '#8A7A5F' }));
  }
  const defaultMaterial = [...materialMap.values()].find((material) => !material.userData.hidden)
    || materialMap.values().next().value;

  const components = Array.isArray(sceneSpec.componentTree)
    ? sceneSpec.componentTree.slice(0, LIMITS.components)
    : [];
  const objects = new Map();
  const parentById = new Map();
  const attachmentById = new Map();
  const socketMap = new Map();
  let totalSockets = 0;
  let renderableCount = 0;

  components.forEach((component, index) => {
    if (!isRecord(component)) return;
    const id = safeName(component.id, `component-${index}`);
    if (objects.has(id)) return;
    const primitive = SCULPT_TYPES.has(String(component.primitive))
      ? String(component.primitive)
      : 'box';
    const pivot = new THREE.Group();
    pivot.name = `${safeName(component.name, id)}__pivot`;
    pivot.userData.sculptComponentId = id;
    const transform = isRecord(component.transform) ? component.transform : {};
    const endpoint = makeAttachmentEndpoint(component);
    if (endpoint) {
      pivot.position.copy(endpoint.start);
      attachmentById.set(id, endpoint);
    } else {
      applyObjectTransform(pivot, transform, componentScale(component, transform));
    }

    const materialId = safeName(component.material, '');
    const material = materialMap.get(materialId) || defaultMaterial;
    if (!material.userData.hidden) {
      const geometry = endpoint
        ? new THREE.CylinderGeometry(
          endpoint.endRadius,
          endpoint.baseRadius,
          endpoint.length,
          32,
          4,
        )
        : createSculptGeometry(primitive, component);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = safeName(component.name, id);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData.sculptComponentId = id;
      if (endpoint) {
        mesh.position.copy(endpoint.midpoint);
        mesh.quaternion.copy(endpoint.quaternion);
      }
      pivot.add(mesh);
      renderableCount += 1;
    }

    const actionProfile = isRecord(component.actionProfile) ? component.actionProfile : {};
    const sockets = Array.isArray(actionProfile.sockets) ? actionProfile.sockets : [];
    sockets.slice(0, Math.max(0, LIMITS.sockets - totalSockets)).forEach((socketSpec, socketIndex) => {
      if (!isRecord(socketSpec)) return;
      const socketId = safeName(socketSpec.id, `socket-${socketIndex}`);
      const socket = new THREE.Object3D();
      socket.name = socketId;
      socket.position.set(...asVec3(socketSpec.localPosition ?? socketSpec.position));
      socket.rotation.set(...asVec3(socketSpec.localRotation ?? socketSpec.rotation));
      socket.userData.socketId = socketId;
      pivot.add(socket);
      socketMap.set(`${id}:${socketId}`, socket);
      totalSockets += 1;
    });

    const parentId = safeName(component.parent ?? component.attachment?.parentId, '');
    parentById.set(id, parentId || null);
    objects.set(id, pivot);
  });

  objects.forEach((object3d, id) => {
    const parentId = parentById.get(id);
    const component = components.find((item) => isRecord(item) && safeName(item.id, '') === id);
    const socketId = safeName(component?.attachment?.parentSocket, '');
    const socket = parentId && socketId ? socketMap.get(`${parentId}:${socketId}`) : null;
    const canUseSocket = socket && !attachmentById.has(id);
    if (canUseSocket && !wouldCreateCycle(id, parentId, parentById)) {
      socket.add(object3d);
    } else if (parentId && objects.has(parentId) && !wouldCreateCycle(id, parentId, parentById)) {
      objects.get(parentId).add(object3d);
    } else {
      root.add(object3d);
    }
  });

  let remainingInstances = LIMITS.totalInstances;
  const repetitionSystems = Array.isArray(sceneSpec.repetitionSystems)
    ? sceneSpec.repetitionSystems.slice(0, LIMITS.repetitionSystems)
    : [];
  repetitionSystems.forEach((system, systemIndex) => {
    if (!isRecord(system) || remainingInstances <= 0) return;
    const explicitCount = Array.isArray(system.instances) ? system.instances.length : Number(system.count);
    const count = Math.min(
      Math.max(0, Math.floor(Number.isFinite(explicitCount) ? explicitCount : 0)),
      LIMITS.instancesPerSystem,
      remainingInstances,
    );
    if (count === 0) return;
    remainingInstances -= count;

    const primitiveCandidate = String(system.primitive || system.geometry?.primitive || 'box');
    const primitive = SCULPT_TYPES.has(primitiveCandidate) ? primitiveCandidate : 'box';
    const geometryDescriptor = isRecord(system.geometryDescriptor)
      ? system.geometryDescriptor
      : (isRecord(system.geometry) ? system.geometry : {});
    const geometry = createSculptGeometry(primitive, { geometryDescriptor });
    const material = materialMap.get(safeName(system.material, '')) || defaultMaterial;
    const cluster = new THREE.InstancedMesh(geometry, material, count);
    cluster.name = safeName(system.id, `repetition-${systemIndex}`);
    cluster.castShadow = true;
    cluster.receiveShadow = true;
    cluster.userData.repetitionSystemId = safeName(system.id, `repetition-${systemIndex}`);
    for (let instanceIndex = 0; instanceIndex < count; instanceIndex += 1) {
      cluster.setMatrixAt(instanceIndex, makeInstanceTransform(system, instanceIndex, count));
    }
    cluster.instanceMatrix.needsUpdate = true;

    const wrapper = new THREE.Group();
    wrapper.name = `${cluster.name}__instances`;
    applyObjectTransform(wrapper, isRecord(system.transform) ? system.transform : {});
    wrapper.add(cluster);
    const parentId = safeName(system.parent, 'root');
    (objects.get(parentId) || root).add(wrapper);
    renderableCount += 1;
  });

  if (renderableCount === 0) addFallbackMesh(root);
  return root;
};

const validateReliefImageSource = (value) => {
  if (typeof value !== 'string' || !value.startsWith('data:image/')) {
    throw new Error('Image relief requires an embedded image data URL');
  }
  if (value.length > LIMITS.embeddedImageCharacters) {
    throw new Error('Embedded image exceeds the safe preview budget');
  }
  if (!/^data:image\/(png|webp|jpeg);base64,/i.test(value)) {
    throw new Error('Unsupported embedded image format');
  }
  return value;
};

const loadImage = (source, signal) => new Promise((resolve, reject) => {
  throwIfAborted(signal);
  const image = new Image();
  image.decoding = 'async';
  let settled = false;
  const finish = (callback, value) => {
    if (settled) return;
    settled = true;
    signal?.removeEventListener('abort', handleAbort);
    image.onload = null;
    image.onerror = null;
    callback(value);
  };
  const handleAbort = () => {
    image.src = '';
    finish(reject, abortError());
  };
  image.onload = () => finish(resolve, image);
  image.onerror = () => finish(reject, new Error('Unable to decode the embedded relief image'));
  signal?.addEventListener('abort', handleAbort, { once: true });
  image.src = source;
});

const createCanvas = (width, height) => {
  const canvas = document.createElement('canvas');
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
    luminance[index] = (
      pixels[index * 4] * 0.2126
      + pixels[index * 4 + 1] * 0.7152
      + pixels[index * 4 + 2] * 0.0722
    ) / 255;
    if (coverage >= settings.alphaThreshold) {
      active[index] = 1;
      activeCells += 1;
    }
  }
  if (activeCells === 0) throw new Error('The relief image does not contain an opaque foreground');

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
        for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
          const neighborRow = row + rowOffset;
          const neighborColumn = column + columnOffset;
          if (
            neighborRow < 0
            || neighborRow >= gridHeight
            || neighborColumn < 0
            || neighborColumn >= gridWidth
          ) continue;
          const neighborIndex = neighborRow * gridWidth + neighborColumn;
          if (!active[neighborIndex]) continue;
          const neighborWeight = alpha[neighborIndex];
          weightedTotal += luminance[neighborIndex] * neighborWeight;
          weight += neighborWeight;
        }
      }
      const localMean = weight > 0 ? weightedTotal / weight : luminance[index];
      const localContrast = clamp(luminance[index] - localMean, -0.45, 0.45);
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
        if (cellRow < 0 || cellRow >= gridHeight || cellColumn < 0 || cellColumn >= gridWidth) continue;
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
        if (cellRow < 0 || cellRow >= gridHeight || cellColumn < 0 || cellColumn >= gridWidth) continue;
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
      const frontZ = halfDepth + coverage * vertexRelief(row, column) * settings.heightScale;
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
  const isActive = (row, column) => (
    row >= 0
    && row < gridHeight
    && column >= 0
    && column < gridWidth
    && active[row * gridWidth + column] === 1
  );
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
      frontIndices.push(topLeft, bottomLeft, topRight, topRight, bottomLeft, bottomRight);
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
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex([...frontIndices, ...backIndices, ...sideIndices]);
  geometry.addGroup(0, frontIndices.length, 0);
  geometry.addGroup(frontIndices.length, backIndices.length + sideIndices.length, 1);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
};

const buildImageReliefGroup = async (sceneSpec, signal) => {
  throwIfAborted(signal);
  if (typeof document === 'undefined' || typeof Image === 'undefined') {
    throw new Error('Image relief construction requires a browser environment');
  }
  const source = validateReliefImageSource(sceneSpec.image?.dataUrl);
  const image = await loadImage(source, signal);
  throwIfAborted(signal);

  const relief = isRecord(sceneSpec.relief) ? sceneSpec.relief : {};
  const sourceAspect = image.naturalWidth / Math.max(1, image.naturalHeight);
  const requestedResolution = Math.round(readNumber(
    relief.resolution,
    128,
    16,
    LIMITS.reliefResolution,
  ));
  let gridWidth = sourceAspect >= 1
    ? requestedResolution
    : Math.max(8, Math.round(requestedResolution * sourceAspect));
  let gridHeight = sourceAspect >= 1
    ? Math.max(8, Math.round(requestedResolution / sourceAspect))
    : requestedResolution;
  if (gridWidth * gridHeight > LIMITS.reliefCells) {
    const reduction = Math.sqrt(LIMITS.reliefCells / (gridWidth * gridHeight));
    gridWidth = Math.max(8, Math.floor(gridWidth * reduction));
    gridHeight = Math.max(8, Math.floor(gridHeight * reduction));
  }

  const sampleCanvas = createCanvas(gridWidth, gridHeight);
  const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
  if (!sampleContext) throw new Error('Canvas pixel access is unavailable');
  sampleContext.clearRect(0, 0, gridWidth, gridHeight);
  sampleContext.imageSmoothingEnabled = true;
  sampleContext.imageSmoothingQuality = 'high';
  sampleContext.drawImage(image, 0, 0, gridWidth, gridHeight);
  const pixels = sampleContext.getImageData(0, 0, gridWidth, gridHeight).data;
  throwIfAborted(signal);

  const modelWidth = readNumber(relief.width, sourceAspect >= 1 ? 2.4 : 2.4 * sourceAspect, 0.05, 100);
  const modelHeight = readNumber(relief.height, sourceAspect >= 1 ? 2.4 / sourceAspect : 2.4, 0.05, 100);
  const depth = readNumber(relief.depth, Math.min(modelWidth, modelHeight) * 0.1, 0.005, 10);
  const geometry = buildReliefGeometry(pixels, gridWidth, gridHeight, {
    width: modelWidth,
    height: modelHeight,
    depth,
    heightScale: readNumber(relief.heightScale, depth * 0.2, 0, Math.max(depth * 4, 0.01)),
    alphaThreshold: readNumber(relief.alphaThreshold, 0.06, 0.001, 0.95),
    edgeSoftness: readNumber(relief.edgeSoftness, 0.04, 0.001, 0.5),
  });

  const textureScale = Math.min(1, LIMITS.textureEdge / Math.max(image.naturalWidth, image.naturalHeight));
  const textureWidth = Math.max(2, Math.round(image.naturalWidth * textureScale));
  const textureHeight = Math.max(2, Math.round(image.naturalHeight * textureScale));
  const textureCanvas = createCanvas(textureWidth, textureHeight);
  const textureContext = textureCanvas.getContext('2d');
  if (!textureContext) {
    geometry.dispose();
    throw new Error('Canvas texture creation is unavailable');
  }
  textureContext.clearRect(0, 0, textureWidth, textureHeight);
  textureContext.imageSmoothingEnabled = true;
  textureContext.imageSmoothingQuality = 'high';
  textureContext.drawImage(image, 0, 0, textureWidth, textureHeight);
  if (signal?.aborted) {
    geometry.dispose();
    throw abortError();
  }

  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.name = 'image-relief-texture';
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  const materialSpec = isRecord(sceneSpec.material) ? sceneSpec.material : {};
  const frontMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: texture,
    metalness: readLayerNumber(materialSpec.metalness, ['base'], 0.18),
    roughness: readLayerNumber(materialSpec.roughness, ['base'], 0.48),
    alphaTest: readNumber(relief.alphaThreshold, 0.06, 0.001, 0.95),
    side: THREE.FrontSide,
  });
  frontMaterial.name = 'textured-front';
  const sideMaterial = new THREE.MeshPhysicalMaterial({
    color: parseColor(materialSpec.sideColor ?? materialSpec.baseColor, 0x44484d),
    metalness: readLayerNumber(materialSpec.metalness, ['base'], 0.18),
    roughness: clamp(readLayerNumber(materialSpec.roughness, ['base'], 0.48) + 0.16, 0, 1),
    side: THREE.DoubleSide,
  });
  sideMaterial.name = 'relief-back-and-walls';

  const mesh = new THREE.Mesh(geometry, [frontMaterial, sideMaterial]);
  mesh.name = safeName(sceneSpec.title || sceneSpec.targetName, 'image-relief');
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.reliefResolution = [gridWidth, gridHeight];
  const root = new THREE.Group();
  root.name = mesh.name;
  root.userData.sceneSpecKind = 'image-relief';
  root.userData.schemaVersion = RELIEF_SCHEMA_VERSION;
  root.add(mesh);
  return root;
};

/**
 * Builds a THREE.Group from one of the safe, declarative scene contracts used by Img2Three.
 * Factory TypeScript is intentionally never evaluated.
 */
export async function buildGroupFromSceneSpec(sceneSpec, { signal } = {}) {
  throwIfAborted(signal);
  if (!isRecord(sceneSpec)) {
    const root = new THREE.Group();
    root.name = 'scene-root';
    addFallbackMesh(root);
    return root;
  }
  if (sceneSpec.schemaVersion === RELIEF_SCHEMA_VERSION) {
    return buildImageReliefGroup(sceneSpec, signal);
  }
  if (Array.isArray(sceneSpec.componentTree)) {
    return buildSculptGroup(sceneSpec);
  }
  return buildLegacyGroup(sceneSpec);
}

export function readCameraFromSceneSpec(sceneSpec) {
  const camera = isRecord(sceneSpec?.camera) ? sceneSpec.camera : {};
  const referenceCamera = isRecord(sceneSpec?.referenceCamera) ? sceneSpec.referenceCamera : {};
  return {
    position: asVec3(camera.position ?? referenceCamera.positionHint, [1.8, 1.2, 2.4]),
    target: asVec3(camera.target, [0, 0, 0]),
    fov: readNumber(camera.fov ?? referenceCamera.fovDegrees, 36, 10, 100),
  };
}

export { LIMITS as SCENE_SPEC_LIMITS };

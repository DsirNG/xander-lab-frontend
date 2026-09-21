import * as THREE from "three";
import { buildLegacyGroup } from "./legacySceneBuilder";
import {
    buildImageReliefGroup,
    RELIEF_LIMITS,
    RELIEF_SCHEMA_VERSION,
} from "./imageReliefBuilder";
import {
    addFallbackMesh,
    asPositiveVec3,
    asVec2,
    asVec3,
    isRecord,
    parseColor,
    readLayerNumber,
    readNumber,
    safeName,
    throwIfAborted,
    wouldCreateCycle,
} from "./sceneSpecUtils";

const SCULPT_TYPES = new Set([
    "box",
    "sphere",
    "ellipsoid",
    "cylinder",
    "cone",
    "capsule",
    "torus",
    "plane-card",
    "extrude",
    "ground-blade",
    "lathe",
    "tube",
    "curve-sweep",
    "instanced-cluster",
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
    ...RELIEF_LIMITS,
});

const DEFAULT_EXTRUDE_PROFILE = {
    points: [
        [-0.3, -0.3],
        [0.3, -0.3],
        [0.3, 0.3],
        [-0.3, 0.3],
    ],
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
    points: [
        [0.3, -0.5],
        [0.15, 0],
        [0.3, 0.5],
    ],
    segments: 24,
};
const DEFAULT_TUBE_PATH = {
    points: [
        [0, -0.5, 0],
        [0, 0.5, 0],
    ],
    radius: 0.05,
    closed: false,
};
const DEFAULT_CURVE_SWEEP = {
    spine: [
        [-0.5, -0.4, 0],
        [-0.1, 0.1, 0],
        [0.3, 0.2, 0],
        [0.6, -0.1, 0],
    ],
    crossSection: {
        points: [
            [-0.04, -0.02],
            [0.04, -0.02],
            [0.04, 0.02],
            [-0.04, 0.02],
        ],
    },
    closed: false,
};

const sanitizeVec2List = (value, fallback, minimum = 3) => {
    const source = Array.isArray(value) ? value : fallback;
    const result = source
        .slice(0, LIMITS.profilePoints)
        .filter((point) => Array.isArray(point) && point.length >= 2)
        .map((point) => asVec2(point));
    return result.length >= minimum
        ? result
        : fallback.map((point) => point.slice());
};

const sanitizeVec3List = (value, fallback, minimum = 2) => {
    const source = Array.isArray(value) ? value : fallback;
    const result = source
        .slice(0, LIMITS.pathPoints)
        .filter((point) => Array.isArray(point) && point.length >= 3)
        .map((point) => asVec3(point));
    return result.length >= minimum
        ? result
        : fallback.map((point) => point.slice());
};

const createSculptMaterial = (materialSpec = {}) => {
    const baseColor =
        materialSpec.baseColor ??
        materialSpec.color ??
        materialSpec.albedo?.dominant ??
        "#8A7A5F";
    const opacity = readLayerNumber(
        materialSpec.opacity,
        ["base", "amount"],
        1,
    );
    const transmission = readLayerNumber(
        materialSpec.transmission,
        ["base", "amount"],
        0,
    );
    const material = new THREE.MeshPhysicalMaterial({
        color: parseColor(baseColor, 0x8a7a5f),
        roughness: readLayerNumber(materialSpec.roughness, ["base"], 0.65),
        metalness: readLayerNumber(materialSpec.metalness, ["base"], 0),
        clearcoat: readLayerNumber(
            materialSpec.clearcoat,
            ["base", "amount"],
            0,
        ),
        clearcoatRoughness: readLayerNumber(
            materialSpec.clearcoatRoughness,
            ["base"],
            0.25,
        ),
        transmission,
        ior: readLayerNumber(
            materialSpec.ior,
            ["base", "value"],
            1.5,
            1,
            2.333,
        ),
        thickness: readLayerNumber(
            materialSpec.thickness,
            ["base", "amount"],
            0,
            0,
            100,
        ),
        attenuationDistance: readLayerNumber(
            materialSpec.attenuationDistance,
            ["base", "value"],
            1_000,
            0.001,
            1_000,
        ),
        attenuationColor: parseColor(materialSpec.attenuationColor, 0xffffff),
        sheen: readLayerNumber(materialSpec.sheen, ["base", "amount"], 0),
        sheenColor: parseColor(materialSpec.sheenColor, 0xffffff),
        sheenRoughness: readLayerNumber(
            materialSpec.sheenRoughness,
            ["base"],
            1,
        ),
        iridescence: readLayerNumber(
            materialSpec.iridescence,
            ["base", "amount"],
            0,
        ),
        iridescenceIOR: readLayerNumber(
            materialSpec.iridescenceIOR,
            ["base", "value"],
            1.3,
            1,
            2.333,
        ),
        anisotropy: readLayerNumber(
            materialSpec.anisotropy,
            ["base", "amount"],
            0,
        ),
        anisotropyRotation: readLayerNumber(
            materialSpec.anisotropy,
            ["rotation"],
            0,
            -Math.PI * 2,
            Math.PI * 2,
        ),
        specularIntensity: readLayerNumber(
            materialSpec.specularIntensity,
            ["base"],
            1,
        ),
        specularColor: parseColor(materialSpec.specularColor, 0xffffff),
        emissive: parseColor(materialSpec.emissive, 0x000000),
        emissiveIntensity: readLayerNumber(
            materialSpec.emissiveIntensity,
            ["base"],
            1,
            0,
            100,
        ),
        opacity,
        transparent: opacity < 0.999 || transmission > 0,
        alphaTest: readLayerNumber(
            materialSpec.alpha,
            ["cutoff", "alphaTest"],
            0,
        ),
        side:
            materialSpec.doubleSided === true
                ? THREE.DoubleSide
                : THREE.FrontSide,
        depthWrite: opacity >= 0.999,
    });
    material.envMapIntensity = readNumber(
        materialSpec.envMapIntensity,
        0.9,
        0,
        10,
    );
    material.name = safeName(
        materialSpec.name || materialSpec.id,
        "sculpt-material",
    );
    material.userData.sculptMaterialId = safeName(materialSpec.id, "material");
    material.userData.hidden = opacity <= 0.001;
    return material;
};

const buildExtrudeShape = (profile) => {
    const points = sanitizeVec2List(
        profile?.points,
        DEFAULT_EXTRUDE_PROFILE.points,
    );
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
    shape.closePath();

    const holes = Array.isArray(profile?.holes)
        ? profile.holes.slice(0, 32)
        : [];
    holes.forEach((rawHole) => {
        const holePoints = sanitizeVec2List(rawHole, [], 3);
        if (holePoints.length < 3) return;
        const hole = new THREE.Path();
        hole.moveTo(holePoints[0][0], holePoints[0][1]);
        holePoints.slice(1).forEach(([x, y]) => hole.lineTo(x, y));
        hole.closePath();
        shape.holes.push(hole);
    });

    const ovalHoles = Array.isArray(profile?.ovalHoles)
        ? profile.ovalHoles.slice(0, 32)
        : [];
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

const buildExtrudeGeometry = (profile = DEFAULT_EXTRUDE_PROFILE) =>
    new THREE.ExtrudeGeometry(buildExtrudeShape(profile), {
        depth: readNumber(
            profile.depth,
            DEFAULT_EXTRUDE_PROFILE.depth,
            0.001,
            100,
        ),
        steps: Math.round(readNumber(profile.steps, 1, 1, 8)),
        bevelEnabled: profile.bevelEnabled === true,
        bevelSize: readNumber(profile.bevelSize, 0.01, 0, 10),
        bevelThickness: readNumber(profile.bevelThickness, 0.01, 0, 10),
        bevelSegments: Math.round(readNumber(profile.bevelSegments, 1, 1, 6)),
    });

const buildGroundBladeGeometry = (rawSpec = DEFAULT_BLADE_SPEC) => {
    const stations = sanitizeVec3List(
        rawSpec.stations,
        DEFAULT_BLADE_SPEC.stations,
    );
    const thickness = readNumber(
        rawSpec.thickness,
        DEFAULT_BLADE_SPEC.thickness,
        0.001,
        10,
    );
    const halfThickness = thickness / 2;
    const grindFrac = readNumber(
        rawSpec.grindFrac,
        DEFAULT_BLADE_SPEC.grindFrac,
        0.05,
        0.95,
    );
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
        const swedgeThickness =
            (lastX - x) / length < swedgeFrac ? 0 : halfThickness;
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
    for (
        let stationIndex = 1;
        stationIndex < stations.length;
        stationIndex += 1
    ) {
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
    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3),
    );
    const uv = [];
    for (let index = 0; index < positions.length; index += 3) {
        uv.push(
            (positions[index] - firstX) / length,
            (positions[index + 1] - minY) / height,
        );
    }
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geometry.computeVertexNormals();
    return geometry;
};

const buildLatheGeometry = (profile = DEFAULT_LATHE_PROFILE) => {
    const points = sanitizeVec2List(
        profile.points,
        DEFAULT_LATHE_PROFILE.points,
        2,
    ).map(
        ([radius, y]) =>
            new THREE.Vector2(Math.max(0.0001, Math.abs(radius)), y),
    );
    return new THREE.LatheGeometry(
        points,
        Math.round(
            readNumber(profile.segments, DEFAULT_LATHE_PROFILE.segments, 8, 96),
        ),
    );
};

const buildTubeGeometry = (rawPath = DEFAULT_TUBE_PATH) => {
    const points = sanitizeVec3List(
        rawPath.points,
        DEFAULT_TUBE_PATH.points,
    ).map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const closed = rawPath.closed === true && points.length >= 3;
    const curve = new THREE.CatmullRomCurve3(points, closed, "centripetal");
    return new THREE.TubeGeometry(
        curve,
        Math.round(
            readNumber(
                rawPath.tubularSegments,
                Math.max(8, points.length * 6),
                8,
                256,
            ),
        ),
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
    const spine = sanitizeVec3List(
        rawSweep.spine,
        DEFAULT_CURVE_SWEEP.spine,
    ).map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const closed = rawSweep.closed === true && spine.length >= 3;
    const path = new THREE.CatmullRomCurve3(spine, closed, "centripetal");
    return new THREE.ExtrudeGeometry(shape, {
        extrudePath: path,
        steps: Math.round(
            readNumber(rawSweep.steps, Math.max(24, spine.length * 8), 8, 256),
        ),
        bevelEnabled: false,
    });
};

const createSculptGeometry = (primitive, component = {}) => {
    const descriptor = isRecord(component.geometryDescriptor)
        ? component.geometryDescriptor
        : {};
    switch (primitive) {
        case "sphere":
        case "ellipsoid":
            return new THREE.SphereGeometry(0.5, 48, 32);
        case "cylinder":
            return new THREE.CylinderGeometry(0.5, 0.5, 1, 40, 4);
        case "cone":
            return new THREE.ConeGeometry(0.5, 1, 40, 4);
        case "capsule":
            return new THREE.CapsuleGeometry(0.35, 0.7, 12, 24);
        case "torus": {
            const tubeRatio = readNumber(
                descriptor.torusTubeRatio,
                0.18,
                0.02,
                0.95,
            );
            return new THREE.TorusGeometry(0.45, 0.45 * tubeRatio, 20, 72);
        }
        case "plane-card":
            return new THREE.PlaneGeometry(1, 1, 12, 12);
        case "extrude":
            return buildExtrudeGeometry(
                isRecord(descriptor.profile2D)
                    ? descriptor.profile2D
                    : DEFAULT_EXTRUDE_PROFILE,
            );
        case "ground-blade":
            return buildGroundBladeGeometry(
                isRecord(descriptor.bladeSpec)
                    ? descriptor.bladeSpec
                    : DEFAULT_BLADE_SPEC,
            );
        case "lathe":
            return buildLatheGeometry(
                isRecord(descriptor.latheProfile)
                    ? descriptor.latheProfile
                    : DEFAULT_LATHE_PROFILE,
            );
        case "tube":
            return buildTubeGeometry(
                isRecord(descriptor.tubePath)
                    ? descriptor.tubePath
                    : DEFAULT_TUBE_PATH,
            );
        case "curve-sweep":
            return buildCurveSweepGeometry(
                isRecord(descriptor.curveSweep)
                    ? descriptor.curveSweep
                    : DEFAULT_CURVE_SWEEP,
            );
        case "instanced-cluster": {
            const base =
                SCULPT_TYPES.has(String(descriptor.baseGeometry)) &&
                descriptor.baseGeometry !== "instanced-cluster"
                    ? String(descriptor.baseGeometry)
                    : "box";
            return createSculptGeometry(base, component);
        }
        case "box":
        default:
            return new THREE.BoxGeometry(1, 1, 1);
    }
};

const componentScale = (component, transform) => {
    if (Array.isArray(transform.scale)) return asPositiveVec3(transform.scale);
    const dimensions = isRecord(component.dimensions)
        ? component.dimensions
        : {};
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
    if (
        !Array.isArray(attachment.localStart) ||
        !Array.isArray(attachment.localEnd)
    )
        return null;
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
    const mode = String(placement.mode || "radial").toLowerCase();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3(
        ...asPositiveVec3(system.instanceScale, [0.1, 0.1, 0.1]),
    );
    const explicit =
        Array.isArray(system.instances) && isRecord(system.instances[index])
            ? system.instances[index]
            : null;

    if (explicit) {
        position.set(...asVec3(explicit.position));
        quaternion.setFromEuler(new THREE.Euler(...asVec3(explicit.rotation)));
        scale.set(...asPositiveVec3(explicit.scale, scale.toArray()));
        return new THREE.Matrix4().compose(position, quaternion, scale);
    }

    if (mode === "linear") {
        const start = new THREE.Vector3(...asVec3(placement.start));
        if (Array.isArray(placement.end)) {
            const end = new THREE.Vector3(...asVec3(placement.end));
            position.lerpVectors(
                start,
                end,
                count <= 1 ? 0 : index / (count - 1),
            );
        } else {
            const direction = new THREE.Vector3(
                ...asVec3(placement.direction, [1, 0, 0]),
            );
            if (direction.lengthSq() < 0.000001) direction.set(1, 0, 0);
            direction.normalize();
            position
                .copy(start)
                .addScaledVector(
                    direction,
                    readNumber(placement.spacing, 0.15, 0, 100) * index,
                );
            quaternion.setFromUnitVectors(
                new THREE.Vector3(1, 0, 0),
                direction,
            );
        }
    } else if (mode === "grid") {
        const columns = Math.max(
            1,
            Math.round(
                readNumber(
                    placement.columns,
                    Math.ceil(Math.sqrt(count)),
                    1,
                    count,
                ),
            ),
        );
        const rows = Math.max(
            1,
            Math.round(
                readNumber(
                    placement.rows,
                    Math.ceil(count / columns),
                    1,
                    count,
                ),
            ),
        );
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
    } else if (mode === "path" && Array.isArray(placement.points)) {
        const points = sanitizeVec3List(
            placement.points,
            DEFAULT_TUBE_PATH.points,
        ).map(([x, y, z]) => new THREE.Vector3(x, y, z));
        const curve = new THREE.CatmullRomCurve3(
            points,
            placement.closed === true,
            "centripetal",
        );
        const t = count <= 1 ? 0 : index / (count - 1);
        position.copy(curve.getPointAt(t));
        const tangent = curve.getTangentAt(t).normalize();
        quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent);
    } else {
        const axis = new THREE.Vector3(...asVec3(placement.axis, [0, 0, 1]));
        if (axis.lengthSq() < 0.000001) axis.set(0, 0, 1);
        axis.normalize();
        const seed =
            Math.abs(axis.z) < 0.9
                ? new THREE.Vector3(0, 0, 1)
                : new THREE.Vector3(1, 0, 0);
        const perpendicular = new THREE.Vector3()
            .crossVectors(axis, seed)
            .normalize();
        const start = THREE.MathUtils.degToRad(
            readNumber(placement.startAngleDeg, 0, -36_000, 36_000),
        );
        const span = THREE.MathUtils.degToRad(
            readNumber(placement.arcDegrees, 360, -36_000, 36_000),
        );
        const angle =
            start +
            (count <= 1
                ? 0
                : (span * index) / (span === Math.PI * 2 ? count : count - 1));
        const direction = perpendicular.clone().applyAxisAngle(axis, angle);
        const center = new THREE.Vector3(...asVec3(placement.center));
        position
            .copy(center)
            .addScaledVector(
                direction,
                readNumber(placement.radius, 0, 0, 1_000),
            );
        const orient =
            placement.orientation === "tangent"
                ? new THREE.Vector3().crossVectors(axis, direction).normalize()
                : direction;
        quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), orient);
    }
    return new THREE.Matrix4().compose(position, quaternion, scale);
};

const buildSculptGroup = (sceneSpec) => {
    const root = new THREE.Group();
    root.name = safeName(
        sceneSpec.targetName || sceneSpec.title,
        "object-sculpt",
    );
    root.userData.sceneSpecKind = "object-sculpt-spec";
    root.userData.schemaVersion = safeName(sceneSpec.schemaVersion, "unknown");

    const materialMap = new Map();
    const materials = Array.isArray(sceneSpec.materials)
        ? sceneSpec.materials.slice(0, LIMITS.materials)
        : [];
    materials.forEach((materialSpec, index) => {
        if (!isRecord(materialSpec)) return;
        const id = safeName(materialSpec.id, `material-${index}`);
        if (!materialMap.has(id))
            materialMap.set(id, createSculptMaterial({ ...materialSpec, id }));
    });
    if (materialMap.size === 0) {
        materialMap.set(
            "base",
            createSculptMaterial({ id: "base", baseColor: "#8A7A5F" }),
        );
    }
    const defaultMaterial =
        [...materialMap.values()].find(
            (material) => !material.userData.hidden,
        ) || materialMap.values().next().value;

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
            : "box";
        const pivot = new THREE.Group();
        pivot.name = `${safeName(component.name, id)}__pivot`;
        pivot.userData.sculptComponentId = id;
        const transform = isRecord(component.transform)
            ? component.transform
            : {};
        const endpoint = makeAttachmentEndpoint(component);
        if (endpoint) {
            pivot.position.copy(endpoint.start);
            attachmentById.set(id, endpoint);
        } else {
            applyObjectTransform(
                pivot,
                transform,
                componentScale(component, transform),
            );
        }

        const materialId = safeName(component.material, "");
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

        const actionProfile = isRecord(component.actionProfile)
            ? component.actionProfile
            : {};
        const sockets = Array.isArray(actionProfile.sockets)
            ? actionProfile.sockets
            : [];
        sockets
            .slice(0, Math.max(0, LIMITS.sockets - totalSockets))
            .forEach((socketSpec, socketIndex) => {
                if (!isRecord(socketSpec)) return;
                const socketId = safeName(
                    socketSpec.id,
                    `socket-${socketIndex}`,
                );
                const socket = new THREE.Object3D();
                socket.name = socketId;
                socket.position.set(
                    ...asVec3(socketSpec.localPosition ?? socketSpec.position),
                );
                socket.rotation.set(
                    ...asVec3(socketSpec.localRotation ?? socketSpec.rotation),
                );
                socket.userData.socketId = socketId;
                pivot.add(socket);
                socketMap.set(`${id}:${socketId}`, socket);
                totalSockets += 1;
            });

        const parentId = safeName(
            component.parent ?? component.attachment?.parentId,
            "",
        );
        parentById.set(id, parentId || null);
        objects.set(id, pivot);
    });

    objects.forEach((object3d, id) => {
        const parentId = parentById.get(id);
        const component = components.find(
            (item) => isRecord(item) && safeName(item.id, "") === id,
        );
        const socketId = safeName(component?.attachment?.parentSocket, "");
        const socket =
            parentId && socketId
                ? socketMap.get(`${parentId}:${socketId}`)
                : null;
        const canUseSocket = socket && !attachmentById.has(id);
        if (canUseSocket && !wouldCreateCycle(id, parentId, parentById)) {
            socket.add(object3d);
        } else if (
            parentId &&
            objects.has(parentId) &&
            !wouldCreateCycle(id, parentId, parentById)
        ) {
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
        const explicitCount = Array.isArray(system.instances)
            ? system.instances.length
            : Number(system.count);
        const count = Math.min(
            Math.max(
                0,
                Math.floor(Number.isFinite(explicitCount) ? explicitCount : 0),
            ),
            LIMITS.instancesPerSystem,
            remainingInstances,
        );
        if (count === 0) return;
        remainingInstances -= count;

        const primitiveCandidate = String(
            system.primitive || system.geometry?.primitive || "box",
        );
        const primitive = SCULPT_TYPES.has(primitiveCandidate)
            ? primitiveCandidate
            : "box";
        const geometryDescriptor = isRecord(system.geometryDescriptor)
            ? system.geometryDescriptor
            : isRecord(system.geometry)
              ? system.geometry
              : {};
        const geometry = createSculptGeometry(primitive, {
            geometryDescriptor,
        });
        const material =
            materialMap.get(safeName(system.material, "")) || defaultMaterial;
        const cluster = new THREE.InstancedMesh(geometry, material, count);
        cluster.name = safeName(system.id, `repetition-${systemIndex}`);
        cluster.castShadow = true;
        cluster.receiveShadow = true;
        cluster.userData.repetitionSystemId = safeName(
            system.id,
            `repetition-${systemIndex}`,
        );
        for (let instanceIndex = 0; instanceIndex < count; instanceIndex += 1) {
            cluster.setMatrixAt(
                instanceIndex,
                makeInstanceTransform(system, instanceIndex, count),
            );
        }
        cluster.instanceMatrix.needsUpdate = true;

        const wrapper = new THREE.Group();
        wrapper.name = `${cluster.name}__instances`;
        applyObjectTransform(
            wrapper,
            isRecord(system.transform) ? system.transform : {},
        );
        wrapper.add(cluster);
        const parentId = safeName(system.parent, "root");
        (objects.get(parentId) || root).add(wrapper);
        renderableCount += 1;
    });

    if (renderableCount === 0) addFallbackMesh(root);
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
        root.name = "scene-root";
        addFallbackMesh(root);
        return root;
    }
    if (sceneSpec.schemaVersion === RELIEF_SCHEMA_VERSION) {
        return buildImageReliefGroup(sceneSpec, signal);
    }
    if (Array.isArray(sceneSpec.componentTree)) {
        return buildSculptGroup(sceneSpec);
    }
    return buildLegacyGroup(sceneSpec, LIMITS.legacyNodes);
}

export function readCameraFromSceneSpec(sceneSpec) {
    const camera = isRecord(sceneSpec?.camera) ? sceneSpec.camera : {};
    const referenceCamera = isRecord(sceneSpec?.referenceCamera)
        ? sceneSpec.referenceCamera
        : {};
    return {
        position: asVec3(
            camera.position ?? referenceCamera.positionHint,
            [1.8, 1.2, 2.4],
        ),
        target: asVec3(camera.target, [0, 0, 0]),
        fov: readNumber(camera.fov ?? referenceCamera.fovDegrees, 36, 10, 100),
    };
}

export { LIMITS as SCENE_SPEC_LIMITS };

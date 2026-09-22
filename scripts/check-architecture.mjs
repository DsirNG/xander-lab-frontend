import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = path.join(root, "src");

const walk = (directory) =>
    fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) return walk(target);
        return /\.(jsx?|tsx?)$/.test(entry.name) ? [target] : [];
    });

const sourceFiles = walk(srcRoot);
const importPattern = /(?:from\s+|import\s*\()\s*["']([^"']+)["']/g;
const errors = [];
const featureGraph = new Map();
const rawRequestPattern =
    /\bfetch\s*\(|\baxios\.(?:create|get|post|put|patch|delete|request)\s*\(/;
const removedSourceRoots = [
    "hooks",
    "context",
    "utils",
    "router",
    "components/layouts",
    "components/seo",
];
const removedRootAliases = [
    /^@hooks(?:\/|$)/,
    /^@context(?:\/|$)/,
    /^@utils(?:\/|$)/,
    /^@router(?:\/|$)/,
    /^@components\/(?:common|layouts|seo)(?:\/|$)/,
];

const isCompatibilityFile = (content) => /@deprecated\s+Use\s+/.test(content);

const featureNameFromFile = (file) => {
    const relative = path.relative(path.join(srcRoot, "features"), file);
    const [feature] = relative.split(path.sep);
    return feature && feature !== ".." ? feature : null;
};

const addEdge = (from, to) => {
    if (!featureGraph.has(from)) featureGraph.set(from, new Set());
    featureGraph.get(from).add(to);
};

const appSpecifier = (specifier) =>
    specifier === "@app" ||
    specifier.startsWith("@app/") ||
    specifier === "@/app" ||
    specifier.startsWith("@/app/");

const featureSpecifier = (specifier) => {
    if (specifier === "@features" || specifier.startsWith("@features/")) {
        return specifier.slice("@features/".length);
    }
    if (specifier === "@/features" || specifier.startsWith("@/features/")) {
        return specifier.slice("@/features/".length);
    }
    return null;
};

const relativeSourcePath = (file, specifier) => {
    if (!specifier.startsWith(".")) return null;
    const resolved = path.normalize(
        path.resolve(path.dirname(file), specifier),
    );
    return path.relative(srcRoot, resolved).replaceAll(path.sep, "/");
};

const relativeFeatureSpecifier = (file, specifier) => {
    const relativeSource = relativeSourcePath(file, specifier);
    if (!relativeSource?.startsWith("features/")) return null;
    const relative = relativeSource.slice("features/".length);
    if (
        relative === "" ||
        relative === ".." ||
        relative.startsWith(`..${path.sep}`)
    )
        return null;
    return relative.split("/")[0] || null;
};

const removedSourceRootFromImport = (file, specifier) => {
    if (!specifier.startsWith(".")) {
        return removedRootAliases.find((alias) => alias.test(specifier))
            ? specifier
            : null;
    }
    const resolved = path.normalize(
        path.resolve(path.dirname(file), specifier),
    );
    const relativeToSrc = path
        .relative(srcRoot, resolved)
        .replaceAll(path.sep, "/");
    return removedSourceRoots.find(
        (root) =>
            relativeToSrc === root || relativeToSrc.startsWith(`${root}/`),
    );
};

for (const file of sourceFiles) {
    const relative = path.relative(root, file);
    const content = fs.readFileSync(file, "utf8");
    const isTest = /\.test\.[jt]sx?$/.test(file);
    const sourceFeature = featureNameFromFile(file);
    const compatibility = isCompatibilityFile(content);

    if (
        !isTest &&
        !relative.replaceAll(path.sep, "/").endsWith("src/api/http.js") &&
        rawRequestPattern.test(content)
    ) {
        errors.push(
            `${relative}: direct network client usage; use the shared @api/http transport`,
        );
    }

    for (const match of content.matchAll(importPattern)) {
        const specifier = match[1];

        // Component documentation pages use ?raw to display source text; it
        // is not a runtime module dependency and should not affect the graph.
        if (specifier.includes("?raw")) continue;

        const removedRoot = removedSourceRootFromImport(file, specifier);
        if (removedRoot) {
            errors.push(
                `${relative}: import removed root ${specifier}; use the owning app, feature, or shared path`,
            );
        }

        const relativeSource = relativeSourcePath(file, specifier);
        const relativeApp =
            relativeSource === "app" || relativeSource?.startsWith("app/");
        const relativeFeature = relativeSource?.startsWith("features/");

        if (relative.startsWith(`src${path.sep}shared${path.sep}`)) {
            if (appSpecifier(specifier) || relativeApp) {
                errors.push(`${relative}: shared -> app (${specifier})`);
            }
            if (featureSpecifier(specifier) !== null || relativeFeature) {
                errors.push(`${relative}: shared -> feature (${specifier})`);
            }
        }

        if (!sourceFeature || isTest) continue;
        if (appSpecifier(specifier) || relativeApp) {
            if (!compatibility) {
                errors.push(`${relative}: feature -> app (${specifier})`);
            }
            continue;
        }

        const featurePath = featureSpecifier(specifier);
        const relativeTargetFeature = relativeFeatureSpecifier(file, specifier);
        if (featurePath === null && relativeTargetFeature === null) continue;

        const target = featurePath?.split("/") || [];
        const targetFeature = target[0] || relativeTargetFeature;
        if (!targetFeature || targetFeature === sourceFeature) continue;

        addEdge(sourceFeature, targetFeature);
        if ((!featurePath || target.length > 1) && !compatibility) {
            errors.push(
                `${relative}: cross-feature deep import ${specifier}; use @features/${targetFeature}`,
            );
        }
    }
}

const visiting = new Set();
const visited = new Set();
const stack = [];

const visit = (feature) => {
    if (visiting.has(feature)) {
        const cycleStart = stack.indexOf(feature);
        const cycle = [...stack.slice(cycleStart), feature].join(" -> ");
        errors.push(`feature dependency cycle: ${cycle}`);
        return;
    }
    if (visited.has(feature)) return;

    visiting.add(feature);
    stack.push(feature);
    for (const dependency of featureGraph.get(feature) || []) visit(dependency);
    stack.pop();
    visiting.delete(feature);
    visited.add(feature);
};

for (const feature of featureGraph.keys()) visit(feature);

if (errors.length) {
    console.error("Architecture boundary violations:");
    for (const error of [...new Set(errors)]) console.error(`- ${error}`);
    process.exitCode = 1;
} else {
    console.log("Architecture boundaries passed.");
}

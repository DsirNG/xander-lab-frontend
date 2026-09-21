import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcRoot = path.join(root, "src");

const walk = (directory) =>
    fs
        .readdirSync(directory, { withFileTypes: true })
        .flatMap((entry) => {
            const target = path.join(directory, entry.name);
            if (entry.isDirectory()) return walk(target);
            return /\.(jsx?|tsx?)$/.test(entry.name) ? [target] : [];
        });

const sourceFiles = walk(srcRoot);
const importPattern = /(?:from\s+|import\s*\()\s*["']([^"']+)["']/g;
const errors = [];
const featureGraph = new Map();

const isCompatibilityFile = (content) =>
    /@deprecated\s+Use\s+/.test(content);

const featureNameFromFile = (file) => {
    const relative = path.relative(path.join(srcRoot, "features"), file);
    const [feature] = relative.split(path.sep);
    return feature && feature !== ".." ? feature : null;
};

const addEdge = (from, to) => {
    if (!featureGraph.has(from)) featureGraph.set(from, new Set());
    featureGraph.get(from).add(to);
};

for (const file of sourceFiles) {
    const relative = path.relative(root, file);
    const content = fs.readFileSync(file, "utf8");
    const isTest = /\.test\.[jt]sx?$/.test(file);
    const sourceFeature = featureNameFromFile(file);
    const compatibility = isCompatibilityFile(content);

    for (const match of content.matchAll(importPattern)) {
        const specifier = match[1];

        // Component documentation pages use ?raw to display source text; it
        // is not a runtime module dependency and should not affect the graph.
        if (specifier.includes("?raw")) continue;

        if (relative.startsWith(`src${path.sep}shared${path.sep}`)) {
            if (specifier === "@app" || specifier.startsWith("@app/")) {
                errors.push(`${relative}: shared -> app (${specifier})`);
            }
            if (
                specifier === "@features" ||
                specifier.startsWith("@features/")
            ) {
                errors.push(`${relative}: shared -> feature (${specifier})`);
            }
        }

        if (!sourceFeature || isTest) continue;
        if (specifier === "@app" || specifier.startsWith("@app/")) {
            if (!compatibility) {
                errors.push(`${relative}: feature -> app (${specifier})`);
            }
            continue;
        }

        if (!specifier.startsWith("@features/")) continue;
        const target = specifier.slice("@features/".length).split("/");
        const targetFeature = target[0];
        if (!targetFeature || targetFeature === sourceFeature) continue;

        addEdge(sourceFeature, targetFeature);
        if (target.length > 1 && !compatibility) {
            errors.push(
                `${relative}: feature deep import ${specifier}; use @features/${targetFeature}`,
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

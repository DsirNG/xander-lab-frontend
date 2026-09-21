import { IMAGE_TOOL } from "./imageResult";

export function hasStreamingAnswer(steps = []) {
    return steps.some(
        (step) => step.type === "answer" || step.type === "answer_delta",
    );
}

export function getActiveImageGeneration(steps = []) {
    let active = false;
    let message = "";

    steps.forEach((step) => {
        if (step.type !== "tool" || step.tool !== IMAGE_TOOL) return;
        if (step.phase === "start") {
            active = true;
            message = "";
        } else if (step.phase === "progress") {
            active = true;
            message = step.message || message;
        } else if (step.phase === "end" || step.phase === "error") {
            active = false;
        }
    });

    return active ? { message } : null;
}

import { useCallback, useEffect, useRef, useState } from "react";
import { isRequestCancelled } from "@api";
import { adminService } from "../services/adminService";

export function useModelPlayground(initialSelection) {
    const [providers, setProviders] = useState([]);
    const [configs, setConfigs] = useState([]);
    const [selection, setSelection] = useState({ featureKey: "agent", providerId: null, model: "", apiStyle: "CHAT_COMPLETIONS", ...initialSelection });
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [turns, setTurns] = useState([]);
    const [pending, setPending] = useState(false);
    const [models, setModels] = useState([]);
    const [modelsPending, setModelsPending] = useState(false);
    const [modelsResult, setModelsResult] = useState(null);
    const requestRef = useRef(null);
    const modelsRef = useRef(null);
    const loadRef = useRef(null);
    const turnId = useRef(0);
    const initialRef = useRef(initialSelection);

    const load = useCallback(async () => {
        loadRef.current?.abort();
        const controller = new AbortController();
        loadRef.current = controller;
        setLoading(true);
        setLoadError(false);
        try {
            const [providerRows, configRows] = await Promise.all([
                adminService.listProviders({ signal: controller.signal, _silent: true }),
                adminService.listFeatureConfigs({ signal: controller.signal, _silent: true }),
            ]);
            if (loadRef.current !== controller) return;
            setProviders(providerRows || []);
            setConfigs(configRows || []);
            const wanted = initialRef.current;
            const providerId = wanted.providerId || providerRows?.find((provider) => provider.enabled)?.id || null;
            const preset = configRows?.find((config) => config.featureKey === (wanted.featureKey || "agent") && config.primaryProviderId === providerId);
            setSelection((current) => ({ ...current, providerId, model: wanted.model || preset?.primaryModel || "", apiStyle: wanted.apiStyle || preset?.primaryApiStyle || "CHAT_COMPLETIONS" }));
        } catch (error) {
            if (loadRef.current === controller && !isRequestCancelled(error)) setLoadError(true);
        } finally {
            if (loadRef.current === controller) { loadRef.current = null; setLoading(false); }
        }
    }, []);

    useEffect(() => {
        load();
        return () => {
            loadRef.current?.abort(); loadRef.current = null;
            requestRef.current?.abort(); requestRef.current = null;
            modelsRef.current?.abort(); modelsRef.current = null;
        };
    }, [load]);

    const reset = () => {
        requestRef.current?.abort(); requestRef.current = null;
        setPending(false);
        setTurns([]);
    };

    const changeSelection = (patch) => {
        reset();
        modelsRef.current?.abort(); modelsRef.current = null;
        setModelsPending(false);
        setModelsResult(null);
        if (patch.providerId !== undefined && patch.providerId !== selection.providerId) setModels([]);
        setSelection((current) => ({ ...current, ...patch }));
    };

    const loadModels = async () => {
        if (!selection.providerId || modelsRef.current) return;
        const controller = new AbortController();
        modelsRef.current = controller;
        setModelsPending(true);
        setModelsResult(null);
        try {
            const result = await adminService.testProvider({ providerId: selection.providerId }, { signal: controller.signal, _silent: true, timeout: 100_000 });
            if (modelsRef.current !== controller) return;
            setModelsResult(result);
            setModels(result.ok ? result.models || [] : []);
        } catch (error) {
            if (modelsRef.current === controller && !isRequestCancelled(error)) setModelsResult({ ok: false, reason: "connection", error: { message: error?.response?.data?.message || "" } });
        } finally {
            if (modelsRef.current === controller) { modelsRef.current = null; setModelsPending(false); }
        }
    };

    const send = async ({ imageDataUrl, maxOutputTokens, imageSize }) => {
        if (requestRef.current || !prompt.trim() || !selection.providerId || !selection.model.trim()) return;
        const controller = new AbortController();
        requestRef.current = controller;
        const id = ++turnId.current;
        const text = prompt.trim();
        const image = selection.featureKey === "blog_agent_image";
        const messages = image ? [] : turns.filter((turn) => turn.result?.ok && turn.result.output?.text).slice(-8)
            .flatMap((turn) => [{ role: "user", content: turn.prompt }, { role: "assistant", content: turn.result.output.text }]);
        setPending(true);
        setTurns((current) => [...current, { id, prompt: text, model: selection.model, providerId: selection.providerId, apiStyle: selection.apiStyle, featureKey: selection.featureKey, inputImage: imageDataUrl, result: null }]);
        try {
            const result = await adminService.testFeatureModel(selection.featureKey, {
                providerId: selection.providerId, model: selection.model.trim(), apiStyle: selection.apiStyle,
                prompt: text, messages, ...(imageDataUrl ? { imageDataUrl } : {}),
                ...(maxOutputTokens ? { maxOutputTokens: Number(maxOutputTokens) } : {}),
                ...(imageSize ? { imageSize } : {}),
            }, { signal: controller.signal, _silent: true, timeout: 100_000 });
            if (requestRef.current !== controller) return;
            setTurns((current) => current.map((turn) => turn.id === id ? { ...turn, result } : turn));
            if (result.ok) setPrompt("");
        } catch (error) {
            if (requestRef.current !== controller || isRequestCancelled(error)) return;
            setTurns((current) => current.map((turn) => turn.id === id ? { ...turn, result: { ok: false, reason: "connection", error: { message: error?.response?.data?.message || "" } } } : turn));
        } finally {
            if (requestRef.current === controller) { requestRef.current = null; setPending(false); }
        }
    };

    const stopWaiting = () => {
        requestRef.current?.abort(); requestRef.current = null;
        setPending(false);
        setTurns((current) => current.map((turn) => turn.result ? turn : { ...turn, result: { ok: false, reason: "cancelled" } }));
    };

    return { providers, configs, selection, loading, loadError, load, prompt, setPrompt, turns, pending, models, modelsPending, modelsResult, changeSelection, loadModels, send, reset, stopWaiting };
}

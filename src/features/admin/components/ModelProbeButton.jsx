import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ModelProbeResult from "./ModelProbeResult";
import Button from "@shared/ui/primitives/Button";
import { isRequestCancelled } from "@api";
import { adminService } from "../services/adminService";

/** Tests the current draft and discards results when its inputs change. */
export default function ModelProbeButton({ payload, label, disabled = false, active = true }) {
    const { t } = useTranslation();
    const [pending, setPending] = useState(false);
    const [result, setResult] = useState(null);
    const requestRef = useRef(null);
    const fingerprint = JSON.stringify({ payload, active });

    useEffect(() => {
        setResult(null);
        setPending(false);
        requestRef.current?.abort();
        requestRef.current = null;
        return () => { requestRef.current?.abort(); requestRef.current = null; };
    }, [fingerprint]);

    const test = async () => {
        if (requestRef.current || disabled || !active) return;
        const controller = new AbortController();
        requestRef.current = controller;
        setPending(true);
        setResult(null);
        try {
            const config = { signal: controller.signal, _silent: true, timeout: 100_000 };
            const response = await adminService.testProvider(payload, config);
            if (requestRef.current === controller) setResult(response);
        } catch (error) {
            if (requestRef.current === controller && !isRequestCancelled(error)) {
                setResult({ ok: false, reason: "connection", latencyMs: null, error: { message: error?.response?.data?.message || t("admin.probe.connection") } });
            }
        } finally {
            if (requestRef.current === controller) {
                requestRef.current = null;
                setPending(false);
            }
        }
    };

    return <div className="space-y-2">
        <Button variant="outline" size="sm" loading={pending} disabled={disabled || !active} onClick={test}>{label}</Button>
        <ModelProbeResult result={result} />
    </div>;
}

import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "@shared/ui/primitives/Button";

/** Carries draft routing fields to the playground; opening it never calls a model. */
export default function ModelPlaygroundLink({ payload, featureKey, label, disabled = false, active = true }) {
    const navigate = useNavigate();
    const open = () => {
        const params = new URLSearchParams({ featureKey: featureKey || "agent" });
        for (const key of ["providerId", "model", "apiStyle"]) {
            if (payload[key]) params.set(key, String(payload[key]));
        }
        navigate(`/admin/model-playground?${params}`);
    };
    return <Button variant="outline" size="sm" disabled={disabled || !active} onClick={open}>{label}</Button>;
}

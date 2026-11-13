import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import CustomSelect from "@shared/ui/forms/CustomSelect";
import { formInputCls } from "@shared/ui/forms/formStyles";

export default function ProviderModelInput({
    id,
    provider,
    value,
    onChange,
    placeholder,
}) {
    const { t } = useTranslation();
    const [manual, setManual] = useState(false);
    const models = provider?.models ?? [];
    const useManual =
        manual || !models.length || Boolean(value && !models.includes(value));
    return (
        <div className="space-y-2">
            {useManual ? (
                <input
                    id={id}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={formInputCls}
                    disabled={!provider}
                    maxLength={100}
                />
            ) : (
                <CustomSelect
                    options={models.map((model) => ({
                        value: model,
                        label: model,
                    }))}
                    value={value}
                    onChange={onChange}
                    placeholder={t("admin.providers.selectModel")}
                />
            )}
            {models.length > 0 && (
                <button
                    type="button"
                    onClick={() => {
                        setManual(!useManual);
                        if (useManual && !models.includes(value)) onChange("");
                    }}
                    className="text-caption text-ink-muted underline underline-offset-4"
                >
                    {t(
                        useManual
                            ? "admin.providers.chooseModel"
                            : "admin.providers.manualModel",
                    )}
                </button>
            )}
        </div>
    );
}
